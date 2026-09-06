import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { MemberStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { MemberCreateDto, MemberUpdateDto, RegistrationCreateDto } from './members.dto';

export interface Category {
  key: string;
  labelEn: string;
  labelBn?: string;
  fee?: number;
  descEn?: string;
  descBn?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    key: 'general',
    labelEn: 'General Member',
    labelBn: 'সাধারণ সদস্য',
    fee: 1000,
    descEn: 'Annual membership',
    descBn: 'বাৎসরিক সদস্যপদ',
  },
  {
    key: 'donor',
    labelEn: 'Donor Member',
    labelBn: 'দাতা সদস্য',
    fee: 500000,
    descEn: 'Annual donor membership',
    descBn: 'বাৎসরিক দাতা সদস্যপদ',
  },
  {
    key: 'lifetime',
    labelEn: 'Lifetime Member',
    labelBn: 'আজীবন সদস্য',
    fee: 100000,
    descEn: 'One-time lifetime membership',
    descBn: 'এককালীন আজীবন সদস্যপদ',
  },
  {
    key: 'volunteer',
    labelEn: 'Volunteer',
    labelBn: 'স্বেচ্ছাসেবক',
    fee: 300,
    descEn: 'Annual volunteer form',
    descBn: 'বাৎসরিক স্বেচ্ছাসেবক ফরম',
  },
];

function isValidPhoto(photo?: string): boolean {
  if (!photo) return true;
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(photo)) return false;
  return photo.length <= 3_000_000; // ~2.2MB decoded
}

function isValidReceipt(receipt?: string): boolean {
  if (!receipt) return true;
  if (!/^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,/.test(receipt)) return false;
  return receipt.length <= 6_000_000; // ~4.5MB decoded
}

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCategories(): Promise<Category[]> {
    const setting = await this.prisma.siteSetting.findUnique({
      where: { key: 'memberCategories' },
    });
    const list = (setting?.value as unknown as Category[] | undefined) ?? [];
    const merged = DEFAULT_CATEGORIES.map((d) => {
      const found = list.find((c) => c.key === d.key);
      return found ? { ...d, ...found } : d;
    });
    for (const extra of list) {
      if (!DEFAULT_CATEGORIES.some((d) => d.key === extra.key)) merged.push(extra);
    }
    return merged;
  }

  async getPublicCategories() {
    return this.getCategories();
  }

  private async makeMemberId(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const id = `VBT-${randomBytes(3).toString('hex').toUpperCase()}`;
      const exists = await this.prisma.member.findUnique({ where: { memberId: id } });
      if (!exists) return id;
    }
    throw new BadRequestException('Could not allocate a member reference, please retry');
  }

  private async resolveUserId(dto: MemberCreateDto, authedUserId?: string): Promise<string | null> {
    if (authedUserId) return authedUserId;
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) return existing.id;
    if (dto.password) {
      const user = await this.prisma.user.create({
        data: {
          name: dto.fullName,
          email: dto.email.toLowerCase(),
          phone: dto.mobile,
          role: 'USER',
          passwordHash: await bcrypt.hash(dto.password, 10),
        },
      });
      return user.id;
    }
    return null;
  }

  async createMember(dto: MemberCreateDto, userId?: string) {
    if (dto.consent !== true) {
      throw new BadRequestException('Consent to the declaration is required');
    }
    if (!isValidPhoto(dto.photo)) {
      throw new BadRequestException('Photo must be a valid PNG/JPEG/WebP data URL under 2MB');
    }
    const categories = await this.getCategories();
    const category = categories.find((c) => c.key === dto.category);
    if (!category) {
      throw new BadRequestException(`Unknown member category: ${dto.category}`);
    }

    const [memberId, linkedUserId] = await Promise.all([
      this.makeMemberId(),
      this.resolveUserId(dto, userId),
    ]);

    const data: Prisma.MemberUncheckedCreateInput = {
      memberId,
      category: category.key,
      categoryLabelEn: category.labelEn,
      categoryLabelBn: category.labelBn,
      fee: category.fee,
      fullName: dto.fullName,
      fatherName: dto.fatherName,
      motherName: dto.motherName,
      nidNo: dto.nidNo,
      birthDate: dto.birthDate,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      mobile: dto.mobile,
      email: dto.email.toLowerCase(),
      presentAddress: dto.presentAddress,
      permanentAddress: dto.permanentAddress,
      education: dto.education,
      profession: dto.profession,
      institution: dto.institution,
      emergencyContact: dto.emergencyContact,
      emergencyMobile: dto.emergencyMobile,
      volunteerExperience: dto.volunteerExperience,
      reference: dto.reference,
      fbLink: dto.fbLink,
      photo: dto.photo,
      consent: dto.consent,
      status: 'PENDING',
      ...(linkedUserId ? { userId: linkedUserId } : {}),
    };

    const member = await this.prisma.member.create({ data });
    return {
      success: true,
      id: member.id,
      memberId: member.memberId,
      status: member.status,
      category: member.category,
      message:
        'Application submitted. Our membership committee will review it and you can track the status with your member reference.',
    };
  }

  async getStatusByRef(ref: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ memberId: ref }, { id: ref }] },
      select: {
        id: true,
        memberId: true,
        category: true,
        categoryLabelEn: true,
        categoryLabelBn: true,
        fee: true,
        status: true,
        createdAt: true,
        adminNote: true,
      },
    });
    if (!member) throw new NotFoundException('Member reference not found');
    return member;
  }

  async getMyMemberships(userId: string) {
    return this.prisma.member.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        memberId: true,
        category: true,
        categoryLabelEn: true,
        categoryLabelBn: true,
        fee: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async adminList(options: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: Prisma.MemberWhereInput = {
      ...(options.status ? { status: options.status as MemberStatus } : {}),
      ...(options.category ? { category: options.category } : {}),
      ...(options.search
        ? {
            OR: [
              { fullName: { contains: options.search, mode: 'insensitive' } },
              { email: { contains: options.search, mode: 'insensitive' } },
              { mobile: { contains: options.search } },
              { memberId: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 50;
    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
          id: true,
          memberId: true,
          category: true,
          categoryLabelEn: true,
          categoryLabelBn: true,
          fee: true,
          fullName: true,
          email: true,
          mobile: true,
          gender: true,
          bloodGroup: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.member.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async adminStats() {
    const [total, byStatus, byCategory] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.groupBy({ by: ['status'], _count: true }),
      this.prisma.member.groupBy({ by: ['category'], _count: true }),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count])),
    };
  }

  async adminGet(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async adminSetStatus(id: string, status: MemberStatus, note?: string, adminId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        status,
        adminNote: note,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedById: status === 'APPROVED' ? adminId : null,
      },
    });
    return {
      success: true,
      memberId: updated.memberId,
      status: updated.status,
      adminNote: updated.adminNote,
      approvedAt: updated.approvedAt,
    };
  }

  async adminUpdate(id: string, dto: MemberUpdateDto) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    if (dto.photo !== undefined && !isValidPhoto(dto.photo)) {
      throw new BadRequestException('Photo must be a valid PNG/JPEG/WebP data URL under 2MB');
    }
    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        category: dto.category,
        fullName: dto.fullName,
        fatherName: dto.fatherName,
        motherName: dto.motherName,
        nidNo: dto.nidNo,
        birthDate: dto.birthDate,
        gender: dto.gender,
        bloodGroup: dto.bloodGroup,
        mobile: dto.mobile,
        email: dto.email?.toLowerCase(),
        presentAddress: dto.presentAddress,
        permanentAddress: dto.permanentAddress,
        education: dto.education,
        profession: dto.profession,
        institution: dto.institution,
        emergencyContact: dto.emergencyContact,
        emergencyMobile: dto.emergencyMobile,
        volunteerExperience: dto.volunteerExperience,
        reference: dto.reference,
        fbLink: dto.fbLink,
        photo: dto.photo,
      },
    });
    return { success: true, id: updated.id, memberId: updated.memberId };
  }

  async adminRemove(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.member.delete({ where: { id } });
    return { success: true };
  }

  async createRegistration(dto: RegistrationCreateDto) {
    if (dto.consent !== undefined && dto.consent !== true) {
      throw new BadRequestException('Consent to the declaration is required');
    }
    if (!dto.bkashTrxId || !dto.receipt) {
      throw new BadRequestException('bKash transaction ID and payment receipt are required');
    }
    if (!dto.paymentType) {
      throw new BadRequestException('A payment type must be selected');
    }
    const VALID_PAYMENT_TYPES = ['full_6250', 'full_7250', 'advance_2000'];
    if (!VALID_PAYMENT_TYPES.includes(dto.paymentType)) {
      throw new BadRequestException('Invalid payment type selected');
    }
    if (!isValidReceipt(dto.receipt)) {
      throw new BadRequestException('Receipt must be a PNG/JPG/WebP image or PDF under 5MB');
    }
    const registration = await this.prisma.registration.create({
      data: {
        name: dto.name.trim(),
        mobile: dto.mobile.trim(),
        emergency: dto.emergency?.trim(),
        organization: dto.organization?.trim(),
        bloodGroup: dto.bloodGroup,
        address: dto.address?.trim(),
        reference: dto.reference?.trim(),
        fbProfile: dto.fbProfile?.trim(),
        photo: dto.photo || null,
        paymentType: dto.paymentType,
        bkashTrxId: dto.bkashTrxId.trim(),
        receipt: dto.receipt,
        consent: dto.consent ?? true,
        slug: dto.slug || 'saint-martin-trip-2026',
        tag: dto.tag || 'saintmartin',
      },
    });
    return {
      success: true,
      id: registration.id,
      tag: registration.tag,
      message:
        'Registration recorded. Our team will verify your payment and contact you shortly to confirm your seat.',
    };
  }

  async adminListRegistrations(options: {
    tag?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: Prisma.RegistrationWhereInput = {
      ...(options.tag ? { tag: options.tag } : {}),
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { mobile: { contains: options.search } },
              { organization: { contains: options.search, mode: 'insensitive' } },
              { tag: { contains: options.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 50;
    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
          id: true,
          slug: true,
          tag: true,
          name: true,
          mobile: true,
          emergency: true,
          organization: true,
          bloodGroup: true,
          address: true,
          reference: true,
          fbProfile: true,
          photo: true,
          paymentType: true,
          bkashTrxId: true,
          receipt: true,
          adminNote: true,
          approvedAt: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.registration.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async adminSetRegistrationStatus(id: string, status: string, note?: string) {
    const registration = await this.prisma.registration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundException('Registration not found');
    const updated = await this.prisma.registration.update({
      where: { id },
      data: {
        status,
        adminNote: note,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    });
    return {
      success: true,
      id: updated.id,
      status: updated.status,
      adminNote: updated.adminNote,
      approvedAt: updated.approvedAt,
    };
  }

  async adminRegistrationStats() {
    const [total, byTag, byStatus] = await Promise.all([
      this.prisma.registration.count(),
      this.prisma.registration.groupBy({ by: ['tag'], _count: true }),
      this.prisma.registration.groupBy({ by: ['status'], _count: true }),
    ]);
    return {
      total,
      byTag: Object.fromEntries(byTag.map((t) => [t.tag, t._count])),
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    };
  }

  async adminRemoveRegistration(id: string) {
    const registration = await this.prisma.registration.findUnique({ where: { id } });
    if (!registration) throw new NotFoundException('Registration not found');
    await this.prisma.registration.delete({ where: { id } });
    return { success: true };
  }
}
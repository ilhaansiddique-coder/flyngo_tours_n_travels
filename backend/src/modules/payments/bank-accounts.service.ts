import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface BankAccountInput {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  routingNumber?: string;
  swiftCode?: string;
  instructions?: string;
  logoUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublic(tenantId: string) {
    return this.prisma.bankAccount.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { bankName: 'asc' }],
      select: {
        id: true,
        bankName: true,
        accountName: true,
        accountNumber: true,
        branch: true,
        routingNumber: true,
        swiftCode: true,
        instructions: true,
        logoUrl: true,
      },
    });
  }

  listAdmin(tenantId: string) {
    return this.prisma.bankAccount.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(tenantId: string, data: BankAccountInput) {
    this.assertRequired(data);
    return this.prisma.bankAccount.create({
      data: {
        tenantId,
        bankName: data.bankName.trim(),
        accountName: data.accountName.trim(),
        accountNumber: data.accountNumber.trim(),
        branch: data.branch?.trim() || null,
        routingNumber: data.routingNumber?.trim() || null,
        swiftCode: data.swiftCode?.trim() || null,
        instructions: data.instructions?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: Partial<BankAccountInput>) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Bank account not found');
    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        ...(data.bankName !== undefined ? { bankName: data.bankName.trim() } : {}),
        ...(data.accountName !== undefined ? { accountName: data.accountName.trim() } : {}),
        ...(data.accountNumber !== undefined ? { accountNumber: data.accountNumber.trim() } : {}),
        ...(data.branch !== undefined ? { branch: data.branch?.trim() || null } : {}),
        ...(data.routingNumber !== undefined ? { routingNumber: data.routingNumber?.trim() || null } : {}),
        ...(data.swiftCode !== undefined ? { swiftCode: data.swiftCode?.trim() || null } : {}),
        ...(data.instructions !== undefined ? { instructions: data.instructions?.trim() || null } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl?.trim() || null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Bank account not found');
    await this.prisma.bankAccount.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true };
  }

  private assertRequired(data: BankAccountInput) {
    if (!data.bankName?.trim()) throw new BadRequestException('bankName is required');
    if (!data.accountName?.trim()) throw new BadRequestException('accountName is required');
    if (!data.accountNumber?.trim()) throw new BadRequestException('accountNumber is required');
  }
}

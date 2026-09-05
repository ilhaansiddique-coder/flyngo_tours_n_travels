import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  SubscribeDto,
  ContactDto,
  DonationDto,
  ApplicationDto,
} from './submissions.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscriber(dto: SubscribeDto) {
    try {
      const subscriber = await this.prisma.subscriber.create({
        data: { email: dto.email.toLowerCase() },
      });
      return { success: true, id: subscriber.id };
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('You are already subscribed');
      }
      throw error;
    }
  }

  createContact(dto: ContactDto) {
    return this.prisma.contactMessage.create({ data: dto }).then(() => ({
      success: true,
    }));
  }

  createDonation(dto: DonationDto) {
    const amount = Number(dto.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ConflictException('Please provide a valid donation amount');
    }
    return this.prisma.donation
      .create({
        data: {
          name: dto.name,
          phoneOrEmail: dto.phoneOrEmail,
          amount,
          type: dto.type ?? 'REGULAR',
          txnId: `VBT-${randomUUID().slice(0, 8).toUpperCase()}`,
          status: 'PENDING',
        },
      })
      .then((donation) => ({
        success: true,
        id: donation.id,
        txnId: donation.txnId,
        status: donation.status,
        message:
          'Reference stored. Complete the payment to your selected gateway to confirm this donation.',
      }));
  }

  createApplication(dto: ApplicationDto) {
    return this.prisma.application
      .create({
        data: {
          type: dto.type,
          fullName: dto.fullName,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          address: dto.address,
          data: (dto.data as object) ?? undefined,
        },
      })
      .then((app) => ({
        success: true,
        id: app.id,
        status: app.status,
        message: 'Application received. Our team will contact you shortly.',
      }));
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export const WALLET_PROVIDERS = ['bkash', 'nagad', 'rocket', 'upay', 'tap', 'surecash', 'mcash'] as const;
export type WalletProvider = (typeof WALLET_PROVIDERS)[number];

const ACCOUNT_TYPES = ['personal', 'merchant'] as const;
const BD_WALLET_NUMBER = /^01[3-9]\d{8}$/;

export interface MobileWalletInput {
  provider: string;
  accountName: string;
  walletNumber: string;
  accountType?: string;
  instructions?: string;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class MobileWalletsService {
  constructor(private readonly prisma: PrismaService) {}

  listPublic(tenantId: string) {
    return this.prisma.mobileWallet.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { provider: 'asc' }],
      select: {
        id: true,
        provider: true,
        accountName: true,
        walletNumber: true,
        accountType: true,
        instructions: true,
      },
    });
  }

  listAdmin(tenantId: string) {
    return this.prisma.mobileWallet.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(tenantId: string, data: MobileWalletInput) {
    this.assertRequired(data);
    return this.prisma.mobileWallet.create({
      data: {
        tenantId,
        provider: data.provider,
        accountName: data.accountName.trim(),
        walletNumber: data.walletNumber.trim(),
        accountType: data.accountType || 'personal',
        instructions: data.instructions?.trim() || null,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, tenantId: string, data: Partial<MobileWalletInput>) {
    const existing = await this.prisma.mobileWallet.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Mobile wallet not found');
    if (data.provider !== undefined || data.walletNumber !== undefined || data.accountName !== undefined) {
      this.assertRequired({
        provider: data.provider ?? existing.provider,
        accountName: data.accountName ?? existing.accountName,
        walletNumber: data.walletNumber ?? existing.walletNumber,
        accountType: data.accountType ?? existing.accountType,
      });
    }
    return this.prisma.mobileWallet.update({
      where: { id },
      data: {
        ...(data.provider !== undefined ? { provider: data.provider } : {}),
        ...(data.accountName !== undefined ? { accountName: data.accountName.trim() } : {}),
        ...(data.walletNumber !== undefined ? { walletNumber: data.walletNumber.trim() } : {}),
        ...(data.accountType !== undefined ? { accountType: data.accountType } : {}),
        ...(data.instructions !== undefined ? { instructions: data.instructions?.trim() || null } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.mobileWallet.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Mobile wallet not found');
    await this.prisma.mobileWallet.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { success: true };
  }

  private assertRequired(data: MobileWalletInput) {
    if (!WALLET_PROVIDERS.includes(data.provider as WalletProvider)) {
      throw new BadRequestException(`provider must be one of: ${WALLET_PROVIDERS.join(', ')}`);
    }
    if (!data.accountName?.trim()) throw new BadRequestException('accountName is required');
    const number = data.walletNumber?.trim() || '';
    if (!BD_WALLET_NUMBER.test(number)) {
      throw new BadRequestException('walletNumber must be a valid BD mobile number (01XXXXXXXXX)');
    }
    if (data.accountType && !ACCOUNT_TYPES.includes(data.accountType as (typeof ACCOUNT_TYPES)[number])) {
      throw new BadRequestException('accountType must be personal or merchant');
    }
  }
}

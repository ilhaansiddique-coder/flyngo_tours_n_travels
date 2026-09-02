import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum, IsInt, IsNumber, IsOptional, IsString, IsArray, IsObject, Min,
} from 'class-validator';

export enum LoyaltyTransactionType {
  REFERRAL_SIGNUP = 'referral_signup',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_COMPLETION = 'booking_completion',
  REDEMPTION = 'redemption',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  REFUND = 'refund',
}

export enum ProductType {
  TOUR = 'tour',
  HOTEL = 'hotel',
  FLIGHT = 'flight',
  VISA = 'visa',
  HAJJ = 'hajj',
  UMRAH = 'umrah',
  TRANSPORT = 'transport',
}

export class AdjustPointsDto {
  @ApiProperty({ example: 500, description: 'Positive to credit, negative to debit' })
  @IsInt()
  points: number;

  @ApiProperty({ example: 'Manual reward for support issue #1234' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, example: 'csr-2026' })
  @IsOptional()
  @IsString()
  reference?: string;
}

export class RedeemPointsDto {
  @ApiProperty({ example: 1000, description: 'Number of points to redeem' })
  @IsInt()
  @Min(1)
  points: number;

  @ApiProperty({ required: false, example: 'cm0abc123' })
  @IsOptional()
  @IsString()
  bookingId?: string;
}

export class UpsertProductRuleDto {
  @ApiProperty({ enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ required: false, example: 'cm0abc123' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ required: false, example: 'Cox\'s Bazar Beach Tour' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ example: 500, description: 'Direct points awarded per booking' })
  @IsInt()
  @Min(0)
  pointsValue: number;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsInt()
  maxPoints?: number;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  minSpend?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false, example: '2026-01-01' })
  @IsOptional()
  startsAt?: string;

  @ApiProperty({ required: false, example: '2026-12-31' })
  @IsOptional()
  endsAt?: string;
}

export class UpsertTierDto {
  @ApiProperty({ example: 'Silver' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'silver' })
  @IsString()
  slug: string;

  @ApiProperty({ example: '#C0C0C0' })
  @IsString()
  color: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  starCount: number;

  @ApiProperty({ example: 10000 })
  @IsInt()
  @Min(0)
  minPoints: number;

  @ApiProperty({ example: 1.0 })
  @IsNumber()
  redemptionMultiplier: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  benefits?: any;

  @ApiProperty({ required: false, example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  isActive?: boolean;
}

export class BulkAdjustPointsDto {
  @ApiProperty({ type: [AdjustPointsDto] })
  @IsArray()
  items: AdjustPointsDto[];

  @ApiProperty({ example: 'Mass reward for Q1 customer survey' })
  @IsString()
  reason: string;
}

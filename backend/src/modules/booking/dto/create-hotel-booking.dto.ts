import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HotelLeadGuestDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 120)
  lastName!: string;

  @ApiPropertyOptional({ description: 'Email (optional — phone is the primary contact)' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  @Matches(/^[+0-9 ()\-]{7,20}$/)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 60)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 40)
  passportNumber?: string;
}

export class HotelAdditionalGuestDto {
  @ApiProperty()
  @IsString()
  @Length(1, 120)
  fullName!: string;

  @ApiPropertyOptional({ description: 'Required when type is child or infant' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({ enum: ['adult', 'child', 'infant'], default: 'adult' })
  @IsOptional()
  @IsIn(['adult', 'child', 'infant'])
  type?: 'adult' | 'child' | 'infant';
}

export class CreateHotelBookingDto {
  @ApiProperty({ description: 'Hotel UUID' })
  @IsString()
  hotelId!: string;

  @ApiProperty({ description: 'Room UUID (must belong to the hotel)' })
  @IsString()
  roomId!: string;

  @ApiProperty({ description: 'Check-in date (ISO)' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ description: 'Check-out date (ISO, must be after checkInDate)' })
  @IsDateString()
  checkOutDate!: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  roomsCount?: number = 1;

  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  adults?: number = 1;

  @ApiPropertyOptional({ default: 0, minimum: 0, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  children?: number = 0;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  childAges?: number[];

  @ApiPropertyOptional({ enum: ['RO', 'BB', 'HB', 'FB', 'AI'] })
  @IsOptional()
  @IsIn(['RO', 'BB', 'HB', 'FB', 'AI'])
  mealPlan?: 'RO' | 'BB' | 'HB' | 'FB' | 'AI';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  arrivalTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 20)
  flightNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 40)
  couponCode?: string;

  @ApiProperty({ type: HotelLeadGuestDto })
  @ValidateNested()
  @Type(() => HotelLeadGuestDto)
  leadGuest!: HotelLeadGuestDto;

  @ApiPropertyOptional({ type: [HotelAdditionalGuestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelAdditionalGuestDto)
  additionalGuests?: HotelAdditionalGuestDto[];
}

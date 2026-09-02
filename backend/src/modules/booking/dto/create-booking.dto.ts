import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ enum: ['tour', 'hotel', 'flight', 'visa', 'package'] })
  @IsIn(['tour', 'hotel', 'flight', 'visa', 'package'])
  type!: 'tour' | 'hotel' | 'flight' | 'visa' | 'package';

  @ApiProperty()
  @IsString()
  itemId!: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guests?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 40)
  couponCode?: string;
}

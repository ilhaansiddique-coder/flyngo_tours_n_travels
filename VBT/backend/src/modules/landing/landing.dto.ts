import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LandingPageUpsertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleEn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleBn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  subtitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  subtitleBn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3_000_000)
  coverPhoto?: string;

  @IsOptional()
  @IsArray()
  sections?: unknown[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;
}
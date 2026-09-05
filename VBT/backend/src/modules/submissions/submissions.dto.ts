import { IsEmail, IsIn, IsNotEmpty, IsNumberString, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeDto {
  @IsEmail()
  email!: string;
}

export class ContactDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}

export class DonationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @IsNotEmpty()
  phoneOrEmail!: string;

  @IsNumberString()
  amount!: string;

  @IsOptional()
  @IsString()
  @IsIn(['REGULAR', 'ZAKAT', 'QURBANI', 'MEMBERSHIP'])
  type?: string;
}

export class ApplicationDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['membership', 'volunteer', 'career'])
  type!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  data?: Record<string, unknown>;
}
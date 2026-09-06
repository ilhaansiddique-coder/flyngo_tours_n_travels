import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

export class MemberCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  category!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  mobile!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fatherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  motherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  nidNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(GENDERS)
  gender?: string;

  @IsOptional()
  @IsString()
  @IsIn(BLOOD_GROUPS)
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  presentAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  education?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  profession?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyMobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  volunteerExperience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  fbLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4_000_000)
  photo?: string;

  @IsBoolean()
  consent!: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password?: string;
}

export class MemberUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  fatherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  motherName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  nidNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(GENDERS)
  gender?: string;

  @IsOptional()
  @IsString()
  @IsIn(BLOOD_GROUPS)
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  presentAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  education?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  profession?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  emergencyMobile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  volunteerExperience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  fbLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4_000_000)
  photo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: string;
}

export class RegistrationCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  mobile!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  emergency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organization?: string;

  @IsOptional()
  @IsString()
  @IsIn(BLOOD_GROUPS)
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  fbProfile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4_000_000)
  photo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['full_6250', 'full_7250', 'advance_2000'])
  paymentType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  bkashTrxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(6_000_000)
  receipt?: string;

  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;
}

export class MemberStatusDto {
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RegistrationStatusDto {
  @IsString()
  @IsIn(['NEW', 'APPROVED', 'REJECTED'])
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
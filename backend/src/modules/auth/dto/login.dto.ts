import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email (optional if phone provided)', example: 'user@example.com', required: false })
  @ValidateIf((o) => o.email != null && o.email !== '')
  @IsEmail({}, { message: 'Email must be a valid address' })
  email?: string;

  // Mirrors `email`: the frontend sends both keys with the unused one blank.
  // Phone is only validated when no email was supplied, so it stays required
  // for phone logins while no longer rejecting every email login.
  @ApiProperty({ description: 'Phone number (required if email not provided)', example: '+8801712345678', required: false })
  @ValidateIf((o) => !o.email)
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone?: string;

  // Login must NOT impose registration-style length/complexity rules — it only
  // needs the password to check against the stored hash. Enforcing MinLength(8)
  // here locks out any account whose password is shorter (e.g. a seeded admin),
  // so we require only that it is present.
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

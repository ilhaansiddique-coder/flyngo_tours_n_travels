import { IsEmail, IsString, MinLength, MaxLength, ValidateIf } from 'class-validator';
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

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

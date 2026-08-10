import { IsEmail, IsString, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email (optional if phone provided)', example: 'user@example.com', required: false })
  @ValidateIf((o) => o.email != null && o.email !== '')
  @IsEmail({}, { message: 'Email must be a valid address' })
  email?: string;

  @ApiProperty({ description: 'Phone number in international format', example: '+8801712345678' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

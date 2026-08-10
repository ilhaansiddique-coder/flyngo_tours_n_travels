import { IsEmail, IsString, MinLength, MaxLength, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @ValidateIf((o) => o.email != null && o.email !== '')
  @IsEmail({}, { message: 'Email must be a valid address' })
  email?: string;

  @ApiProperty({ example: '+8801712345678' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;
}

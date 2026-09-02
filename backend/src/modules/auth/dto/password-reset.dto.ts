import { IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** Step 1 — ask which delivery channels are available for an identifier. */
export class ForgotPasswordOptionsDto {
  @ApiProperty({ description: 'Email or phone the account uses', example: '+880 1712345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  identifier: string;
}

/** Step 2 — send the reset link over the chosen channel. */
export class SendPasswordResetDto {
  @ApiProperty({ example: '+880 1712345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  identifier: string;

  @ApiProperty({ enum: ['email', 'sms'] })
  @IsIn(['email', 'sms'])
  channel: 'email' | 'sms';
}

/** Step 3 — set a new password using the token from the reset link. */
export class ResetPasswordDto {
  @ApiProperty({ description: 'Token from the reset link' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsPhoneNumber, MinLength, Length } from 'class-validator';

export class CreateUserDto {
  // @ApiProperty({
  //   description: 'User wallet address',
  //   example: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
  //   required: false
  // })
  // @IsOptional()
  // @IsString()
  // walletAddress?: string;

  @ApiProperty({
    description: 'User phone number in international format',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    required: false,
    minLength: 8
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '123456',
    required: false,
    minLength: 6,
    maxLength: 6
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  oTP?: string;
}
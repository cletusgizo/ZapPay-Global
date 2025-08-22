import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsPhoneNumber } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: true
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  // @ApiProperty({
  //   description: 'User wallet address',
  //   example: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
  //   required: false
  // })
  // @IsOptional()
  // @IsString()
  // walletAddress?: string;

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
}
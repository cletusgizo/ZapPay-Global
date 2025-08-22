import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
    description: 'User password',
    example: 'SecurePass123!',
    required: false
  })
  @IsOptional()
  @IsString()
  password?: string;
}
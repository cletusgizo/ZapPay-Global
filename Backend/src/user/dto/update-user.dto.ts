import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
//   @ApiProperty({
//     description: 'User wallet address',
//     example: '0x123E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a456',
//     required: false
//   })
//   walletAddress?: string;

  @ApiProperty({
    description: 'User phone number in international format',
    example: '+0987654321',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'NewSecurePass123!',
    required: false,
    minLength: 8
  })
  password?: string;

  @ApiProperty({
    description: '6-digit OTP code',
    example: '654321',
    required: false,
    minLength: 6,
    maxLength: 6
  })
  oTP?: string;
}
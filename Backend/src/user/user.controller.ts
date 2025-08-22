import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete 
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user with wallet address, phone, password, or OTP'
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      walletUser: {
        summary: 'Create user with wallet',
        value: {
          walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123'
        }
      },
      phoneUser: {
        summary: 'Create user with phone',
        value: {
          phone: '+1234567890',
          password: 'SecurePass123!'
        }
      },
      completeUser: {
        summary: 'Create complete user',
        value: {
          walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
          phone: '+1234567890',
          password: 'SecurePass123!',
          oTP: '123456'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        message: 'User created successfully',
        data: {
          id: '12345',
          walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
          phone: '+1234567890',
          isVerified: false,
          createdAt: '2024-08-22T10:30:00Z',
          updatedAt: '2024-08-22T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Invalid user data',
        errors: [
          'Phone number is invalid',
          'Wallet address format is incorrect'
        ]
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already exists',
    schema: {
      example: {
        success: false,
        message: 'User with this wallet address already exists'
      }
    }
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Users retrieved successfully',
        data: [
          {
            id: '12345',
            walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
            phone: '+1234567890',
            isVerified: true,
            createdAt: '2024-08-22T10:30:00Z',
            updatedAt: '2024-08-22T10:30:00Z'
          },
          {
            id: '12346',
            walletAddress: '0x123E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a456',
            phone: '+0987654321',
            isVerified: false,
            createdAt: '2024-08-22T11:00:00Z',
            updatedAt: '2024-08-22T11:00:00Z'
          }
        ],
        total: 2,
        page: 1,
        limit: 10
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        success: false,
        message: 'Unable to retrieve users'
      }
    }
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user identifier',
    example: '12345',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'User found and retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: '12345',
          walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
          phone: '+1234567890',
          isVerified: true,
          createdAt: '2024-08-22T10:30:00Z',
          updatedAt: '2024-08-22T10:30:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User with ID 12345 not found'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid ID format',
    schema: {
      example: {
        success: false,
        message: 'Invalid user ID format'
      }
    }
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information by ID. Only provided fields will be updated.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user identifier',
    example: '12345',
    type: 'string'
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateWallet: {
        summary: 'Update wallet address',
        value: {
          walletAddress: '0x123E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a456'
        }
      },
      updatePhone: {
        summary: 'Update phone number',
        value: {
          phone: '+0987654321'
        }
      },
      updatePassword: {
        summary: 'Update password',
        value: {
          password: 'NewSecurePass123!'
        }
      },
      partialUpdate: {
        summary: 'Partial update',
        value: {
          phone: '+1122334455',
          walletAddress: '0x789E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a789'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: '12345',
          walletAddress: '0x123E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a456',
          phone: '+0987654321',
          isVerified: true,
          createdAt: '2024-08-22T10:30:00Z',
          updatedAt: '2024-08-22T15:45:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User with ID 12345 not found'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid update data',
    schema: {
      example: {
        success: false,
        message: 'Invalid update data',
        errors: [
          'Phone number format is invalid',
          'Wallet address is already in use'
        ]
      }
    }
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently delete a user from the system'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique user identifier',
    example: '12345',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'User deleted successfully',
        data: {
          id: '12345',
          deletedAt: '2024-08-22T16:00:00Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        success: false,
        message: 'User with ID 12345 not found'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid ID format',
    schema: {
      example: {
        success: false,
        message: 'Invalid user ID format'
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot delete user',
    schema: {
      example: {
        success: false,
        message: 'Cannot delete user with active transactions'
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
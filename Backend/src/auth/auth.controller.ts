import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email, phone, wallet address, or password'
  })
  @ApiBody({
    type: CreateAuthDto,
    examples: {
      emailRegistration: {
        summary: 'Email Registration',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      },
      phoneRegistration: {
        summary: 'Phone Registration',
        value: {
          phone: '+1234567890',
          password: 'SecurePass123!'
        }
      },

      fullRegistration: {
        summary: 'Complete Registration',
        value: {
          email: 'john.doe@example.com',
          phone: '+1234567890',
          password: 'SecurePass123!',
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Registration successful. Please verify your account.',
        data: {
          userId: '12345',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          isVerified: false
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
        message: 'Email already exists'
      }
    }
  })
  async register(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email, phone, wallet address, or password'
  })
  @ApiBody({
    type: LoginAuthDto,
    examples: {
      emailLogin: {
        summary: 'Email Login',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      },
      phoneLogin: {
        summary: 'Phone Login',
        value: {
          phone: '+1234567890',
          password: 'SecurePass123!'
        }
      },
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            userId: '12345',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    schema: {
      example: {
        success: false,
        message: 'Invalid credentials'
      }
    }
  })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify the 6-digit OTP sent to user'
  })
  @ApiBody({
    type: VerifyOtpDto,
    examples: {
      verifyOtpExample: {
        summary: 'OTP Verification Example',
        value: {
          userId: '12345',
          otp: '123456'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP verified successfully',
        data: {
          userId: '12345',
          isVerified: true
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired OTP'
      }
    }
  })
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }

  @Post('resend-otp/:userId')
  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Resend OTP to the user for verification'
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to resend OTP for',
    example: '12345'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    schema: {
      example: {
        success: true,
        message: 'OTP resent successfully',
        data: {
          userId: '12345',
          otpSentTo: 'john.doe@example.com'
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
        message: 'User not found'
      }
    }
  })
  async resendOTP(@Param('userId') userId: string) {
    return this.authService.resendOTP(userId);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Send password reset link to user email'
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      forgotPasswordExample: {
        summary: 'Forgot Password Example',
        value: {
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset link sent successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset link sent to your email',
        data: {
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Email not found',
    schema: {
      example: {
        success: false,
        message: 'Email not found in our records'
      }
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token'
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      resetPasswordExample: {
        summary: 'Reset Password Example',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          newPassword: 'NewSecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        success: true,
        message: 'Password reset successfully',
        data: {
          userId: '12345'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired reset token'
      }
    }
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token'
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      refreshTokenExample: {
        summary: 'Refresh Token Example',
        value: {
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
    schema: {
      example: {
        success: false,
        message: 'Invalid refresh token'
      }
    }
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        userId: '12345',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        walletAddress: '0x742E4C4C2F925e5C3F2c8B1A7c04c8Ae45D5a123',
        isVerified: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized access'
      }
    }
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logout successful',
        data: {
          userId: '12345'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized access'
      }
    }
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }
}
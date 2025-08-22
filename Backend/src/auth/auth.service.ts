import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    try {
      
      const existingUser = await this.userService.findByEmail(
        createAuthDto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }


      // if (createAuthDto.email) {
      //   const existingWallet = await this.userService.findByWalletAddress(
      //     createAuthDto.walletAddress,
      //   );
      //   if (existingWallet) {
      //     throw new ConflictException('Wallet address already registered');
      //   }
      // }

     
      const user = await this.userService.create(createAuthDto);

     
      const userId = (user as any)._id.toString();
      const otpResult = await this.userService.sendOTPToEmail(
        userId,
        createAuthDto.email,
      );

      if (!otpResult.success) {
        
        await this.userService.remove(userId);
        throw new BadRequestException('Failed to send verification email');
      }

      return {
        success: true,
        message:
          'User registered successfully. Please check your email for OTP verification.',
        userId: userId,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    try {
      let user;

      
      if (loginAuthDto.email) {
        user = await this.userService.findByEmail(loginAuthDto.email);
      } else if (loginAuthDto.phone) {
        user = await this.userService.findByPhone(loginAuthDto.phone);
      } 
      // else if (loginAuthDto.walletAddress) {
      //   user = await this.userService.findByWalletAddress(
      //     loginAuthDto.walletAddress,
      //   );
      // }

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      
      if (!user.isVerified) {
       
        if (user.email) {
          const userId = (user as any)._id.toString();
          await this.userService.sendOTPToEmail(userId, user.email);
        }
        throw new UnauthorizedException(
          'Please verify your account. A new OTP has been sent to your email.',
        );
      }

      
      if (loginAuthDto.password) {
        const userId = (user as any)._id.toString();
        const isPasswordValid = await this.userService.validatePassword(
          userId,
          loginAuthDto.password,
        );

        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
      }

      
      const userId = (user as any)._id.toString();
      await this.userService.updateLastLogin(userId);

     
      const payload = {
        sub: userId,
        email: user.email,
       // walletAddress: user.walletAddress,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: userId,
          email: user.email,
          phone: user.phone,
          walletAddress: user.walletAddress,
          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed');
    }
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    try {
      const result = await this.userService.verifyEmailOTP(
        verifyOtpDto.userId,
        verifyOtpDto.otp,
      );

      if (!result.success) {
        throw new BadRequestException(result.message);
      }

      
      const user = await this.userService.findOne(verifyOtpDto.userId);

    
      if (user.email) {
        await this.mailService.sendWelcomeEmail(user.email);
      }

      
      const userId = (user as any)._id.toString();
      const payload = {
        sub: userId,
        email: user.email,
        
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      return {
        success: true,
        message: 'Account verified successfully',
        user: {
          id: userId,
          email: user.email,
          phone: user.phone,

          isVerified: user.isVerified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('OTP verification failed');
    }
  }

  async resendOTP(userId: string) {
    try {
      const user = await this.userService.findOne(userId);

      if (!user.email) {
        throw new BadRequestException('No email address found for this user');
      }

      if (user.isVerified) {
        throw new BadRequestException('User is already verified');
      }

      const result = await this.userService.sendOTPToEmail(userId, user.email);

      return {
        success: result.success,
        message: result.success
          ? 'OTP sent successfully'
          : 'Failed to send OTP',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to resend OTP');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userService.findByEmail(forgotPasswordDto.email);

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message:
            'If an account with this email exists, a password reset link has been sent.',
        };
      }

      
      const userId = (user as any)._id.toString();
      const payload = {
        sub: userId,
        email: user.email,
        type: 'password-reset',
      };
      const resetToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_RESET_SECRET'),
        expiresIn: '1h',
      });

      
      if (!user.email) {
        throw new BadRequestException('User email not found');
      }
      await this.mailService.sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    } catch (error) {
      throw new BadRequestException('Failed to process password reset request');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const resetSecret = this.configService.get('JWT_RESET_SECRET');
      if (!resetSecret) {
        throw new BadRequestException('Reset secret not configured');
      }

      
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: resetSecret,
      });

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

     
      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );
      await this.userService.update(payload.sub, { password: hashedPassword });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }
      throw new BadRequestException('Failed to reset password');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new UnauthorizedException('Refresh secret not configured');
      }

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.userService.findOne(payload.sub);

      if (!user || !user.isVerified) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      
      const userId = (user as any)._id.toString();
      const newPayload = {
        sub: userId,
        email: user.email,
      };
      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        success: true,
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    try {
      return await this.userService.findOne(userId);
    } catch (error) {
      return null;
    }
  }

  async logout(userId: string) {
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

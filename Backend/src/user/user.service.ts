import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
    
      if (createUserDto.password) {
        const saltRounds = 10;
        createUserDto.password = await bcrypt.hash(createUserDto.password, saltRounds);
      }

      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Wallet address already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().select('-password -oTP').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password -oTP').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // async findByWalletAddress(walletAddress: string): Promise<User | null> {
  //   return await this.userModel.findOne({ walletAddress }).exec();
  // }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.userModel.findOne({ phone }).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
   
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password -oTP')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async verifyUser(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { isVerified: true, $unset: { oTP: 1 } },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('password').exec();
    if (!user || !user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  async setOTP(userId: string, otp: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { oTP: otp }).exec();
  }

  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).select('oTP').exec();
    return user?.oTP === otp;
  }

  // Email OTP Methods
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async sendEmailOTP(email: string, otp: string): Promise<boolean> {
    return await this.mailService.sendOTPEmail(email, otp);
  }

  async sendOTPToEmail(userId: string, email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const otp = this.generateOTP();
      
      // Save OTP to user record
      await this.userModel.findByIdAndUpdate(userId, { 
        oTP: otp,
        // Optional: Add OTP expiration time
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      }).exec();

      const emailSent = await this.sendEmailOTP(email, otp);
      
      if (emailSent) {
        return { success: true, message: 'OTP sent successfully to your email' };
      } else {
        return { success: false, message: 'Failed to send OTP email' };
      }
    } catch (error) {
      console.error('Error in sendOTPToEmail:', error);
      return { success: false, message: 'An error occurred while sending OTP' };
    }
  }

  async verifyEmailOTP(userId: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userModel.findById(userId).select('oTP otpExpiresAt').exec();
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.oTP) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }

      // Check if OTP has expired (if otpExpiresAt is implemented)
      if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
        await this.userModel.findByIdAndUpdate(userId, { 
          $unset: { oTP: 1, otpExpiresAt: 1 } 
        }).exec();
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }

      if (user.oTP === otp) {
        // OTP is correct, clear it and mark user as verified
        await this.userModel.findByIdAndUpdate(userId, {
          isVerified: true,
          $unset: { oTP: 1, otpExpiresAt: 1 }
        }).exec();
        
        return { success: true, message: 'OTP verified successfully' };
      } else {
        return { success: false, message: 'Invalid OTP' };
      }
    } catch (error) {
      console.error('Error in verifyEmailOTP:', error);
      return { success: false, message: 'An error occurred while verifying OTP' };
    }
  }
}
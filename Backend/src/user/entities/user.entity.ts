import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  // @Prop({ required: false, unique: true })
  // walletAddress: string;

  @Prop()
  phone?: string;

  @Prop({ required: false, unique: true })
  email?: string;

  @Prop()
  oTP?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop()
  password?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
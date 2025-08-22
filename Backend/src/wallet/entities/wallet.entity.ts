import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/entities/user.entity';

@Schema()
export class Wallet extends Document {
  @Prop()
  address: string;

  @Prop({ required: false, unique: true })
   privatekey?: string;

  @Prop()
  balance?: string;


  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user?: User;

//   @Prop({ default: false })
//   isVerified: boolean;

//   @Prop({ default: Date.now })
//   createdAt: Date;

//   @Prop({ default: Date.now })
//   lastLogin: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)
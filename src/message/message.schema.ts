import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Channel } from 'src/channel/schemas/channel.schema';
import { Conversation } from 'src/conversation/schemas/conversation.schema';
import { User } from 'src/user/schemas/user.schema';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  type: string;
  @Prop({ required: true })
  editAt: Date;
  @Prop({ required: true })
  deleteAt: Date;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  readBy: User[];
  @Prop({ type: Types.ObjectId, ref: 'Channel', default: null })
  channel: Channel;
  @Prop({ type: Types.ObjectId, ref: 'Conversation', default: null })
  conversation: Conversation;
}
export const MessageSchema = SchemaFactory.createForClass(Message);

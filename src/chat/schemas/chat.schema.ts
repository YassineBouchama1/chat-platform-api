import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { StatusChat } from 'src/common/enums/chat.enum';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: false })
  name?: string;

  @Prop({ enum: StatusChat, default: StatusChat.PUBLIC })
  type: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ default: false })
  isSafeMode: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false }) //  owner optional
  owner?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], index: true })
  members: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  moderators: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  bannedWords: string[];

  @Prop({ default: false })
  isGroup: boolean; // if this chat is groupe make isgroup true

  @Prop({ type: String })
  lastMessage: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

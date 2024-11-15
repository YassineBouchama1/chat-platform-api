import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
})
export class Notification {
  @Prop({ required: true })
  message: string;
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  recipientId: Types.ObjectId;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);

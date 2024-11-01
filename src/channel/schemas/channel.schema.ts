import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { StatusChannel } from 'src/common/enums/channel.enum';

export type ChannelDocument = HydratedDocument<Channel>;



@Schema()
export class Channel extends Document {
  @Prop()
  name: string;

  @Prop({ enum: StatusChannel, default: StatusChannel.PUBLIC })
  type: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ default: false })
  isSafeMode: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], index: true })
  members: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  moderators: User[];

  @Prop({ type: [String], default: [] })
  bannedWords: string[];


  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { RoleTypes, StatusUser } from 'src/common/enums/user.enum';


export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: RoleTypes, default: RoleTypes.Admin })
  role: string;

  @Prop({ enum: StatusUser, default: StatusUser.OFFLINE })
  status: string;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  friends: User[];


}

export const UserSchema = SchemaFactory.createForClass(User);
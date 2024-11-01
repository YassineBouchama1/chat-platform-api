import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';


@Module({
  imports: [
    // this MongooseModule give us ability to link between schema and this model auth 
    // so we can use it inside service
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }

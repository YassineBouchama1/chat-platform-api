import { IsMongoId, IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  message: string;

  @IsMongoId()
  recipientId: string;
}

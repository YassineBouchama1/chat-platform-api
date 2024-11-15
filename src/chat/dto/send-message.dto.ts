import { IsMongoId, IsString } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  channelId: string;

  @IsString()
  content: string;
}

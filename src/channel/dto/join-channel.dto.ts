import { IsMongoId } from 'class-validator';

export class JoinChannelDto {
  // @IsMongoId()
  // userId: string;

  @IsMongoId()
  channelId: string;
}


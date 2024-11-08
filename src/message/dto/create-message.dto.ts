import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;
  @IsString()
  type: string;
  @IsMongoId()
  sender: string;
  @IsOptional()
  @IsMongoId()
  channel?: string;
  @IsOptional()
  @IsMongoId()
  conversation?: string;
}

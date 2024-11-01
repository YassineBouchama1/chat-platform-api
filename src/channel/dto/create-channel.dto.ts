import { IsBoolean, isEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { StatusChannel } from 'src/common/enums/channel.enum';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isSafeMode?: boolean;

  @IsMongoId()
  @IsOptional()
  ownerId?: string;
}

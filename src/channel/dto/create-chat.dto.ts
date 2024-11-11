import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isSafeMode?: boolean;

  @IsBoolean()
  @IsOptional()
  isGroup?: boolean;

  @IsMongoId()
  @IsOptional()
  ownerId?: string;

  @IsString()
  message: string;

  // @IsMongoId()
  @IsOptional()
  @IsArray()
  members?: string[];
}

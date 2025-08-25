import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsEnum,
  IsUrl,
  IsObject
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { ContentType, ContentStatus } from '../entities/content.entity';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @ApiPropertyOptional({
    description: 'Content title',
    example: 'Updated Video Title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Content description',
    example: 'Updated description for the content',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Content type',
    enum: ContentType,
    example: ContentType.VIDEO,
  })
  @IsOptional()
  @IsEnum(ContentType)
  type?: ContentType;

  @ApiPropertyOptional({
    description: 'Content category',
    example: 'Education',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Content language',
    example: 'ar',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Content duration in seconds',
    example: 3600,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    description: 'Content status',
    enum: ContentStatus,
    example: ContentStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({
    description: 'Content source',
    example: 'youtube',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Original source data as JSON object',
    example: { originalId: '123', platform: 'youtube' },
  })
  @IsOptional()
  @IsObject()
  sourceData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { director: 'John Doe', year: 2024 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

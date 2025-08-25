import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUrl,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentStatus } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({
    description: 'Content title',
    example: 'Saudi Arabia History Documentary',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Content description',
    example: 'A comprehensive documentary about Saudi Arabia history',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Content type',
    enum: ContentType,
    example: ContentType.DOCUMENTARY,
  })
  @IsEnum(ContentType)
  type: ContentType;

  @ApiProperty({ description: 'Content category', example: 'History' })
  @IsString()
  category: string;

  @ApiPropertyOptional({
    description: 'Content language',
    example: 'ar',
    default: 'ar',
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
    description: 'Thumbnail image URL',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Media URL (video or audio file)',
    example: 'https://example.com/media.mp4',
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata as JSON object',
    example: { director: 'John Doe', year: 2024 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Content status',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Content source', example: 'youtube' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Original source data as JSON object' })
  @IsOptional()
  @IsObject()
  sourceData?: Record<string, any>;
}

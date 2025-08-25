import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentStatus } from '../entities/content.entity';

export class UploadContentDto {
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
        example: ContentType.VIDEO,
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
        description: 'Content status',
        enum: ContentStatus,
        default: ContentStatus.DRAFT,
    })
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;

    @ApiPropertyOptional({ description: 'Content source', example: 'upload' })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional({ description: 'Additional metadata as JSON string' })
    @IsOptional()
    @IsString()
    metadata?: string;
}

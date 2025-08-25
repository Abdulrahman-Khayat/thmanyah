import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType, ContentStatus } from '../../content/entities/content.entity';

export class SearchContentDto {
    @ApiPropertyOptional({
        description: 'Search term for title and description',
        example: 'Saudi Arabia history',
    })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({
        description: 'Content type filter',
        enum: ContentType,
        example: ContentType.DOCUMENTARY,
    })
    @IsOptional()
    @IsEnum(ContentType)
    type?: ContentType;

    @ApiPropertyOptional({
        description: 'Content status filter (default: published)',
        enum: ContentStatus,
        default: ContentStatus.PUBLISHED,
    })
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus = ContentStatus.PUBLISHED;

    @ApiPropertyOptional({
        description: 'Category filter',
        example: 'History',
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({
        description: 'Language filter',
        example: 'ar',
        default: 'ar',
    })
    @IsOptional()
    @IsString()
    language?: string = 'ar';

    @ApiPropertyOptional({
        description: 'Source filter',
        example: 'youtube',
    })
    @IsOptional()
    @IsString()
    source?: string;

    @ApiPropertyOptional({
        description: 'Page number',
        type: Number,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Items per page',
        type: Number,
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Sort by field',
        example: 'createdAt',
        default: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'DESC',
        default: 'DESC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';

    @ApiPropertyOptional({
        description: 'Include external search results',
        type: Boolean,
        default: false,
    })
    @IsOptional()
    includeExternal?: boolean = false;

    @ApiPropertyOptional({
        description: 'Minimum duration in seconds',
        type: Number,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minDuration?: number;

    @ApiPropertyOptional({
        description: 'Maximum duration in seconds',
        type: Number,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    maxDuration?: number;

    @ApiPropertyOptional({
        description: 'Published after date (ISO string)',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsString()
    publishedAfter?: string;

    @ApiPropertyOptional({
        description: 'Published before date (ISO string)',
        example: '2024-12-31T23:59:59.999Z',
    })
    @IsOptional()
    @IsString()
    publishedBefore?: string;

    @ApiPropertyOptional({
        description: 'Tags to filter by',
        type: [String],
        example: ['history', 'saudi-arabia'],
    })
    @IsOptional()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'Search mode',
        enum: ['fuzzy', 'exact', 'semantic'],
        default: 'fuzzy',
    })
    @IsOptional()
    @IsString()
    searchMode?: 'fuzzy' | 'exact' | 'semantic' = 'fuzzy';
}

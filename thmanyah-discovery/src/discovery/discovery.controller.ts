import {
    Controller,
    Get,
    Query,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { DiscoveryService } from './discovery.service';
import { SearchContentDto } from './dto/search-content.dto';
import { ContentType } from '../content/entities/content.entity';

@ApiTags('discovery')
@Controller('discovery')
export class DiscoveryController {
    constructor(
        private readonly discoveryService: DiscoveryService,
    ) { }

    @Get('search')
    @ApiOperation({ summary: 'Search published content' })
    @ApiQuery({
        name: 'q',
        required: false,
        description: 'Search term for title',
    })
    @ApiQuery({
        name: 'type',
        required: false,
        enum: ContentType,
        description: 'Filter by content type',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        description: 'Filter by category',
    })
    @ApiQuery({
        name: 'language',
        required: false,
        description: 'Filter by language (default: ar)',
    })
    @ApiQuery({
        name: 'source',
        required: false,
        description: 'Filter by source',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (default: 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (default: 20, max: 100)',
    })
    @ApiQuery({
        name: 'sortBy',
        required: false,
        description: 'Sort by field (default: createdAt)',
    })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: ['ASC', 'DESC'],
        description: 'Sort order (default: DESC)',
    })
    @ApiResponse({
        status: 200,
        description: 'Search results retrieved successfully',
    })
    searchContent(@Query() searchDto: SearchContentDto) {
        return this.discoveryService.searchContent(searchDto);
    }

    @Get('featured')
    @ApiOperation({ summary: 'Get featured content' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items (default: 10)',
    })
    @ApiResponse({
        status: 200,
        description: 'Featured content retrieved successfully',
    })
    getFeaturedContent(@Query('limit') limit?: number) {
        return this.discoveryService.getFeaturedContent(limit);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get content by type' })
    @ApiParam({
        name: 'type',
        enum: ContentType,
        description: 'Content type',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items (default: 20)',
    })
    @ApiResponse({
        status: 200,
        description: 'Content by type retrieved successfully',
    })
    getContentByType(
        @Param('type') type: string,
        @Query('limit') limit?: number,
    ) {
        return this.discoveryService.getContentByType(type, limit);
    }

    @Get('content/:id')
    @ApiOperation({ summary: 'Get content by ID' })
    @ApiParam({ name: 'id', description: 'Content ID' })
    @ApiResponse({
        status: 200,
        description: 'Content retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Content not found' })
    getContentById(@Param('id') id: string) {
        return this.discoveryService.getContentById(id);
    }

    @Get('categories')
    @ApiOperation({ summary: 'Get all available categories' })
    @ApiResponse({
        status: 200,
        description: 'Categories retrieved successfully',
    })
    getCategories() {
        return this.discoveryService.getCategories();
    }

    @Get('languages')
    @ApiOperation({ summary: 'Get all available languages' })
    @ApiResponse({
        status: 200,
        description: 'Languages retrieved successfully',
    })
    getLanguages() {
        return this.discoveryService.getLanguages();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get content statistics' })
    @ApiResponse({
        status: 200,
        description: 'Statistics retrieved successfully',
    })
    getStats() {
        return this.discoveryService.getContentStats();
    }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { ImportService } from './services/import.service';
import { FileUploadService } from './services/file-upload.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { UploadContentDto } from './dto/upload-content.dto';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly importService: ImportService,
    private readonly fileUploadService: FileUploadService,
  ) { }



  @Post()
  @ApiOperation({ summary: 'Create content with optional media files' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description: 'Content data with optional media files. Use multipart/form-data for files, JSON for metadata only.',
    type: UploadContentDto,
  })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @UseInterceptors(FilesInterceptor('files', 5))
  async createContent(
    @Body() contentDto: UploadContentDto,
    @UploadedFiles()
    files?: Express.Multer.File[],
  ) {
    // Validate files if provided
    if (files && files.length > 0) {
      files.forEach(file => {
        this.fileUploadService?.validateFile(file);
      });
    }

    return this.contentService.uploadContent(contentDto, files || []);
  }

  @Post('upload/thumbnail')
  @ApiOperation({ summary: 'Upload thumbnail image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Thumbnail uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @UseInterceptors(FileInterceptor('thumbnail'))
  async uploadThumbnail(
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.fileUploadService.validateFile(file);
    const fileType = this.fileUploadService.getFileType(file.mimetype);
    const fileUrl = this.fileUploadService.getFileUrl(file.filename, fileType);

    return {
      message: 'Thumbnail uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: fileUrl,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all content with filtering and pagination' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for title',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['video', 'podcast', 'documentary', 'audio'],
    description: 'Filter by content type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'archived'],
    description: 'Filter by content status',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language',
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
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Content list retrieved successfully',
  })
  findAll(@Query() queryDto: QueryContentDto) {
    return this.contentService.findAll(queryDto);
  }

  // @Get('stats')
  // @ApiOperation({ summary: 'Get content statistics' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Statistics retrieved successfully',
  // })
  // getStats() {
  //   return this.contentService.getStats();
  // }

  // @Get('categories')
  // @ApiOperation({ summary: 'Get all available categories' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Categories retrieved successfully',
  // })
  // getCategories() {
  //   return this.contentService.getCategories();
  // }

  // @Get('languages')
  // @ApiOperation({ summary: 'Get all available languages' })
  // @ApiResponse({ status: 200, description: 'Languages retrieved successfully' })
  // getLanguages() {
  //   return this.contentService.getLanguages();
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }



  @Get('media/:type/:filename')
  @ApiOperation({ summary: 'Stream media file' })
  @ApiParam({ name: 'type', description: 'Media type (images, videos, audio)' })
  @ApiParam({ name: 'filename', description: 'Filename' })
  @ApiResponse({ status: 200, description: 'Media file streamed successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  streamMedia(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return this.contentService.streamMedia(type, filename, res);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.contentService.update(id, updateContentDto);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content published successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  publish(@Param('id') id: string) {
    return this.contentService.publish(id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content archived successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  archive(@Param('id') id: string) {
    return this.contentService.archive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 204, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }

  @Post('import/youtube')
  @ApiOperation({ summary: 'Import content from YouTube channel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        channelId: {
          type: 'string',
          example: 'UC123456789',
          description: 'YouTube channel ID',
        },
        apiKey: {
          type: 'string',
          example: 'your_youtube_api_key',
          description: 'YouTube API key',
        },
      },
      required: ['channelId', 'apiKey'],
    },
  })
  @ApiResponse({ status: 200, description: 'Import process completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  importFromYouTube(@Body() body: { channelId: string; apiKey: string }) {
    return this.importService.importFromYouTube(body.channelId, body.apiKey);
  }

  @Post('import/spotify')
  @ApiOperation({ summary: 'Import content from Spotify playlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        playlistId: {
          type: 'string',
          example: '37i9dQZF1DXcBWIGoYBM5M',
          description: 'Spotify playlist ID',
        },
        clientId: {
          type: 'string',
          example: 'your_spotify_client_id',
          description: 'Spotify client ID',
        },
        clientSecret: {
          type: 'string',
          example: 'your_spotify_client_secret',
          description: 'Spotify client secret',
        },
      },
      required: ['playlistId', 'clientId', 'clientSecret'],
    },
  })
  @ApiResponse({ status: 200, description: 'Import process completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  importFromSpotify(
    @Body()
    body: {
      playlistId: string;
      clientId: string;
      clientSecret: string;
    },
  ) {
    return this.importService.importFromSpotify(
      body.playlistId,
      body.clientId,
      body.clientSecret,
    );
  }

  @Post('import/custom')
  @ApiOperation({ summary: 'Import content from custom source' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' },
          example: [
            {
              title: 'Sample Video',
              description: 'Sample description',
              url: 'https://example.com/video.mp4',
            },
          ],
          description: 'Array of content items to import',
        },
        mapping: {
          type: 'object',
          example: {
            title: 'title',
            description: 'description',
            mediaUrl: 'url',
          },
          description: 'Field mapping from source to target schema',
        },
      },
      required: ['data', 'mapping'],
    },
  })
  @ApiResponse({ status: 200, description: 'Import process completed' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  importFromCustom(
    @Body() body: { data: any[]; mapping: Record<string, string> },
  ) {
    return this.importService.importFromCustomSource(body.data, body.mapping);
  }
}

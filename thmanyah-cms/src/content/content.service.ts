import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { ContentEntity, ContentStatus } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { UploadContentDto } from './dto/upload-content.dto';
import { FileUploadService } from './services/file-upload.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private readonly contentRepository: Repository<ContentEntity>,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async create(
    createContentDto: CreateContentDto,
    userId?: string,
  ): Promise<ContentEntity> {
    const content = this.contentRepository.create({
      ...createContentDto,
      createdBy: userId,
      updatedBy: userId,
    });

    if (content.status === ContentStatus.PUBLISHED) {
      content.publishedAt = new Date();
    }

    return await this.contentRepository.save(content);
  }

  async findAll(queryDto: QueryContentDto): Promise<{
    data: ContentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      category,
      language,
      source,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = queryDto;

    const whereConditions: FindOptionsWhere<ContentEntity> = {};

    if (search) {
      whereConditions.title = Like(`%${search}%`);
    }

    if (type) {
      whereConditions.type = type;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (category) {
      whereConditions.category = category;
    }

    if (language) {
      whereConditions.language = language;
    }

    if (source) {
      whereConditions.source = source;
    }

    const [data, total] = await this.contentRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ContentEntity> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async update(
    id: string,
    updateContentDto: UpdateContentDto,
    userId?: string,
  ): Promise<ContentEntity> {
    const content = await this.findOne(id);

    // If status is being changed to published, set publishedAt
    if (
      updateContentDto.status === ContentStatus.PUBLISHED &&
      content.status !== ContentStatus.PUBLISHED
    ) {
      content.publishedAt = new Date();
    }

    Object.assign(content, {
      ...updateContentDto,
      updatedBy: userId,
    });

    return await this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.remove(content);
  }

  async publish(id: string, userId?: string): Promise<ContentEntity> {
    return await this.update(id, { status: ContentStatus.PUBLISHED }, userId);
  }

  async archive(id: string, userId?: string): Promise<ContentEntity> {
    return await this.update(id, { status: ContentStatus.ARCHIVED }, userId);
  }

  // async getCategories(): Promise<string[]> {
  //   const categories = await this.contentRepository
  //     .createQueryBuilder('content')
  //     .select('DISTINCT content.category', 'category')
  //     .getRawMany();

  //   return categories.map((cat) => cat.category);
  // }

  // async getLanguages(): Promise<string[]> {
  //   const languages = await this.contentRepository
  //     .createQueryBuilder('content')
  //     .select('DISTINCT content.language', 'language')
  //     .getRawMany();

  //   return languages.map((lang) => lang.language);
  // }

  // async getStats(): Promise<{
  //   total: number;
  //   published: number;
  //   draft: number;
  //   archived: number;
  //   byType: Record<string, number>;
  // }> {
  //   const total = await this.contentRepository.count();
  //   const published = await this.contentRepository.count({
  //     where: { status: ContentStatus.PUBLISHED },
  //   });
  //   const draft = await this.contentRepository.count({
  //     where: { status: ContentStatus.DRAFT },
  //   });
  //   const archived = await this.contentRepository.count({
  //     where: { status: ContentStatus.ARCHIVED },
  //   });

  //   const byType = await this.contentRepository
  //     .createQueryBuilder('content')
  //     .select('content.type', 'type')
  //     .addSelect('COUNT(*)', 'count')
  //     .groupBy('content.type')
  //     .getRawMany();

  //   const typeStats = byType.reduce((acc, item) => {
  //     acc[item.type] = parseInt(item.count);
  //     return acc;
  //   }, {});

  //   return {
  //     total,
  //     published,
  //     draft,
  //     archived,
  //     byType: typeStats,
  //   };
  // }

  async uploadContent(
    uploadContentDto: UploadContentDto,
    files: Express.Multer.File[],
    userId?: string,
  ): Promise<ContentEntity> {
    // Parse metadata if provided
    let metadata: Record<string, any> = {};
    if (uploadContentDto.metadata) {
      try {
        metadata = JSON.parse(uploadContentDto.metadata);
      } catch (error) {
        throw new Error('Invalid metadata JSON format');
      }
    }

    // Process uploaded files (if any)
    const fileUrls: Record<string, string> = {};

    if (files && files.length > 0) {
      for (const file of files) {
        // Validate file
        this.fileUploadService.validateFile(file);

        // Generate unique filename
        const { v4: uuidv4 } = require('uuid');
        const { extname } = require('path');
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;

        // Determine file type
        const fileType = this.fileUploadService.getFileType(file.mimetype);

        // Save file to disk
        const fs = require('fs');
        const path = require('path');
        const uploadPath = path.join('uploads', fileType, uniqueName);

        // Ensure directory exists
        const dir = path.dirname(uploadPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write file to disk
        fs.writeFileSync(uploadPath, file.buffer);

        // Generate URL
        const fileUrl = this.fileUploadService.getFileUrl(uniqueName, fileType);

        // Determine file type and assign to appropriate URL
        if (fileType === 'images') {
          fileUrls.thumbnailUrl = fileUrl;
        } else if (fileType === 'videos' || fileType === 'audio') {
          fileUrls.mediaUrl = fileUrl;
        }
      }
    }

    // Create content with file URLs (if any) or existing URLs from DTO
    const createContentDto: CreateContentDto = {
      ...uploadContentDto,
      ...fileUrls, // This will override any existing URLs if files were uploaded
      metadata,
      source: uploadContentDto.source || (files && files.length > 0 ? 'upload' : 'external'),
    };

    return await this.create(createContentDto, userId);
  }



  async streamMedia(type: string, filename: string, res: any): Promise<void> {
    const fs = require('fs');
    const path = require('path');

    const filePath = path.join('uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found' });
      return;
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = res.req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': this.getContentType(filename),
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': this.getContentType(filename),
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp4':
        return 'video/mp4';
      case 'avi':
        return 'video/avi';
      case 'mov':
        return 'video/quicktime';
      case 'wmv':
        return 'video/x-ms-wmv';
      case 'flv':
        return 'video/x-flv';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'ogg':
        return 'audio/ogg';
      case 'm4a':
        return 'audio/mp4';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, ILike } from 'typeorm';
import { ContentEntity, ContentStatus, ContentType } from '../content/entities/content.entity';
import { SearchContentDto } from './dto/search-content.dto';

@Injectable()
export class DiscoveryService {
    constructor(
        @InjectRepository(ContentEntity)
        private readonly contentRepository: Repository<ContentEntity>,
    ) { }

    async searchContent(searchDto: SearchContentDto): Promise<{
        data: ContentEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    }> {
        const {
            q,
            type,
            status = ContentStatus.PUBLISHED,
            category,
            language = 'ar',
            source,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = searchDto;

        const whereConditions: FindOptionsWhere<ContentEntity> = {
            status, // Only published content by default
        };

        // Add search query
        if (q) {
            whereConditions.title = ILike(`%${q}%`);
            // You could also search in description if needed
            // whereConditions.description = ILike(`%${q}%`);
        }

        // Add filters
        if (type) {
            whereConditions.type = type;
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
            select: [
                'id',
                'title',
                'description',
                'type',
                'category',
                'language',
                'duration',
                'thumbnailUrl',
                'mediaUrl',
                'status',
                'source',
                'metadata',
                'publishedAt',
                'createdAt',
                'updatedAt',
            ],
        });

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            data,
            total,
            page,
            limit,
            totalPages,
            hasMore,
        };
    }

    async getContentById(id: string): Promise<ContentEntity> {
        const content = await this.contentRepository.findOne({
            where: { id, status: ContentStatus.PUBLISHED },
        });

        if (!content) {
            throw new NotFoundException(`Content with ID ${id} not found or not published`);
        }

        return content;
    }

    async getFeaturedContent(limit: number = 10): Promise<ContentEntity[]> {
        return await this.contentRepository.find({
            where: { status: ContentStatus.PUBLISHED },
            order: { publishedAt: 'DESC' },
            take: limit,
            select: [
                'id',
                'title',
                'description',
                'type',
                'category',
                'language',
                'duration',
                'thumbnailUrl',
                'mediaUrl',
                'publishedAt',
            ],
        });
    }

    async getContentByType(type: string, limit: number = 20): Promise<ContentEntity[]> {
        return await this.contentRepository.find({
            where: { type: type as ContentType, status: ContentStatus.PUBLISHED },
            order: { publishedAt: 'DESC' },
            take: limit,
            select: [
                'id',
                'title',
                'description',
                'type',
                'category',
                'language',
                'duration',
                'thumbnailUrl',
                'mediaUrl',
                'publishedAt',
            ],
        });
    }

    async getCategories(): Promise<string[]> {
        const categories = await this.contentRepository
            .createQueryBuilder('content')
            .select('DISTINCT content.category', 'category')
            .where('content.status = :status', { status: ContentStatus.PUBLISHED })
            .getRawMany();

        return categories.map((cat) => cat.category);
    }

    async getLanguages(): Promise<string[]> {
        const languages = await this.contentRepository
            .createQueryBuilder('content')
            .select('DISTINCT content.language', 'language')
            .where('content.status = :status', { status: ContentStatus.PUBLISHED })
            .getRawMany();

        return languages.map((lang) => lang.language);
    }

    async getContentStats(): Promise<{
        total: number;
        byType: Record<string, number>;
        byCategory: Record<string, number>;
        byLanguage: Record<string, number>;
    }> {
        const total = await this.contentRepository.count({
            where: { status: ContentStatus.PUBLISHED },
        });

        const byType = await this.contentRepository
            .createQueryBuilder('content')
            .select('content.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('content.status = :status', { status: ContentStatus.PUBLISHED })
            .groupBy('content.type')
            .getRawMany();

        const byCategory = await this.contentRepository
            .createQueryBuilder('content')
            .select('content.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .where('content.status = :status', { status: ContentStatus.PUBLISHED })
            .groupBy('content.category')
            .getRawMany();

        const byLanguage = await this.contentRepository
            .createQueryBuilder('content')
            .select('content.language', 'language')
            .addSelect('COUNT(*)', 'count')
            .where('content.status = :status', { status: ContentStatus.PUBLISHED })
            .groupBy('content.language')
            .getRawMany();

        return {
            total,
            byType: byType.reduce((acc, item) => {
                acc[item.type] = parseInt(item.count);
                return acc;
            }, {}),
            byCategory: byCategory.reduce((acc, item) => {
                acc[item.category] = parseInt(item.count);
                return acc;
            }, {}),
            byLanguage: byLanguage.reduce((acc, item) => {
                acc[item.language] = parseInt(item.count);
                return acc;
            }, {}),
        };
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentEntity, ContentStatus } from './entities/content.entity';

@Injectable()
export class ContentService {
    private readonly logger = new Logger(ContentService.name);

    constructor(
        @InjectRepository(ContentEntity)
        private readonly contentRepository: Repository<ContentEntity>,
    ) { }

    async createContent(contentData: Partial<ContentEntity>): Promise<ContentEntity> {
        // Save to PostgreSQL (primary storage)
        const content = this.contentRepository.create(contentData);
        const savedContent = await this.contentRepository.save(content);
        this.logger.log(`Content ${savedContent.id} created successfully`);
        return savedContent;
    }

    async updateContent(id: string, updateData: Partial<ContentEntity>): Promise<ContentEntity> {
        // Update in PostgreSQL
        await this.contentRepository.update(id, updateData);
        const updatedContent = await this.contentRepository.findOne({ where: { id } });
        if (!updatedContent) {
            throw new Error(`Content with id ${id} not found`);
        }
        this.logger.log(`Content ${id} updated successfully`);
        return updatedContent;
    }

    async deleteContent(id: string): Promise<void> {
        // Delete from PostgreSQL
        await this.contentRepository.delete(id);
        this.logger.log(`Content ${id} deleted successfully`);
    }

    async publishContent(id: string): Promise<ContentEntity> {
        // Update status in PostgreSQL
        await this.contentRepository.update(id, {
            status: ContentStatus.PUBLISHED,
            publishedAt: new Date()
        });
        const publishedContent = await this.contentRepository.findOne({ where: { id } });
        if (!publishedContent) {
            throw new Error(`Content with id ${id} not found`);
        }
        this.logger.log(`Content ${id} published successfully`);
        return publishedContent;
    }

    async unpublishContent(id: string): Promise<ContentEntity> {
        // Update status in PostgreSQL
        await this.contentRepository.update(id, { status: ContentStatus.DRAFT });
        const unpublishedContent = await this.contentRepository.findOne({ where: { id } });
        if (!unpublishedContent) {
            throw new Error(`Content with id ${id} not found`);
        }
        this.logger.log(`Content ${id} unpublished successfully`);
        return unpublishedContent;
    }

    // Get content from PostgreSQL (for admin operations)
    async getContentById(id: string): Promise<ContentEntity | null> {
        return await this.contentRepository.findOne({ where: { id } });
    }

    async getAllContent(): Promise<ContentEntity[]> {
        return await this.contentRepository.find();
    }
}

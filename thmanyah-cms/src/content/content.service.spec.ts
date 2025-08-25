import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentService } from './content.service';
import {
  ContentEntity,
  ContentType,
  ContentStatus,
} from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { NotFoundException } from '@nestjs/common';

describe('ContentService', () => {
  let service: ContentService;
  let repository: Repository<ContentEntity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(ContentEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    repository = module.get<Repository<ContentEntity>>(
      getRepositoryToken(ContentEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new content item', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Video',
        description: 'Test Description',
        type: ContentType.VIDEO,
        category: 'Test Category',
        language: 'ar',
        duration: 3600,
      };

      const expectedContent = {
        id: 'test-id',
        ...createDto,
        status: ContentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedContent);
      mockRepository.save.mockResolvedValue(expectedContent);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdBy: undefined,
        updatedBy: undefined,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedContent);
      expect(result).toEqual(expectedContent);
    });

    it('should set publishedAt when status is published', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Video',
        type: ContentType.VIDEO,
        category: 'Test Category',
        status: ContentStatus.PUBLISHED,
      };

      const expectedContent = {
        id: 'test-id',
        ...createDto,
        publishedAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedContent);
      mockRepository.save.mockResolvedValue(expectedContent);

      const result = await service.create(createDto);

      expect(result.publishedAt).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return content when found', async () => {
      const content = {
        id: 'test-id',
        title: 'Test Video',
        type: ContentType.VIDEO,
        category: 'Test Category',
      };

      mockRepository.findOne.mockResolvedValue(content);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(content);
    });

    it('should throw NotFoundException when content not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update content successfully', async () => {
      const existingContent = {
        id: 'test-id',
        title: 'Old Title',
        type: ContentType.VIDEO,
        category: 'Test Category',
        status: ContentStatus.DRAFT,
      };

      const updateDto = {
        title: 'New Title',
        status: ContentStatus.PUBLISHED,
      };

      const updatedContent = {
        ...existingContent,
        ...updateDto,
        publishedAt: expect.any(Date),
        updatedAt: expect.any(Date),
        updatedBy: undefined,
      };

      mockRepository.findOne.mockResolvedValue(existingContent);
      mockRepository.save.mockResolvedValue(updatedContent);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...existingContent,
          ...updateDto,
          updatedBy: undefined,
        }),
      );
      expect(result.publishedAt).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should remove content successfully', async () => {
      const content = {
        id: 'test-id',
        title: 'Test Video',
        type: ContentType.VIDEO,
        category: 'Test Category',
      };

      mockRepository.findOne.mockResolvedValue(content);
      mockRepository.remove.mockResolvedValue(content);

      await service.remove('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(content);
    });
  });
});

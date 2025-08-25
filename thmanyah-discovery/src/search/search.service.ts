import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ContentEntity, ContentType, ContentStatus } from '../content/entities/content.entity';
import { SearchContentDto } from '../discovery/dto/search-content.dto';
import { contentIndexName, contentIndexMapping } from '../config/elasticsearch.config';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async createIndex(): Promise<void> {
        try {
            const indexExists = await this.elasticsearchService.indices.exists({
                index: contentIndexName,
            });

            if (!indexExists) {
                await this.elasticsearchService.indices.create({
                    index: contentIndexName,
                    body: contentIndexMapping as any,
                });
                this.logger.log(`Index ${contentIndexName} created successfully`);
            }
        } catch (error) {
            this.logger.error(`Error creating index: ${error.message}`);
            throw error;
        }
    }

    async indexContent(content: ContentEntity): Promise<void> {
        try {
            const document = {
                id: content.id,
                title: content.title,
                description: content.description,
                type: content.type,
                category: content.category,
                language: content.language,
                duration: content.duration,
                thumbnailUrl: content.thumbnailUrl,
                mediaUrl: content.mediaUrl,
                status: content.status,
                source: content.source,
                sourceData: content.sourceData,
                metadata: content.metadata,
                tags: content.metadata?.tags || [],
                publishedAt: content.publishedAt,
                createdAt: content.createdAt,
                updatedAt: content.updatedAt,
                // TODO: Add vector embeddings for semantic search
                // titleVector: await this.generateEmbedding(content.title),
                // descriptionVector: await this.generateEmbedding(content.description),
            };

            await this.elasticsearchService.index({
                index: contentIndexName,
                id: content.id,
                document: document,
            });
        } catch (error) {
            this.logger.error(`Error indexing content ${content.id}: ${error.message}`);
            throw error;
        }
    }

    async searchContent(searchDto: SearchContentDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
        aggregations?: any;
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

        const from = (page - 1) * limit;
        const query: any = {
            bool: {
                must: [
                    { term: { status } },
                    { term: { language } },
                ],
                filter: [],
            },
        };

        // Text search
        if (q) {
            query.bool.must.push({
                multi_match: {
                    query: q,
                    fields: ['title^3', 'description^2'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                    operator: 'or',
                },
            });
        }

        // Filters
        if (type) {
            query.bool.filter.push({ term: { type } });
        }

        if (category) {
            query.bool.filter.push({ term: { category } });
        }

        if (source) {
            query.bool.filter.push({ term: { source } });
        }

        // Aggregations for faceted search
        const aggs = {
            types: {
                terms: { field: 'type' },
            },
            categories: {
                terms: { field: 'category' },
            },
            sources: {
                terms: { field: 'source' },
            },
            duration_ranges: {
                range: {
                    field: 'duration',
                    ranges: [
                        { to: 300 }, // 0-5 minutes
                        { from: 300, to: 900 }, // 5-15 minutes
                        { from: 900, to: 1800 }, // 15-30 minutes
                        { from: 1800 }, // 30+ minutes
                    ],
                },
            },
        };

        // Sorting
        let sort: any[] = [];
        if (q) {
            // If searching, sort by relevance first, then by specified field
            sort = [
                { _score: { order: 'desc' } },
                { [sortBy]: { order: sortOrder.toLowerCase() } },
            ];
        } else {
            sort = [{ [sortBy]: { order: sortOrder.toLowerCase() } }];
        }

        const response = await this.elasticsearchService.search({
            index: contentIndexName,
            query,
            aggs,
            sort,
            from,
            size: limit,
            _source: [
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
        } as any);

        const total = typeof response.hits.total === 'number' ? response.hits.total : (response.hits.total as any)?.value || 0;
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return {
            data: response.hits.hits.map((hit: any) => ({
                ...(hit._source as any),
                score: hit._score,
            })),
            total,
            page,
            limit,
            totalPages,
            hasMore,
            aggregations: response.aggregations,
        };
    }

    async getSuggestions(query: string, size: number = 5): Promise<string[]> {
        try {
            const response = await this.elasticsearchService.search({
                index: contentIndexName,
                body: {
                    suggest: {
                        title_suggestions: {
                            prefix: query,
                            completion: {
                                field: 'title.suggest',
                                size,
                                skip_duplicates: true,
                            },
                        },
                    },
                },
            });

            const suggestions = response.suggest?.title_suggestions?.[0]?.options || [];
            // Ensure suggestions is always an array
            const suggestionsArray = Array.isArray(suggestions) ? suggestions : [suggestions];
            return suggestionsArray.map(suggestion => suggestion.text);
        } catch (error) {
            this.logger.error(`Error getting suggestions: ${error.message}`);
            return [];
        }
    }

    async getRecommendations(
        contentId?: string,
        userId?: string,
        limit: number = 10
    ): Promise<any[]> {
        let query: any = {
            bool: {
                must: [
                    { term: { status: ContentStatus.PUBLISHED } },
                ],
            },
        };

        if (contentId) {
            // Find similar content based on current content
            try {
                const currentContent = await this.elasticsearchService.get({
                    index: contentIndexName,
                    id: contentId,
                });

                if (currentContent.found) {
                    const content = currentContent._source as any;
                    query.bool.must.push(
                        { term: { type: content.type } },
                        { term: { category: content.category } },
                        { term: { language: content.language } }
                    );
                    query.bool.must_not.push({ term: { id: contentId } });
                }
            } catch (error) {
                this.logger.error(`Error getting content for recommendations: ${error.message}`);
            }
        }

        const response = await this.elasticsearchService.search({
            index: contentIndexName,
            body: {
                query,
                sort: [
                    { publishedAt: { order: 'desc' } },
                    { _score: { order: 'desc' } },
                ],
                size: limit,
            },
        });

        return response.hits.hits.map(hit => hit._source);
    }

    async getTrendingContent(limit: number = 10): Promise<any[]> {
        // This would typically use analytics data
        // For now, return recent content with some randomization
        const response = await this.elasticsearchService.search({
            index: contentIndexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { status: ContentStatus.PUBLISHED } },
                        ],
                    },
                },
                sort: [
                    { publishedAt: { order: 'desc' } },
                ],
                size: limit,
            },
        });

        return response.hits.hits.map(hit => hit._source);
    }

    async deleteContent(contentId: string): Promise<void> {
        try {
            await this.elasticsearchService.delete({
                index: contentIndexName,
                id: contentId,
            });
        } catch (error) {
            this.logger.error(`Error deleting content ${contentId}: ${error.message}`);
            throw error;
        }
    }

    async updateContent(content: ContentEntity): Promise<void> {
        await this.indexContent(content);
    }

    // TODO: Implement semantic search with embeddings
    // private async generateEmbedding(text: string): Promise<number[]> {
    //   // This would call an embedding service like OpenAI, Cohere, or local model
    //   // For now, return a placeholder
    //   return new Array(384).fill(0);
    // }
}

import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const elasticsearchConfig: ElasticsearchModuleOptions = {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
    },
    tls: {
        rejectUnauthorized: false, // For development
    },
    maxRetries: 3,
    requestTimeout: 10000,
    sniffOnStart: true,
    // OpenSearch compatibility settings
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
};

export const contentIndexName = 'content';
export const contentIndexMapping = {
    mappings: {
        properties: {
            id: { type: 'keyword' },
            title: {
                type: 'text',
                analyzer: 'arabic',
                search_analyzer: 'arabic',
                fields: {
                    keyword: { type: 'keyword' },
                    suggest: { type: 'completion' },
                }
            },
            description: {
                type: 'text',
                analyzer: 'arabic',
                search_analyzer: 'arabic'
            },
            type: { type: 'keyword' },
            category: { type: 'keyword' },
            language: { type: 'keyword' },
            duration: { type: 'integer' },
            thumbnailUrl: { type: 'keyword' },
            mediaUrl: { type: 'keyword' },
            status: { type: 'keyword' },
            source: { type: 'keyword' },
            sourceData: { type: 'object', enabled: false },
            metadata: { type: 'object', enabled: true },
            tags: {
                type: 'keyword',
                fields: {
                    text: { type: 'text', analyzer: 'arabic' }
                }
            },
            publishedAt: { type: 'date' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            // For semantic search
            titleVector: { type: 'dense_vector', dims: 384 },
            descriptionVector: { type: 'dense_vector', dims: 384 },
        }
    },
    settings: {
        analysis: {
            analyzer: {
                arabic: {
                    type: 'arabic',
                    stopwords: '_arabic_'
                }
            }
        }
    }
};

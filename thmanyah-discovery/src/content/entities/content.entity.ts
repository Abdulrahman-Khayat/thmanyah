import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum ContentType {
    VIDEO = 'video',
    PODCAST = 'podcast',
    DOCUMENTARY = 'documentary',
    AUDIO = 'audio',
}

export enum ContentStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

@Entity('content')
@Index(['status', 'type'])
@Index(['category', 'language'])
@Index(['title'], { fulltext: true })
export class ContentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({
        type: 'enum',
        enum: ContentType,
    })
    type: ContentType;

    @Column({ type: 'varchar', length: 100 })
    category: string;

    @Column({ type: 'varchar', length: 10, default: 'ar' })
    language: string;

    @Column({ type: 'int', nullable: true })
    duration?: number;

    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnailUrl?: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    mediaUrl?: string;

    @Column({
        type: 'enum',
        enum: ContentStatus,
        default: ContentStatus.DRAFT,
    })
    status: ContentStatus;

    @Column({ type: 'varchar', length: 100, nullable: true })
    source?: string;

    @Column({ type: 'jsonb', nullable: true })
    sourceData?: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt?: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    createdBy?: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    updatedBy?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

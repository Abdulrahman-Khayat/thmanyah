import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity } from './entities/content.entity';
import { ContentService } from './content.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContentEntity]),
    ],
    providers: [ContentService],
    exports: [ContentService],
})
export class ContentModule { }

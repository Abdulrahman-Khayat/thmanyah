import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { ImportService } from './services/import.service';
import { FileUploadService } from './services/file-upload.service';
import { ContentEntity } from './entities/content.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContentEntity])],
  controllers: [ContentController],
  providers: [ContentService, ImportService, FileUploadService],
  exports: [ContentService, ImportService, FileUploadService],
})
export class ContentModule { }

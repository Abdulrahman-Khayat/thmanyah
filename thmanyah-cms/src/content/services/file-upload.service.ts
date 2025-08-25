import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}

@Injectable()
export class FileUploadService {
    private readonly uploadDir = 'uploads';
    private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
    private readonly allowedMimeTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'],
        audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    };

    constructor() {
        this.ensureUploadDirectories();
    }

    private ensureUploadDirectories(): void {
        const dirs = [
            this.uploadDir,
            `${this.uploadDir}/images`,
            `${this.uploadDir}/videos`,
            `${this.uploadDir}/audio`,
        ];

        dirs.forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    getStorageConfig() {
        return diskStorage({
            destination: (req, file, cb) => {
                const fileType = this.getFileType(file.mimetype);
                const uploadPath = path.join(this.uploadDir, fileType);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueName);
            },
        });
    }

    getFileType(mimetype: string): string {
        if (this.allowedMimeTypes.image.includes(mimetype)) {
            return 'images';
        }
        if (this.allowedMimeTypes.video.includes(mimetype)) {
            return 'videos';
        }
        if (this.allowedMimeTypes.audio.includes(mimetype)) {
            return 'audio';
        }
        throw new BadRequestException(`Unsupported file type: ${mimetype}`);
    }

    validateFile(file: UploadedFile): void {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size too large. Maximum allowed: ${this.maxFileSize / 1024 / 1024}MB`,
            );
        }

        const isValidMimeType = Object.values(this.allowedMimeTypes)
            .flat()
            .includes(file.mimetype);

        if (!isValidMimeType) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${Object.values(this.allowedMimeTypes)
                    .flat()
                    .join(', ')}`,
            );
        }
    }

    getFileUrl(filename: string, fileType: string): string {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${fileType}/${filename}`;
    }

    deleteFile(filename: string, fileType: string): boolean {
        try {
            const filePath = path.join(this.uploadDir, fileType, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    getAllowedMimeTypes(): Record<string, string[]> {
        return this.allowedMimeTypes;
    }

    getMaxFileSize(): number {
        return this.maxFileSize;
    }
}

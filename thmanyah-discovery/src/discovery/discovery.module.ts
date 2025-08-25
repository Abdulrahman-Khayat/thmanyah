import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryService } from './discovery.service';
import { ContentEntity } from '../content/entities/content.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContentEntity]),
    ],
    controllers: [DiscoveryController],
    providers: [DiscoveryService],
    exports: [DiscoveryService],
})
export class DiscoveryModule { }

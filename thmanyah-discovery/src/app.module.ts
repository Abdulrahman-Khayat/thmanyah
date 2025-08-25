import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryModule } from './discovery/discovery.module';
import { databaseConfig } from './config/database.config';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        DiscoveryModule,
    ],

})
export class AppModule { }

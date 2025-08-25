import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Thmanyah CMS API')
    .setDescription(
      'Content Management System API for managing visual content like podcasts and documentaries',
    )
    .setVersion('1.0')
    .addTag('content', 'Content management operations')
    .addTag('import', 'Data import operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log(
    '📚 Swagger documentation available at: http://localhost:3000/docs',
  );
}
bootstrap();

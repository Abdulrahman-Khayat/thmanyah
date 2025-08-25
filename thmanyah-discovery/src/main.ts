import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for public access
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Thmanyah Discovery API')
    .setDescription(
      'Public Discovery API for searching and exploring content from Thmanyah CMS',
    )
    .setVersion('1.0')
    .addTag('discovery', 'Content discovery and search operations')
    .addTag('search', 'Advanced search functionality')
    .addTag('content', 'Content retrieval operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('🔍 Discovery service is running on: http://localhost:' + port);
  console.log(
    '📚 Swagger documentation available at: http://localhost:' + port + '/docs',
  );
}
bootstrap();

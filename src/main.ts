import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './common/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (config.get('ENABLE_DOCUMENTATION')) {
    setupSwagger(app);
  }

  const port = +config.get<number>('PORT');

  await app.listen(port);

  if (config.get('ENABLE_DOCUMENTATION')) {
    console.info(
      `Documentation: ${process.env.APP_URL}:${process.env.PORT}/api`,
    );
  }

  console.info(`Application is running on: ${await app.getUrl()}`);

  return app;
}
void bootstrap();

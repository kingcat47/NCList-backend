import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정 - React Native 앱에서 백엔드 API에 접근할 수 있도록 허용
  app.enableCors({

    origin: true,

    credentials: true,
  });

  // 글로벌 파이프 설정 - 모든 요청에 대해 자동 데이터 검증
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // 허용되지 않은 속성이 있으면 요청 거부
    transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
  }));


  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// 애플리케이션 시작
bootstrap();

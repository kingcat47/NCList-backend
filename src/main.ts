import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  // NestJS 애플리케이션 인스턴스 생성
  const app = await NestFactory.create(AppModule);

  // CORS 설정 - React Native 앱에서 백엔드 API에 접근할 수 있도록 허용
  app.enableCors({
    // 허용할 출처 목록 (개발 환경용)
    origin: true, // 모든 출처 허용 (개발 환경용)
    // 쿠키 및 인증 헤더 허용
    credentials: true,
  });

  // 글로벌 파이프 설정 - 모든 요청에 대해 자동 데이터 검증
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // 허용되지 않은 속성이 있으면 요청 거부
    transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
  }));

  // 서버 시작 (환경 변수에서 포트 가져오거나 기본값 3000 사용)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  // 서버 시작 로그 출력
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// 애플리케이션 시작
bootstrap();

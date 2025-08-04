import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * TypeORM 설정 - PostgreSQL 데이터베이스 연결 및 엔티티 관리
 * 
 * 주요 설정:
 * - PostgreSQL 데이터베이스 연결
 * - 환경 변수를 통한 설정 관리
 * - 개발/프로덕션 환경별 설정 분기
 * - 자동 테이블 동기화 (개발 환경에서만)
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
    // 데이터베이스 타입 설정
    type: 'postgres',
    // 데이터베이스 호스트 (환경 변수에서 가져오거나 기본값 사용)
    host: process.env.DB_HOST || 'localhost',
    // 데이터베이스 포트 (환경 변수에서 가져오거나 기본값 사용)
    port: parseInt(process.env.DB_PORT || '5432'),
    // 데이터베이스 사용자명 (환경 변수에서 가져오거나 기본값 사용)
    username: process.env.DB_USERNAME || 'postgres',
    // 데이터베이스 비밀번호 (환경 변수에서 가져오거나 기본값 사용)
    password: process.env.DB_PASSWORD || '7682',
    // 데이터베이스명 (환경 변수에서 가져오거나 기본값 사용)
    database: process.env.DB_DATABASE || 'nclist',
    // 엔티티 파일 경로 설정 (src 디렉토리 내의 모든 .entity.ts 파일)
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    // 자동 테이블 동기화 (개발 환경에서 활성화)
    synchronize: true,
    // SQL 로깅 (프로덕션 환경에서는 비활성화)
    logging: process.env.NODE_ENV !== 'production',
};

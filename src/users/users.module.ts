import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * 사용자 모듈 - 사용자 관련 데이터베이스 작업을 관리
 * 
 * 주요 기능:
 * - User 엔티티를 위한 TypeORM 설정
 * - 다른 모듈에서 User 엔티티 사용 가능하도록 내보내기
 * 
 * 현재는 AuthModule에서 User 엔티티를 사용하기 위한 기본 설정만 포함
 * 향후 사용자 관리 기능 확장 시 추가 서비스 및 컨트롤러 추가 가능
 */
@Module({
  imports: [
    // User 엔티티를 위한 TypeORM 설정
    TypeOrmModule.forFeature([User])
  ],
  // 다른 모듈에서 User 엔티티를 사용할 수 있도록 내보내기
  exports: [TypeOrmModule],
})
export class UsersModule {} 
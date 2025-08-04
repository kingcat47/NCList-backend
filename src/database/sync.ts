import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';

async function syncDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '7682',
    database: process.env.DB_DATABASE || 'nclist',
    entities: [User, Store],
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('데이터베이스 연결 성공');

    // 스키마 동기화
    await dataSource.synchronize(true);
    console.log('데이터베이스 스키마 동기화 완료');

    // 테이블 존재 확인
    const userTableExists = await dataSource.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    const storeTableExists = await dataSource.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'stores')"
    );

    console.log('Users 테이블 존재:', userTableExists[0].exists);
    console.log('Stores 테이블 존재:', storeTableExists[0].exists);

    await dataSource.destroy();
    console.log('데이터베이스 연결 종료');
  } catch (error) {
    console.error('데이터베이스 동기화 오류:', error);
    process.exit(1);
  }
}

syncDatabase(); 
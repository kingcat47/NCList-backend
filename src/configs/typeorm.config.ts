import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {

    type: 'postgres',

    host: process.env.DB_HOST || 'localhost',

    port: parseInt(process.env.DB_PORT || '5432'),

    username: process.env.DB_USERNAME || 'postgres',

    password: process.env.DB_PASSWORD || '7682',

    database: process.env.DB_DATABASE || 'nclist',

    entities: [__dirname + '/../**/*.entity.{js,ts}'],

    synchronize: true,

    logging: process.env.NODE_ENV !== 'production',
};

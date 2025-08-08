import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { GptModule } from './gpt/gpt.module';
import { typeOrmConfig } from './configs/typeorm.config';
import vonageConfig from './configs/vonage.config';
import gptConfig from './configs/gpt.config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [gptConfig, vonageConfig],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    StoresModule,
    GptModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

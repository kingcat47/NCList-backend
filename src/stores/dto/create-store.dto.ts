// src/stores/dto/create-store.dto.ts
import { IsIn, IsOptional, IsString } from 'class-validator';
import { Category } from '../entities/store.entity';

export class CreateStoreDto {
    @IsString()
    name: string;

    @IsString()
    location: string;

    @IsString()
    monday: string;

    @IsString()
    tuesday: string;

    @IsString()
    wednesday: string;

    @IsString()
    thursday: string;

    @IsString()
    friday: string;

    @IsString()
    saturday: string;

    @IsString()
    sunday: string;

    @IsString()
    @IsOptional()
    link?: string;

    @IsIn(['음식', '카페', '헬스', '의료', '숙박', '기타'], {
        message: '카테고리는 음식, 카페, 헬스, 의료, 숙박, 기타 중 하나여야 합니다.',
    })
    category: Category;
}

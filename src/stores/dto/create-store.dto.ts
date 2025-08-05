import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(['영업중', '곧마감', '마감'])
  status?: '영업중' | '곧마감' | '마감'; // ✅ optional 처리

  @IsString()
  hours: string;

  @IsEnum(['음식점', '카페', '헬스장', '의료', '숙박', '기타'])
  category: '음식점' | '카페' | '헬스장' | '의료' | '숙박' | '기타';

  @IsOptional()
  @IsString()
  originalUrl?: string;
}

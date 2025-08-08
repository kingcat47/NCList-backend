import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessHourDto {
  @IsString()
  day: string;

  @IsString()
  start: string;

  @IsString()
  end: string;
}

export class StoreInfoDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHourDto)
  business_hours?: BusinessHourDto[];

  @IsString()
  place_id: string;

  @IsString()
  url: string;
}

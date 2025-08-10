import { IsString, Length } from 'class-validator';


export class SendVerificationDto {
  @IsString()
  phoneNumber: string;
} 
import { IsString, Length } from 'class-validator';


export class SendVerificationDto {
  @IsString()
  @Length(11, 11)
  phoneNumber: string;
} 
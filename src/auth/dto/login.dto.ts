import { IsString, IsPhoneNumber, Length } from 'class-validator';

export class LoginDto {

  @IsString()
  phoneNumber: string;


  @IsString()
  @Length(6, 6)
  verificationCode: string;
} 
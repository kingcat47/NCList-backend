import { IsString, IsPhoneNumber, Length } from 'class-validator';

export class LoginDto {

  @IsString()
  @Length(11, 11)
  phoneNumber: string;


  @IsString()
  @Length(6, 6)
  verificationCode: string;
} 
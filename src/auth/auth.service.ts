import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SendVerificationDto } from './dto/send-verification.dto';
import { LoginDto } from './dto/login.dto';
import { Vonage } from '@vonage/server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  async sendVerificationCode(sendVerificationDto: SendVerificationDto)
  {  console.log('들어왔다 이말임');
    const { phoneNumber } = sendVerificationDto;
    
    // 6자리 랜덤 코드 생성 (100000 ~ 999999)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 5분 후 만료 시간 설정
    // const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);


    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    
    if (!user) {

      user = this.userRepository.create({
        phoneNumber,
        verificationCode,
        verificationCodeExpiresAt: expiresAt,
      });
    } else {

      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = expiresAt;
    }


    await this.userRepository.save(user);


    const vonageConfig = this.configService.get('vonage');
    const isVonageEnabled = vonageConfig?.enabled;
    const apiKey = vonageConfig?.apiKey;
    const apiSecret = vonageConfig?.apiSecret;
    const fromNumber = vonageConfig?.fromNumber;

    if (isVonageEnabled && apiKey && apiSecret && fromNumber) {

      try {
        // @ts-ignore - Vonage SDK 타입 정의 문제 임시 해결
        const vonage = new Vonage({
          apiKey: apiKey as string,
          apiSecret: apiSecret as string,
        });

        const formatKoreanNumber = (number: string) => {

          if (number.startsWith('010')) {
            return '+82' + number.substring(1);
          }
          return number;
        };

        await vonage.sms.send(
            {
              from: formatKoreanNumber(fromNumber),
              to: formatKoreanNumber(phoneNumber),
              text: `인증 코드: ${verificationCode}`,
              // @ts-ignore
              type: 'unicode',
            },
        )
        .then(resp => { 
          console.log('SMS 전송 성공'); 
          console.log(resp); 
        })
        .catch(err => { 
          console.log('SMS 전송 중 오류 발생'); 
          console.error(err); 
          throw err; // 에러를 다시 던져서 catch 블록으로 이동
        });

        console.log(`SMS 전송 완료 - ${phoneNumber}: ${verificationCode}`);
      } catch (error) {
        console.error('SMS 전송 중 오류 발생:', error);

        console.log(`개발용 인증 코드 - ${phoneNumber}: ${verificationCode}`);
      }
    } else {

      console.log(`개발용 인증 코드 - ${phoneNumber}: ${verificationCode}`);
      console.log('Vonage 설정 정보:');
      console.log('- 활성화 여부:', isVonageEnabled);
      console.log('- API 키:', apiKey ? '설정됨' : '설정되지 않음');
      console.log('- API 시크릿:', apiSecret ? '설정됨' : '설정되지 않음');
      console.log('- 발신번호:', fromNumber || '설정되지 않음');
    }

    return {
      message: '인증 코드가 전송되었습니다.',
      phoneNumber,
    };
  }

  async verifyCode(loginDto: LoginDto) {
    const { phoneNumber, verificationCode } = loginDto;


    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }


    if (user.verificationCode !== verificationCode) {
      throw new BadRequestException('인증 코드가 일치하지 않습니다.');
    }


    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
      throw new BadRequestException('인증 코드가 만료되었습니다.');
    }


    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const accessToken = this.jwtService.sign(payload);


    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    user.isVerified = true;
    await this.userRepository.save(user);

    return {
      accessToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
    };
  }


  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }
    return user;
  }
} 
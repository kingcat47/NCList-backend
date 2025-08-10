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

  async sendVerificationCode(sendVerificationDto: SendVerificationDto) {
    console.log('들어왔다 이말임');

    let { phoneNumber } = sendVerificationDto;

    // E.164 국제번호 형식으로 맞추기 ( '+' 없으면 붙임 )
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // 6자리 랜덤 코드 생성 (100000 ~ 999999)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일 유효

    // DB에서 사용자 조회 또는 생성
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

    // Vonage 설정값 불러오기
    const vonageConfig = this.configService.get('vonage');
    const isVonageEnabled = vonageConfig?.enabled;
    const apiKey = vonageConfig?.apiKey;
    const apiSecret = vonageConfig?.apiSecret;

    if (isVonageEnabled && apiKey && apiSecret) {
      try {
        // @ts-ignore - Vonage SDK 타입 정의 문제 임시 옵션
        const vonage = new Vonage({
          apiKey: apiKey as string,
          apiSecret: apiSecret as string,
        });

        const yuchan = await vonage.sms.send({
          from: 'Vonage APIs', // 반드시 국제번호(E.164) 형식
          to: phoneNumber,  // 수신자 번호도 E.164 형식
          text: `인증 코드: ${verificationCode}`,
          // @ts-ignore
          type: 'unicode',
        });

        console.log(`SMS 전송 완료 - ${phoneNumber}: ${verificationCode}`);
        console.log('-유찬이의 요청:', yuchan)
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

    }

    return {
      message: '인증 코드가 전송되었습니다.',
      phoneNumber,
    };
  }

  async verifyCode(loginDto: LoginDto) {
    let { phoneNumber, verificationCode } = loginDto;

    // 전화번호 형식 E.164 맞추기
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

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

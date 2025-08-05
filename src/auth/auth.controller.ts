import {Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-verification')
  async sendVerificationCode(@Body() sendVerificationDto: SendVerificationDto) {
    return this.authService.sendVerificationCode(sendVerificationDto);
  }

  @Post('verify-code')
  @HttpCode(HttpStatus.OK) // 응답 상태 코드를 200으로 설정
  async verifyCode(@Body() loginDto: LoginDto) {
    return this.authService.verifyCode(loginDto);
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    return {
      message: '토큰이 유효합니다.',
      user: {
        id: req.user.sub, // JWT payload의 sub (사용자 ID)
        phoneNumber: req.user.phoneNumber, // JWT payload의 phoneNumber
      },
    };
  }

} 
import { registerAs } from '@nestjs/config';

/**
 * Vonage 설정 - SMS 서비스 API 키 관리
 * 
 * 환경 변수에서 Vonage API 키들을 가져와서 타입 안전하게 사용할 수 있도록 설정
 * 
 * 사용법:
 * - ConfigService를 주입받아서 사용
 * - this.configService.get('vonage.apiKey')
 * - this.configService.get('vonage.apiSecret')
 * - this.configService.get('vonage.fromNumber')
 */
export default registerAs('vonage', () => ({
  // Vonage API 키 (환경 변수에서 가져오거나 기본값 사용)
  apiKey: process.env.VONAGE_API_KEY || '',
  // Vonage API 시크릿 (환경 변수에서 가져오거나 기본값 사용)
  apiSecret: process.env.VONAGE_API_SECRET || '',
  // 발신자 전화번호 (환경 변수에서 가져오거나 기본값 사용)
  fromNumber: process.env.VONAGE_FROM_NUMBER || '',
  // SMS 서비스 활성화 여부 (환경 변수에서 가져오거나 기본값 false)
  enabled: process.env.VONAGE_ENABLED === 'true' || false,
})); 
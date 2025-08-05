import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users') 
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: false })
  isVerified: boolean;

  /**
   * SMS 인증 코드 (6자리 숫자)
   * nullable: true로 설정하여 인증 완료 후 null로 초기화
   */
  @Column({ nullable: true })
  verificationCode?: string;

  /**
   * 인증 코드 만료 시간
   * 5분 후 자동 만료되도록 설정
   * nullable: true로 설정하여 인증 완료 후 null로 초기화
   */
  @Column({ nullable: true })
  verificationCodeExpiresAt?: Date;

} 
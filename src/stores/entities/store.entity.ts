import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  // @Column()
  // status: '영업중' | '곧마감' | '마감';

  @Column()
  hours: string;

  @Column()
  category: '음식점' | '카페' | '헬스장' | '의료' | '숙박' | '기타';

  @Column({ nullable: true })
  originalUrl?: string;

  // 사용자와의 관계 추가
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
} 
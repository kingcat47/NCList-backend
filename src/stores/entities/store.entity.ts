// src/stores/entities/store.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum Category {
  음식 = '음식',
  카페 = '카페',
  헬스 = '헬스',
  의료 = '의료',
  숙박 = '숙박',
  기타 = '기타',
}

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  monday: string;

  @Column()
  tuesday: string;

  @Column()
  wednesday: string;

  @Column()
  thursday: string;

  @Column()
  friday: string;

  @Column()
  saturday: string;

  @Column()
  sunday: string;

  @Column()
  category: Category;

  @Column()
  link: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    const store = this.storesRepository.create({
      ...createStoreDto,
      userId: userId
    });
    return await this.storesRepository.save(store);
  }

  async findAll(userId: string): Promise<Store[]> {
    return await this.storesRepository.find({
      where: { userId },
      order: { id: 'DESC' }
    });
  }

  async findOne(id: string, userId: string): Promise<Store | null> {
    return await this.storesRepository.findOne({
      where: { id, userId }
    });
  }


  async remove(id: string, userId: string): Promise<boolean> {
    const store = await this.findOne(id, userId);
    if (!store) {
      return false;
    }
    
    await this.storesRepository.delete(id);
    return true;
  }
}

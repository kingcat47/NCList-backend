import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import {CreateStoreDto} from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    const store = this.storesRepository.create({
      userId: userId,
        name: createStoreDto.name,
        location: createStoreDto.location,
        monday: createStoreDto.monday,
        tuesday: createStoreDto.tuesday,
        wednesday: createStoreDto.wednesday,
        thursday: createStoreDto.thursday,
        friday: createStoreDto.friday,
        saturday: createStoreDto.saturday,
        sunday: createStoreDto.sunday,
        link: createStoreDto.link,
        category: createStoreDto.category,
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

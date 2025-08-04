import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
    const userId = req.user.id;
    const store = await this.storesService.create(createStoreDto, userId);
    return {
      success: true,
      data: store
    };
  }

  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    const stores = await this.storesService.findAll(userId);
    return {
      success: true,
      data: stores
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const store = await this.storesService.findOne(id, userId);
    
    if (!store) {
      return {
        success: false,
        message: '가게 정보를 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      data: store
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const deleted = await this.storesService.remove(id, userId);
    
    if (!deleted) {
      return {
        success: false,
        message: '가게 정보를 찾을 수 없습니다.'
      };
    }
    
    return {
      success: true,
      message: '가게 정보가 삭제되었습니다.'
    };
  }
}

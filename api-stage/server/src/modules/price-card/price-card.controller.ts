import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { PriceCardService } from './price-card.service';
import { CreatePriceCardDto, PriceType } from './dto/create-price-card.dto';
import { UpdatePriceCardDto } from './dto/update-price-card.dto';
import {
  FindAllPriceCardsDto,
  FindPriceCardsDto,
  LatestPriceQueryDto,
} from './dto/find-price-cards.dto';
import { type Request } from 'express';

@Controller('price-cards')
export class PriceCardController {
  constructor(private readonly priceCardService: PriceCardService) { }

  @Post()
  create(@Body() createDto: CreatePriceCardDto, @Req() req: Request) {
    const userId = (req as any)?.user?.id as string | undefined;
    return this.priceCardService.create(createDto, userId);
  }

  @Get()
  findAll(@Query() query: FindAllPriceCardsDto) {
    return this.priceCardService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.priceCardService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePriceCardDto,
    @Req() req: Request,
  ) {
    const userId = (req as any)?.user?.id as string | undefined;
    return this.priceCardService.update(id, updateDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priceCardService.remove(id);
  }

  @Get('product/:productId')
  findByStok(
    @Param('productId') productId: string,
    @Query() query: FindPriceCardsDto,
  ) {
    return this.priceCardService.findByStok(productId, query);
  }

  @Get('product/:productId/latest')
  findLatest(
    @Param('productId') productId: string,
    @Query() query: LatestPriceQueryDto,
  ) {
    const type = query.type ?? PriceType.SALE;
    return this.priceCardService.findLatest(productId, type);
  }
}

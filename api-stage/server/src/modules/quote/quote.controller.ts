import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { QueryQuoteDto } from './dto/query-quote.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Quotes')
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) { }

  @Get()
  findAll(@Query() query: QueryQuoteDto) {
    return this.quoteService.findAll(
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 50,
      query.type as any,
      query.search,
      query.accountId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(id);
  }

  @Post()
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.quoteService.create(
      createQuoteDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.quoteService.update(
      id,
      updateQuoteDto,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    return this.quoteService.remove(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.quoteService.changeStatus(
      id,
      status as any,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/convert-to-order')
  convertToOrder(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.quoteService.convertToOrder(
      id,
      user?.userId,
      req.ip,
      req.headers['user-agent'],
    );
  }
}

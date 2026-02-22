import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WorkOrderItemService } from './work-order-item.service';
import { CreateWorkOrderItemDto, UpdateWorkOrderItemDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('work-order-item')
export class WorkOrderItemController {
  constructor(private readonly workOrderItemService: WorkOrderItemService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderItemDto) {
    return this.workOrderItemService.create(dto);
  }

  @Get('work-order/:workOrderId')
  findAll(@Param('workOrderId') workOrderId: string) {
    return this.workOrderItemService.findAll(workOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrderItemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrderItemDto) {
    return this.workOrderItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workOrderItemService.remove(id);
  }
}

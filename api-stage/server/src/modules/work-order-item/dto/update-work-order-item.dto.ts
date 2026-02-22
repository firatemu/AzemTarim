import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkOrderItemDto } from './create-work-order-item.dto';

export class UpdateWorkOrderItemDto extends PartialType(CreateWorkOrderItemDto) {}

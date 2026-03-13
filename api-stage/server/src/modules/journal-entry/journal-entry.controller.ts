import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalEntryService } from './journal-entry.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('journal-entries')
export class JournalEntryController {
  constructor(private readonly journalEntryService: JournalEntryService) { }

  @Get('by-reference/:referenceType/:referenceId')
  findByReference(
    @Param('referenceType') referenceType: string,
    @Param('referenceId') referenceId: string,
  ) {
    return this.journalEntryService.findByReference(
      referenceType,
      referenceId,
    );
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('referenceType') referenceType?: string,
    @Query('referenceId') referenceId?: string,
  ) {
    return this.journalEntryService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
      referenceType,
      referenceId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalEntryService.findOne(id);
  }
}

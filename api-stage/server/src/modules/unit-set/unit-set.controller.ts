import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UnitSetService } from './unit-set.service';
import { CreateUnitSetDto, UpdateUnitSetDto } from './dto/unit-set.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Unit Sets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('unit-sets')
export class UnitSetController {
    constructor(private readonly unitSetService: UnitSetService) { }

    @Get()
    @ApiOperation({ summary: 'Tüm birim setlerini listele (sistem + tenant)' })
    findAll() {
        return this.unitSetService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Tek birim setini getir' })
    @ApiParam({ name: 'id', description: 'Birim seti UUID' })
    findOne(@Param('id') id: string) {
        return this.unitSetService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Yeni birim seti oluştur (yalnızca tenant)' })
    create(@Body() dto: CreateUnitSetDto) {
        return this.unitSetService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Birim setini güncelle (yalnızca tenant)' })
    @ApiParam({ name: 'id', description: 'Birim seti UUID' })
    update(@Param('id') id: string, @Body() dto: UpdateUnitSetDto) {
        return this.unitSetService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Birim setini sil (yalnızca tenant, ürün bağlantısı yoksa)' })
    @ApiParam({ name: 'id', description: 'Birim seti UUID' })
    remove(@Param('id') id: string) {
        return this.unitSetService.remove(id);
    }

    @Post('ensure-defaults')
    @ApiOperation({
        summary: 'Sistem varsayılan birim setlerini oluştur',
        description: 'Adet, Ağırlık, Hacim, Uzunluk, Alan ve Ambalaj birim setlerini sistem için oluşturur'
    })
    async ensureDefaults() {
        await this.unitSetService.ensureSystemDefaults();
        return {
            success: true,
            message: 'Sistem varsayılan birim setleri oluşturuldu',
        };
    }

    @Get('default/b2b')
    @ApiOperation({
        summary: 'B2B için varsayılan birimi getir',
        description: 'B2B ürünleri için varsayılan birim (Adet) bilgisini döndürür'
    })
    async getDefaultB2BUnit() {
        return this.unitSetService.getDefaultB2BUnit();
    }
}

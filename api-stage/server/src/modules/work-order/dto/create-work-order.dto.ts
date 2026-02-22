import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateWorkOrderDto {
  @IsNotEmpty()
  @IsString()
  customerVehicleId: string;

  @IsNotEmpty()
  @IsString()
  cariId: string;

  @IsOptional()
  @IsString()
  technicianId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  estimatedCompletionDate?: string;

  @IsOptional()
  @IsString()
  diagnosisNotes?: string;
}

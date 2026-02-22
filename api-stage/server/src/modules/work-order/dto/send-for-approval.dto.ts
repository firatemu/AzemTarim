import { IsNotEmpty, IsString } from 'class-validator';

export class SendForApprovalDto {
  @IsNotEmpty()
  @IsString()
  diagnosisNotes: string;
}

import { BaseExamDto } from './base-exam.dto';

export class UpdateExamDto extends BaseExamDto {
  updatedAt: number;
  numOfUse?: number;
}

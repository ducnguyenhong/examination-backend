export class BaseExamHistoryDto {
  // title: string;
  studentId: string;
  result: { questionId: string; answer: string }[];
  score: number;
  startedAt: number;
  periodTime: number;
  examId?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

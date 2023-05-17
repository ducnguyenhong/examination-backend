export class BaseExamHistoryDto {
  // title: string;
  studentId: string;
  subjectId: string;
  result: { questionId: string; answer: string }[];
  score: number;
  startedAt: number;
  periodTime: number;
  examId?: string;
}

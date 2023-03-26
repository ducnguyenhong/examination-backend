export class BaseExamDto {
  title: string;
  subjectId: string;
  // teacherId: string;
  questionIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  password?: string;
}

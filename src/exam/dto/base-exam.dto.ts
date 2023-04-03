export class BaseExamDto {
  title: string;
  subjectId: string;
  // creatorId: string;
  questionIds: string[];
  publishAt?: number;
  password?: string;
}

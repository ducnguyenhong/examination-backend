export class BaseQuestionDto {
  title: string;
  answers: { label: string; value: string; isCorrect: boolean }[];
  level: number;
  subjectId: string;
  topicId: string;
  // creatorId: string;
  security: boolean;
  explanation: string;
}

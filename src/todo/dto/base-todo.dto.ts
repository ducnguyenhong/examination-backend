export class BaseTodoDto {
  title: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

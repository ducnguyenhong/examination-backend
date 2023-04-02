export class BaseUserDto {
  username: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  subjectIds?: string[];
  avatar?: string;
  school?: string;
  address?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE';
  id?: string;
}

export interface Record {
  date: string | number | Date;
  id: string;
  text: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  userId: string;
  createdAt: Date;
}
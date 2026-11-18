export interface Account {
  id: number;
  iban: string;
  name: string;
  status: 'active' | 'closed';
  balance: number;
  currency: string;
}

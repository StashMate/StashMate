import { Timestamp } from 'firebase/firestore';

export type Transaction = {
    id?: string;
    name: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string | Timestamp;
    paymentMethod?: string;
    accountId?: string;
    icon?: string;
};

 
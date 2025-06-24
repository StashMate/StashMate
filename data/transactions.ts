export type Transaction = {
    icon: string;
    name: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
};

export const transactions: Transaction[] = [
    { icon: 'cart-outline', name: 'Fresh Foods Market', category: 'Groceries', amount: 65.20, type: 'expense', date: '2024-10-21' },
    { icon: 'briefcase-outline', name: 'Tech Solutions Inc.', category: 'Salary', amount: 3500.00, type: 'income', date: '2024-10-20' },
    { icon: 'lightbulb-on-outline', name: 'Power & Light Co.', category: 'Utilities', amount: 120.50, type: 'expense', date: '2024-10-20' },
    { icon: 'silverware-fork-knife', name: 'The Cozy Corner Cafe', category: 'Dining', amount: 45.75, type: 'expense', date: '2024-10-19' },
    { icon: 'home-outline', name: 'Property Management LLC', category: 'Rent', amount: 1200.00, type: 'expense', date: '2024-10-15' },
    { icon: 'filmstrip', name: 'Cinema City', category: 'Entertainment', amount: 30.00, type: 'expense', date: '2024-10-15' },
]; 
// Mock loan data for demonstration
export const mockLoans = [
    {
        id: '1',
        type: 'lent', // 'lent' or 'borrowed'
        amount: 5000,
        borrowerName: 'John Doe',
        borrowerEmail: 'john@example.com',
        lenderName: 'You',
        lenderEmail: 'you@example.com',
        interestRate: 0,
        status: 'active', // 'active', 'completed', 'overdue'
        dueDate: '2026-03-15',
        createdAt: '2026-01-15',
        description: 'Emergency medical expenses',
        repaymentSchedule: 'monthly',
        amountPaid: 1000,
        payments: [
            { id: 'p1', amount: 500, date: '2026-01-20', status: 'completed' },
            { id: 'p2', amount: 500, date: '2026-02-01', status: 'completed' }
        ]
    },
    {
        id: '2',
        type: 'borrowed',
        amount: 3000,
        borrowerName: 'You',
        borrowerEmail: 'you@example.com',
        lenderName: 'Sarah Smith',
        lenderEmail: 'sarah@example.com',
        interestRate: 0,
        status: 'active',
        dueDate: '2026-02-28',
        createdAt: '2026-01-10',
        description: 'Car repair',
        repaymentSchedule: 'lump-sum',
        amountPaid: 0,
        payments: []
    },
    {
        id: '3',
        type: 'lent',
        amount: 10000,
        borrowerName: 'Mike Johnson',
        borrowerEmail: 'mike@example.com',
        lenderName: 'You',
        lenderEmail: 'you@example.com',
        interestRate: 2,
        status: 'active',
        dueDate: '2026-06-01',
        createdAt: '2025-12-01',
        description: 'Business startup loan',
        repaymentSchedule: 'monthly',
        amountPaid: 2000,
        payments: [
            { id: 'p3', amount: 1000, date: '2026-01-01', status: 'completed' },
            { id: 'p4', amount: 1000, date: '2026-01-15', status: 'completed' }
        ]
    },
    {
        id: '4',
        type: 'lent',
        amount: 2000,
        borrowerName: 'Emily Davis',
        borrowerEmail: 'emily@example.com',
        lenderName: 'You',
        lenderEmail: 'you@example.com',
        interestRate: 0,
        status: 'completed',
        dueDate: '2026-01-20',
        createdAt: '2025-12-20',
        description: 'Holiday shopping',
        repaymentSchedule: 'lump-sum',
        amountPaid: 2000,
        payments: [
            { id: 'p5', amount: 2000, date: '2026-01-18', status: 'completed' }
        ]
    },
    {
        id: '5',
        type: 'borrowed',
        amount: 7500,
        borrowerName: 'You',
        borrowerEmail: 'you@example.com',
        lenderName: 'Robert Wilson',
        lenderEmail: 'robert@example.com',
        interestRate: 1.5,
        status: 'overdue',
        dueDate: '2026-01-25',
        createdAt: '2025-11-25',
        description: 'Education expenses',
        repaymentSchedule: 'monthly',
        amountPaid: 2500,
        payments: [
            { id: 'p6', amount: 1250, date: '2025-12-25', status: 'completed' },
            { id: 'p7', amount: 1250, date: '2026-01-10', status: 'completed' }
        ]
    }
];

export const mockUser = {
    id: 'user1',
    name: 'You',
    email: 'you@example.com'
};

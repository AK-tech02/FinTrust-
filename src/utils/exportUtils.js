export const exportLoansToCSV = (loans) => {
    if (!loans || loans.length === 0) return;

    // Define CSV headers
    const headers = [
        'ID',
        'Type',
        'Status',
        'Amount (INR)',
        'Amount Paid (INR)',
        'Interest Rate (%)',
        'Due Date',
        'Created At',
        'Borrower Name',
        'Borrower Email',
        'Lender Name',
        'Lender Email',
        'Repayment Schedule',
        'Notes'
    ];

    // Format rows
    const rows = loans.map(loan => {
        return [
            loan.id,
            loan.type,
            loan.status,
            loan.amount,
            loan.amountPaid || 0,
            loan.interestRate || 0,
            new Date(loan.dueDate).toLocaleDateString(),
            loan.createdAt?.toDate ? loan.createdAt.toDate().toLocaleDateString() : loan.createdAt,
            `"${loan.borrowerName || ''}"`,
            loan.borrowerEmail || '',
            `"${loan.lenderName || ''}"`,
            loan.lenderEmail || '',
            loan.repaymentSchedule || 'lump_sum',
            `"${(loan.description || '').replace(/"/g, '""')}"`
        ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const fileName = `fintrust_loans_export_${new Date().toISOString().split('T')[0]}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { useLoan } from '../context/LoanContext';
import './Charts.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Theme-aware chart configuration
const getChartOptions = (title, isDarkTheme) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                color: isDarkTheme ? '#FFFFFF' : '#000000',
                padding: 15,
                font: {
                    size: 12,
                    family: 'Inter'
                }
            }
        },
        title: {
            display: true,
            text: title,
            color: isDarkTheme ? '#FFFFFF' : '#000000',
            font: {
                size: 16,
                weight: 'bold',
                family: 'Poppins'
            },
            padding: 20
        },
        tooltip: {
            backgroundColor: isDarkTheme ? '#1A1A1A' : '#FFFFFF',
            titleColor: isDarkTheme ? '#FFFFFF' : '#000000',
            bodyColor: isDarkTheme ? '#E0E0E0' : '#495057',
            borderColor: isDarkTheme ? '#00D9FF' : '#DEE2E6',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }
    },
    scales: {
        x: {
            grid: {
                color: isDarkTheme ? '#2A2A2A' : '#E9ECEF',
                borderColor: isDarkTheme ? '#2A2A2A' : '#DEE2E6'
            },
            ticks: {
                color: isDarkTheme ? '#B0B0B0' : '#6C757D'
            }
        },
        y: {
            grid: {
                color: isDarkTheme ? '#2A2A2A' : '#E9ECEF',
                borderColor: isDarkTheme ? '#2A2A2A' : '#DEE2E6'
            },
            ticks: {
                color: isDarkTheme ? '#B0B0B0' : '#6C757D'
            }
        }
    }
});

// Loan Distribution Chart (Doughnut)
export const LoanDistributionChart = () => {
    const { loans } = useLoan();
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'night';

    const lentLoans = loans.filter(l => l.type === 'lent');
    const borrowedLoans = loans.filter(l => l.type === 'borrowed');

    const lentAmount = lentLoans.reduce((sum, l) => sum + (l.amount - l.amountPaid), 0);
    const borrowedAmount = borrowedLoans.reduce((sum, l) => sum + (l.amount - l.amountPaid), 0);

    const data = {
        labels: ['Lent Out', 'Borrowed'],
        datasets: [{
            data: [lentAmount, borrowedAmount],
            backgroundColor: [
                'rgba(0, 217, 255, 0.8)',  // Neon cyan
                'rgba(0, 255, 163, 0.8)'   // Neon green
            ],
            borderColor: [
                'rgba(0, 217, 255, 1)',
                'rgba(0, 255, 163, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 10
        }]
    };

    const options = {
        ...getChartOptions('Loan Distribution', isDarkTheme),
        cutout: '65%',
        plugins: {
            ...getChartOptions('', isDarkTheme).plugins,
            legend: {
                ...getChartOptions('', isDarkTheme).plugins.legend,
                position: 'bottom'
            }
        }
    };

    return (
        <div className="chart-container">
            <Doughnut data={data} options={options} />
            <div className="chart-center-text">
                <div className="chart-total">₹{(lentAmount + borrowedAmount).toLocaleString()}</div>
                <div className="chart-label">Total Active</div>
            </div>
        </div>
    );
};

// Payment Trend Chart (Line)
export const PaymentTrendChart = () => {
    const { loans, activities } = useLoan();
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'night';

    // Get payment activities from last 6 months
    const getMonthlyPayments = () => {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push({
                name: monthName,
                amount: 0
            });
        }

        // Aggregate payment amounts by month
        const paymentActivities = activities.filter(a => a.type === 'PAYMENT_MADE');
        paymentActivities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const monthsAgo = (now.getMonth() - date.getMonth()) + (12 * (now.getYear() - date.getYear()));

            if (monthsAgo >= 0 && monthsAgo < 6) {
                const index = 5 - monthsAgo;
                months[index].amount += activity.metadata?.amount || 0;
            }
        });

        return months;
    };

    const monthlyData = getMonthlyPayments();

    const data = {
        labels: monthlyData.map(m => m.name),
        datasets: [{
            label: 'Payments',
            data: monthlyData.map(m => m.amount),
            fill: true,
            borderColor: 'rgb(0, 217, 255)',
            backgroundColor: isDarkTheme
                ? 'rgba(0, 217, 255, 0.1)'
                : 'rgba(0, 217, 255, 0.2)',
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: 'rgb(0, 217, 255)',
            pointBorderColor: isDarkTheme ? '#000' : '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const options = getChartOptions('Payment Trends (Last 6 Months)', isDarkTheme);

    return (
        <div className="chart-container">
            <Line data={data} options={options} />
        </div>
    );
};

// Monthly Analytics Chart (Bar)
export const MonthlyAnalyticsChart = () => {
    const { loans } = useLoan();
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'night';

    // Get data for current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyLoans = loans.filter(loan => {
        const loanDate = new Date(loan.createdAt || loan.dueDate);
        return loanDate.getMonth() === currentMonth && loanDate.getFullYear() === currentYear;
    });

    const activeLoans = monthlyLoans.filter(l => l.status === 'active').length;
    const completedLoans = monthlyLoans.filter(l => l.status === 'completed').length;
    const overdueLoans = monthlyLoans.filter(l => l.status === 'overdue').length;

    const data = {
        labels: ['Active', 'Completed', 'Overdue'],
        datasets: [{
            label: 'Count',
            data: [activeLoans, completedLoans, overdueLoans],
            backgroundColor: [
                'rgba(0, 217, 255, 0.8)',
                'rgba(0, 255, 136, 0.8)',
                'rgba(255, 0, 229, 0.8)'
            ],
            borderColor: [
                'rgba(0, 217, 255, 1)',
                'rgba(0, 255, 136, 1)',
                'rgba(255, 0, 229, 1)'
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const options = {
        ...getChartOptions('This Month\'s Loans', isDarkTheme),
        scales: {
            ...getChartOptions('', isDarkTheme).scales,
            y: {
                ...getChartOptions('', isDarkTheme).scales.y,
                beginAtZero: true,
                ticks: {
                    ...getChartOptions('', isDarkTheme).scales.y.ticks,
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="chart-container">
            <Bar data={data} options={options} />
        </div>
    );
};

// Status Overview Chart (Pie)
export const StatusOverviewChart = () => {
    const { loans } = useLoan();
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'night';

    const activeLoans = loans.filter(l => l.status === 'active');
    const completedLoans = loans.filter(l => l.status === 'completed');
    const overdueLoans = loans.filter(l => l.status === 'overdue');

    const data = {
        labels: ['Active', 'Completed', 'Overdue'],
        datasets: [{
            data: [activeLoans.length, completedLoans.length, overdueLoans.length],
            backgroundColor: [
                'rgba(0, 217, 255, 0.8)',
                'rgba(0, 255, 136, 0.8)',
                'rgba(255, 0, 229, 0.8)'
            ],
            borderColor: [
                'rgba(0, 217, 255, 1)',
                'rgba(0, 255, 136, 1)',
                'rgba(255, 0, 229, 1)'
            ],
            borderWidth: 2,
            hoverOffset: 10
        }]
    };

    const options = getChartOptions('Loan Status Overview', isDarkTheme);

    return (
        <div className="chart-container">
            <Pie data={data} options={options} />
        </div>
    );
};

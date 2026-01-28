import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { mockLoans } from '../utils/mockData';

const LoanContext = createContext();

export const useLoan = () => {
    const context = useContext(LoanContext);
    if (!context) {
        throw new Error('useLoan must be used within a LoanProvider');
    }
    return context;
};

export const LoanProvider = ({ children }) => {
    const [loans, setLoans] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [gamification, setGamification] = useState({
        points: 0,
        level: 1,
        badges: [],
        streak: 0,
        trustScore: 50,
        stats: {
            totalLoans: 0,
            completedLoans: 0,
            totalPayments: 0,
            onTimePayments: 0,
            lastPaymentDate: null
        }
    });
    const [activities, setActivities] = useState([]);

    // Auth state listener
    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Initial session:', session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event, session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Load mock data on mount
    // Helper function to map database fields to app format
    const mapLoanFromDB = (dbLoan) => ({
        id: dbLoan.id,
        type: dbLoan.type,
        amount: parseFloat(dbLoan.amount),
        amountPaid: parseFloat(dbLoan.amount_paid) || 0,
        currency: dbLoan.currency,
        interestRate: parseFloat(dbLoan.interest_rate) || 0,
        borrowerName: dbLoan.borrower_name,
        borrowerEmail: dbLoan.borrower_email,
        lenderName: dbLoan.lender_name,
        lenderEmail: dbLoan.lender_email,
        status: dbLoan.status,
        dueDate: dbLoan.due_date,
        description: dbLoan.description,
        repaymentSchedule: dbLoan.repayment_schedule,
        metadata: dbLoan.metadata,
        createdAt: dbLoan.created_at,
        payments: dbLoan.payments || []
    });

    // FETCH LOANS
    const fetchLoans = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('loans')
                .select(`
                    *,
                    payments (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            const mappedLoans = (data || []).map(mapLoanFromDB);
            setLoans(mappedLoans);
        } catch (error) {
            console.error('Error fetching loans:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // FETCH ACTIVITIES
    const fetchActivities = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setActivities(data || []);
        } catch (error) {
            console.error('Error fetching activities:', error.message);
        }
    };

    // Initial Load
    useEffect(() => {
        if (user) {
            fetchLoans();
            fetchActivities();
        } else {
            setLoans([]);
            setActivities([]);
        }
    }, [user]);

    // CREATE LOAN
    const createLoan = async (loanData) => {
        console.log('createLoan called with:', loanData);
        if (!user) {
            console.error('No user authenticated');
            return { success: false, error: 'User not authenticated' };
        }
        setLoading(true);
        try {
            // Map camelCase to snake_case for database
            const newLoanProto = {
                user_id: user.id,
                type: loanData.type,
                amount: loanData.amount,
                amount_paid: 0,
                currency: loanData.currency || 'INR',
                interest_rate: loanData.interestRate || 0,
                borrower_name: loanData.borrowerName,
                borrower_email: loanData.borrowerEmail,
                lender_name: loanData.lenderName,
                lender_email: loanData.lenderEmail,
                status: 'active',
                due_date: loanData.dueDate,
                description: loanData.description,
                repayment_schedule: loanData.repaymentSchedule,
                metadata: loanData.metadata || {}
            };

            console.log('Inserting loan to DB:', newLoanProto);

            const { data, error } = await supabase
                .from('loans')
                .insert([newLoanProto])
                .select()
                .single();

            if (error) throw error;

            console.log('Loan created successfully:', data);
            const mappedLoan = mapLoanFromDB(data);
            setLoans(prevLoans => [mappedLoan, ...prevLoans]);

            // Log activity
            logActivity(
                'LOAN_CREATED',
                `Created ${loanData.type} loan ${loanData.type === 'lent' ? 'to' : 'from'} ${loanData.type === 'lent' ? loanData.borrowerName : loanData.lenderName} for ₹${loanData.amount}`,
                mappedLoan.id,
                { amount: loanData.amount, type: loanData.type }
            );

            // Update gamification stats
            updateStatsOnLoanCreate();

            setLoading(false);
            return { success: true, loan: mappedLoan };
        } catch (error) {
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    // GET LOANS BY USER
    const getLoansByUser = (filter = 'all') => {
        let filteredLoans = [...loans];

        if (filter === 'lent') {
            filteredLoans = filteredLoans.filter(loan => loan.type === 'lent');
        } else if (filter === 'borrowed') {
            filteredLoans = filteredLoans.filter(loan => loan.type === 'borrowed');
        } else if (filter === 'active') {
            filteredLoans = filteredLoans.filter(loan => loan.status === 'active');
        } else if (filter === 'completed') {
            filteredLoans = filteredLoans.filter(loan => loan.status === 'completed');
        } else if (filter === 'overdue') {
            filteredLoans = filteredLoans.filter(loan => loan.status === 'overdue');
        }

        return filteredLoans;
    };

    // GET LOAN DETAILS
    const getLoanDetails = (loanId) => {
        return loans.find(loan => loan.id === loanId);
    };

    // UPDATE LOAN
    const updateLoan = async (loanId, updatedData) => {
        if (!user) return { success: false, error: 'User not authenticated' };
        setLoading(true);
        try {
            // Map camelCase to snake_case for database
            const updateProto = {};
            if (updatedData.amount !== undefined) updateProto.amount = updatedData.amount;
            if (updatedData.interestRate !== undefined) updateProto.interest_rate = updatedData.interestRate;
            if (updatedData.borrowerName !== undefined) updateProto.borrower_name = updatedData.borrowerName;
            if (updatedData.borrowerEmail !== undefined) updateProto.borrower_email = updatedData.borrowerEmail;
            if (updatedData.lenderName !== undefined) updateProto.lender_name = updatedData.lenderName;
            if (updatedData.lenderEmail !== undefined) updateProto.lender_email = updatedData.lenderEmail;
            if (updatedData.status !== undefined) updateProto.status = updatedData.status;
            if (updatedData.dueDate !== undefined) updateProto.due_date = updatedData.dueDate;
            if (updatedData.description !== undefined) updateProto.description = updatedData.description;
            if (updatedData.repaymentSchedule !== undefined) updateProto.repayment_schedule = updatedData.repaymentSchedule;

            const { error } = await supabase
                .from('loans')
                .update(updateProto)
                .eq('id', loanId);

            if (error) throw error;

            setLoans(prevLoans =>
                prevLoans.map(loan =>
                    loan.id === loanId ? { ...loan, ...updatedData } : loan
                )
            );

            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    // DELETE LOAN
    const deleteLoan = async (loanId) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('loans')
                .delete()
                .eq('id', loanId);

            if (error) throw error;

            setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanId));

            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    // LOGIN
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    // SIGNUP
    const signup = async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    // LOGOUT
    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setIsAuthenticated(false);
        setUser(null);
    };

    // Calculate statistics
    const getStats = () => {
        const lent = loans.filter(l => l.type === 'lent');
        const borrowed = loans.filter(l => l.type === 'borrowed');

        return {
            totalLent: lent.reduce((sum, loan) => sum + loan.amount, 0),
            totalBorrowed: borrowed.reduce((sum, loan) => sum + loan.amount, 0),
            totalLentPaid: lent.reduce((sum, loan) => sum + loan.amountPaid, 0),
            totalBorrowedPaid: borrowed.reduce((sum, loan) => sum + loan.amountPaid, 0),
            activeLent: lent.filter(l => l.status === 'active').length,
            activeBorrowed: borrowed.filter(l => l.status === 'active').length,
            completedLoans: loans.filter(l => l.status === 'completed').length,
            overdueLoans: loans.filter(l => l.status === 'overdue').length
        };
    };

    // ADD REPAYMENT
    const addRepayment = async (loanId, paymentData) => {
        if (!user) return { success: false, error: 'User not authenticated' };
        setLoading(true);
        try {
            // 1. Create payment record
            const { data: payment, error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    loan_id: loanId,
                    user_id: user.id,
                    amount: paymentData.amount,
                    date: paymentData.date,
                    status: 'completed'
                }])
                .select()
                .single();

            if (paymentError) throw paymentError;

            // 2. Update loan amount_paid
            const loan = loans.find(l => l.id === loanId);
            const updatedAmountPaid = (loan.amountPaid || 0) + parseFloat(paymentData.amount);

            // Using direct update instead of updateLoan to avoid circular dependency/recursion if it calls other things
            const { error: loanError } = await supabase
                .from('loans')
                .update({ amount_paid: updatedAmountPaid })
                .eq('id', loanId);

            if (loanError) throw loanError;

            // Update local state
            setLoans(prevLoans =>
                prevLoans.map(loan => {
                    if (loan.id === loanId) {
                        return {
                            ...loan,
                            payments: [payment, ...(loan.payments || [])], // Prepend new payment
                            amountPaid: updatedAmountPaid
                        };
                    }
                    return loan;
                })
            );

            // Update gamification stats
            if (loan) {
                updateStatsOnPayment(paymentData.date, loan.dueDate);
            }

            // Log activity
            logActivity(
                'PAYMENT_MADE',
                `Payment of ₹${paymentData.amount} made for loan`,
                loanId,
                { amount: paymentData.amount, date: paymentData.date }
            );

            // Auto-update loan status after payment
            await updateLoanStatus(loanId);

            setLoading(false);
            return { success: true, payment };
        } catch (error) {
            setLoading(false);
            return { success: false, error: error.message };
        }
    };

    // GET REPAYMENTS BY LOAN
    const getRepaymentsByLoan = (loanId) => {
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return [];

        // Sort by date, newest first
        return [...loan.payments].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
    };

    // CALCULATE OUTSTANDING AMOUNT
    const calculateOutstandingAmount = (loanId) => {
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return 0;

        let outstanding = loan.amount - loan.amountPaid;

        // Add interest if applicable
        if (loan.interestRate && loan.interestRate > 0) {
            const interest = (loan.amount * loan.interestRate) / 100;
            outstanding += interest;
        }

        return Math.max(0, outstanding); // Never negative
    };

    // UPDATE LOAN STATUS (auto-called after payment)
    const updateLoanStatus = async (loanId) => {
        const loan = loans.find(l => l.id === loanId);
        if (!loan) return { success: false };

        let newStatus = loan.status;
        const outstanding = calculateOutstandingAmount(loanId);
        const today = new Date();
        const dueDate = new Date(loan.dueDate);

        // Determine new status
        if (outstanding <= 0 || loan.amountPaid >= loan.amount) {
            newStatus = 'completed';
        } else if (dueDate < today) {
            newStatus = 'overdue';
        } else {
            newStatus = 'active';
        }

        // Only update if status changed
        if (newStatus !== loan.status) {
            setLoans(prevLoans =>
                prevLoans.map(l =>
                    l.id === loanId ? { ...l, status: newStatus } : l
                )
            );

            // Log activity for status change
            if (newStatus === 'completed') {
                logActivity(
                    'LOAN_COMPLETED',
                    `Loan marked as completed`,
                    loanId,
                    { previousStatus: loan.status, newStatus }
                );
            } else if (newStatus === 'overdue') {
                logActivity(
                    'LOAN_OVERDUE',
                    `Loan is now overdue`,
                    loanId,
                    { previousStatus: loan.status, newStatus, dueDate: loan.dueDate }
                );
            }

            // If loan just completed, update gamification
            if (newStatus === 'completed' && loan.status !== 'completed') {
                updateStatsOnLoanComplete();
            }
        }

        return { success: true, status: newStatus };
    };

    // === GAMIFICATION FUNCTIONS ===

    // Save gamification to localStorage
    useEffect(() => {
        localStorage.setItem('fintrust_gamification', JSON.stringify(gamification));
    }, [gamification]);

    // Award points for actions
    const awardPoints = (amount, reason) => {
        setGamification(prev => {
            const newPoints = prev.points + amount;
            const newLevel = getLevel(newPoints);
            return {
                ...prev,
                points: newPoints,
                level: newLevel
            };
        });
    };

    // Get level from points
    const getLevel = (points) => {
        const levels = [
            { level: 1, min: 0 },
            { level: 2, min: 500 },
            { level: 3, min: 1000 },
            { level: 4, min: 2000 },
            { level: 5, min: 5000 },
            { level: 6, min: 10000 }
        ];

        for (let i = levels.length - 1; i >= 0; i--) {
            if (points >= levels[i].min) return levels[i].level;
        }
        return 1;
    };

    // Check and unlock badges
    const checkAndUnlockBadges = () => {
        const badgeDefinitions = [
            { id: 'first_loan', condition: gamification.stats.totalLoans >= 1 },
            { id: 'regular_payer', condition: gamification.stats.totalPayments >= 5 },
            { id: 'responsible', condition: gamification.stats.completedLoans >= 1 },
            { id: 'streak_7', condition: gamification.streak >= 7 },
            { id: 'streak_30', condition: gamification.streak >= 30 },
            { id: 'loan_master', condition: gamification.stats.totalLoans >= 10 },
            { id: 'trust_80', condition: gamification.trustScore >= 80 },
            {
                id: 'perfect', condition: gamification.stats.totalPayments >= 10 &&
                    gamification.stats.onTimePayments === gamification.stats.totalPayments
            }
        ];

        const newBadges = [];
        badgeDefinitions.forEach(badge => {
            if (badge.condition && !gamification.badges.includes(badge.id)) {
                newBadges.push(badge.id);
            }
        });

        if (newBadges.length > 0) {
            setGamification(prev => ({
                ...prev,
                badges: [...prev.badges, ...newBadges]
            }));
        }

        return newBadges;
    };

    // Calculate trust score
    const calculateTrustScore = () => {
        const stats = gamification.stats;

        // On-time payment rate (40%)
        const onTimeRate = stats.totalPayments > 0
            ? (stats.onTimePayments / stats.totalPayments) * 40
            : 20;

        // Completion rate (30%)
        const completionRate = stats.totalLoans > 0
            ? (stats.completedLoans / stats.totalLoans) * 30
            : 15;

        // Active loan management (10%)
        const activeLoans = loans.filter(l => l.status === 'active').length;
        const loanManagement = Math.min(activeLoans * 2, 10);

        // Recency score (20%)
        const recencyScore = 20; // Default for now

        const score = Math.round(onTimeRate + completionRate + loanManagement + recencyScore);

        setGamification(prev => ({
            ...prev,
            trustScore: Math.min(100, Math.max(0, score))
        }));
    };

    // Update stats when loan is created
    const updateStatsOnLoanCreate = () => {
        const isFirst = gamification.stats.totalLoans === 0;

        setGamification(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                totalLoans: prev.stats.totalLoans + 1
            }
        }));

        // Award points
        if (isFirst) {
            awardPoints(100, 'First loan created');
        } else {
            awardPoints(50, 'Loan created');
        }

        // Check badges and trust score
        setTimeout(() => {
            checkAndUnlockBadges();
            calculateTrustScore();
        }, 500);
    };

    // Update stats when payment is made
    const updateStatsOnPayment = (paymentDate, dueDate) => {
        const isOnTime = new Date(paymentDate) <= new Date(dueDate);

        setGamification(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                totalPayments: prev.stats.totalPayments + 1,
                onTimePayments: isOnTime ? prev.stats.onTimePayments + 1 : prev.stats.onTimePayments,
                lastPaymentDate: paymentDate
            },
            streak: isOnTime ? prev.streak + 1 : 0
        }));

        // Award points
        if (isOnTime) {
            awardPoints(75, 'On-time payment');
        } else {
            awardPoints(50, 'Payment made');
        }

        // Check badges and trust score
        setTimeout(() => {
            checkAndUnlockBadges();
            calculateTrustScore();
        }, 500);
    };

    // Update stats when loan is completed
    const updateStatsOnLoanComplete = () => {
        setGamification(prev => ({
            ...prev,
            stats: {
                ...prev.stats,
                completedLoans: prev.stats.completedLoans + 1
            }
        }));

        // Award points
        awardPoints(200, 'Loan completed');

        // Check badges and trust score
        setTimeout(() => {
            checkAndUnlockBadges();
            calculateTrustScore();
        }, 500);
    };

    // === ANALYTICS & ACTIVITY TRACKING FUNCTIONS ===

    // Removed activities localStorage effect
    useEffect(() => {
        // Keeping this empty or removed as we now fetch activities
    }, [activities]);

    // Log Activity
    const logActivity = async (activityType, description, loanId = null, metadata = {}) => {
        if (!user) return; // Can't log if no user

        try {
            const newActivityProto = {
                user_id: user.id,
                loan_id: loanId,
                type: activityType,
                description,
                metadata
            };

            const { data, error } = await supabase
                .from('activities')
                .insert([newActivityProto])
                .select()
                .single();

            if (!error && data) {
                setActivities(prev => [data, ...prev].slice(0, 100));
                return data;
            }
        } catch (err) {
            console.error("Failed to log activity", err);
        }
    };

    // Get Activity Feed (recent activities)
    const getActivityFeed = (limit = 20) => {
        return activities.slice(0, limit);
    };

    // Get Loan Activity Log (activities for specific loan)
    const getLoanActivityLog = (loanId) => {
        return activities.filter(activity => activity.loanId === loanId);
    };

    // Get Dashboard Stats (comprehensive)
    const getDashboardStats = () => {
        const lent = loans.filter(l => l.type === 'lent');
        const borrowed = loans.filter(l => l.type === 'borrowed');
        const active = loans.filter(l => l.status === 'active');
        const overdue = loans.filter(l => l.status === 'overdue');
        const completed = loans.filter(l => l.status === 'completed');

        // Calculate amounts
        const totalLent = lent.reduce((sum, loan) => sum + loan.amount, 0);
        const totalBorrowed = borrowed.reduce((sum, loan) => sum + loan.amount, 0);
        const totalLentPaid = lent.reduce((sum, loan) => sum + loan.amountPaid, 0);
        const totalBorrowedPaid = borrowed.reduce((sum, loan) => sum + loan.amountPaid, 0);

        // Outstanding amounts
        const lentOutstanding = totalLent - totalLentPaid;
        const borrowedOutstanding = totalBorrowed - totalBorrowedPaid;

        // Calculate total payments
        const allPayments = loans.flatMap(loan => loan.payments || []);
        const totalPaymentsAmount = allPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

        return {
            overview: {
                totalLoans: loans.length,
                activeLoans: active.length,
                completedLoans: completed.length,
                overdueLoans: overdue.length,
                totalLent,
                totalBorrowed,
                totalLentPaid,
                totalBorrowedPaid,
                lentOutstanding,
                borrowedOutstanding,
                netPosition: lentOutstanding - borrowedOutstanding
            },
            lending: {
                totalAmount: totalLent,
                totalPaid: totalLentPaid,
                outstanding: lentOutstanding,
                activeCount: lent.filter(l => l.status === 'active').length,
                overdueCount: lent.filter(l => l.status === 'overdue').length
            },
            borrowing: {
                totalAmount: totalBorrowed,
                totalPaid: totalBorrowedPaid,
                outstanding: borrowedOutstanding,
                activeCount: borrowed.filter(l => l.status === 'active').length,
                overdueCount: borrowed.filter(l => l.status === 'overdue').length
            },
            payments: {
                totalCount: allPayments.length,
                totalAmount: totalPaymentsAmount,
                averageAmount: allPayments.length > 0 ? totalPaymentsAmount / allPayments.length : 0
            },
            recentActivity: activities.slice(0, 5)
        };
    };

    // Get Total Amount Owed (what user owes to others)
    const getTotalAmountOwed = () => {
        const borrowed = loans.filter(l => l.type === 'borrowed' && l.status !== 'completed');
        const totalOwed = borrowed.reduce((sum, loan) => {
            const outstanding = loan.amount - loan.amountPaid;
            // Add interest if applicable
            const interest = loan.interestRate ? (loan.amount * loan.interestRate) / 100 : 0;
            return sum + outstanding + interest;
        }, 0);

        return {
            totalOwed,
            loanCount: borrowed.length,
            loans: borrowed.map(loan => ({
                id: loan.id,
                lenderName: loan.lenderName,
                amount: loan.amount,
                amountPaid: loan.amountPaid,
                outstanding: loan.amount - loan.amountPaid,
                dueDate: loan.dueDate,
                status: loan.status
            }))
        };
    };

    // Get Pending Loans (active loans)
    const getPendingLoans = () => {
        const pending = loans.filter(l => l.status === 'active');
        return pending.map(loan => ({
            ...loan,
            outstanding: loan.amount - loan.amountPaid,
            daysUntilDue: Math.ceil((new Date(loan.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
        }));
    };

    // Get Overdue Loans (with details)
    const getOverdueLoans = () => {
        const overdue = loans.filter(l => l.status === 'overdue');
        return overdue.map(loan => {
            const daysOverdue = Math.ceil((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
            const outstanding = loan.amount - loan.amountPaid;
            const lateFee = outstanding * 0.05; // 5% late fee

            return {
                ...loan,
                outstanding,
                daysOverdue,
                lateFee,
                totalDue: outstanding + lateFee
            };
        });
    };

    const value = {
        loans,
        user,
        loading,
        isAuthenticated,
        gamification,
        activities,
        createLoan,
        getLoansByUser,
        getLoanDetails,
        updateLoan,
        deleteLoan,
        login,
        signup,
        logout,
        getStats,
        addRepayment,
        getRepaymentsByLoan,
        calculateOutstandingAmount,
        updateLoanStatus,
        updateStatsOnLoanCreate,
        updateStatsOnPayment,
        updateStatsOnLoanComplete,
        // Analytics functions
        getDashboardStats,
        getTotalAmountOwed,
        getPendingLoans,
        getOverdueLoans,
        // Activity functions
        logActivity,
        getActivityFeed,
        getLoanActivityLog
    };

    return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};

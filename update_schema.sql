-- Add gamification column to profiles table
alter table profiles 
add column if not exists gamification jsonb default '{
    "points": 0, 
    "level": 1, 
    "badges": [], 
    "streak": 0, 
    "trustScore": 50, 
    "stats": {
        "totalLoans": 0, 
        "completedLoans": 0, 
        "totalPayments": 0, 
        "onTimePayments": 0, 
        "lastPaymentDate": null
    }
}'::jsonb;

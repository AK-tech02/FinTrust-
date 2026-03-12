# FinTrust — Setup Guide

## Step 1: Firebase Setup (10 mins)
1. Go to https://console.firebase.google.com
2. Click "Add Project" → name it "fintrust" → Create
3. Go to "Authentication" → Get Started → Enable "Email/Password"
4. Go to "Firestore Database" → Create Database → Start in test mode
5. Go to Project Settings (gear icon) → Scroll to "Your apps" → Click Web (</>)
6. Register app → Copy the firebaseConfig object
7. Paste it into: `src/firebase/config.js` (replace the placeholder values)

## Step 2: Run the App
```bash
npm install
npm start
```
App opens at http://localhost:3000

## Step 3: Deploy for Free (Netlify)
```bash
npm run build
```
Then drag the `build/` folder to https://netlify.com/drop

## How Trust Score Works
- Every user starts at 500
- Loan repaid ON TIME → +10 points
- Loan repaid LATE → -25 points
- Score shown in color: Green (600+) / Yellow (400-599) / Red (<400)

## Firestore Collections
- `users` — uid, name, email, trustScore, totalLent, totalBorrowed
- `loans` — amount, lenderId, borrowerId, deadline, status, repaymentType, interest, note

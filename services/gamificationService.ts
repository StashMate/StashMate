import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { addNotification } from './notificationService';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; 
    type: 'savings_completion' | 'streak' | 'challenge' | 'milestone';
    criteria: any; 
}

export interface AwardedBadge extends Badge {
    awardedAt: any; 
    userId: string;
}

export interface Challenge {
    id: string;
    userId: string;
    name: string;
    description: string;
    type: 'savings_goal' | 'spending_limit';
    targetValue: number;
    currentValue: number;
    durationDays: number; 
    startDate: any; 
    endDate: any; 
    isCompleted: boolean;
    category?: string; 
    isActive: boolean; // New property
}

export interface SavingsGoal {
    type: 'savings_goal';
    targetValue: number;
    currentValue: number;
    startDate: any; 
    endDate: any; 
    category?: string; 
    isCompleted: boolean;
    userId: string;
}

export interface PredefinedChallenge {
    id: string;
    name: string;
    description: string;
    type: 'savings_goal' | 'spending_limit';
    targetValue: number;
    durationDays: number; 
    category?: string; 
}

export const predefinedBadges: Badge[] = [
    { id: 'savings_master', name: 'Savings Master', description: 'Completed 5 savings vaults.', icon: 'star', type: 'savings_completion', criteria: { completedVaults: 5 } },
    { id: 'streak_7', name: '7-Day Saver', description: 'Achieved a 7-day savings streak.', icon: 'flame', type: 'streak', criteria: { streakDays: 7 } },
    { id: 'streak_30', name: '30-Day Saver', description: 'Achieved a 30-day savings streak.', icon: 'flame', type: 'streak', criteria: { streakDays: 30 } },
    { id: 'first_transaction', name: 'First Transaction', description: 'Recorded your first transaction.', icon: 'receipt', type: 'milestone', criteria: { transactions: 1 } },
    { id: 'first_vault', name: 'First Vault', description: 'Created your first savings vault.', icon: 'safe', type: 'milestone', criteria: { vaults: 1 } },
    { id: 'no_eating_out', name: 'No Eating Out', description: 'Completed a no eating out challenge.', icon: 'fast-food-outline', type: 'challenge', criteria: { challengeId: 'no_eating_out_challenge' } },
    { id: 'savings_goal_achiever', name: 'Savings Goal Achiever', description: 'Successfully completed a savings goal challenge.', icon: 'piggy-bank', type: 'challenge', criteria: { challengeId: 'savings_goal_challenge' } },
    { id: 'financial_literacy', name: 'Financial Literacy', description: 'Read 5 financial tips.', icon: 'book', type: 'milestone', criteria: { tipsRead: 5 } },
    { id: 'investment_explorer', name: 'Investment Explorer', description: 'Made your first investment.', icon: 'trending-up', type: 'milestone', criteria: { investments: 1 } },
    { id: 'transaction_master', name: 'Transaction Master', description: 'Recorded 50 transactions.', icon: 'list-outline', type: 'milestone', criteria: { transactions: 50 } },
    { id: 'debt_destroyer', name: 'Debt Destroyer', description: 'Paid off a significant debt.', icon: 'trending-down', type: 'milestone', criteria: { debtPaid: 1 } },
    { id: 'emergency_funder', name: 'Emergency Funder', description: 'Created an emergency fund.', icon: 'medkit-outline', type: 'milestone', criteria: { emergencyFund: true } },
    { id: 'net_worth_builder', name: 'Net Worth Builder', description: 'Increased net worth by 10%.', icon: 'stats-chart-outline', type: 'milestone', criteria: { netWorthIncrease: 0.10 } },
    { id: 'financial_freedom', name: 'Financial Freedom', description: 'Achieved financial independence.', icon: 'wallet-outline', type: 'milestone', criteria: { financialFreedom: true } },
];

export const predefinedChallenges: PredefinedChallenge[] = [
    { id: 'save_100_in_30_days', name: 'Save $100 in 30 Days', description: 'A classic challenge to kickstart your savings habit.', type: 'savings_goal', targetValue: 100, durationDays: 30 },
    { id: 'no_spend_weekend', name: 'No-Spend Weekend', description: 'Can you go a full weekend without any non-essential spending?', type: 'spending_limit', targetValue: 0, durationDays: 3, category: 'Non-Essential' },
    { id: 'emergency_fund_boost', name: 'Emergency Fund Boost', description: 'Add $250 to your emergency fund this month.', type: 'savings_goal', targetValue: 250, durationDays: 30, category: 'Emergency Fund' },
    { id: 'cut_subscriptions', name: 'Subscription Purge', description: 'Review and cut down on monthly subscriptions to save at least $20.', type: 'spending_limit', targetValue: 20, durationDays: 30, category: 'Subscriptions' },
    { id: 'coffee_break_challenge', name: 'Coffee Break Challenge', description: 'Skip the coffee shop for two weeks and save the money instead.', type: 'savings_goal', targetValue: 50, durationDays: 14, category: 'Coffee' },
];

export const fetchAwardedBadges = async (userId: string): Promise<AwardedBadge[]> => {
    try {
        const q = query(collection(db, 'awardedBadges'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AwardedBadge));
    } catch (error) {
        console.error('Error fetching awarded badges:', error);
        return [];
    }
};

export const awardBadge = async (userId: string, badge: Badge) => {
    try {
        const awardedBadgesRef = collection(db, 'awardedBadges');
        const q = query(awardedBadgesRef, where('userId', '==', userId), where('id', '==', badge.id));
        const existingBadges = await getDocs(q);

        if (existingBadges.empty) {
            await addDoc(awardedBadgesRef, {
                ...badge,
                userId,
                awardedAt: serverTimestamp(),
            });
            console.log(`Badge '${badge.name}' awarded to user ${userId}`);

            await addNotification({
                userId,
                type: 'gamification_badge_unlocked',
                title: 'Badge Unlocked!',
                message: `Congratulations! You've earned the ${badge.name} badge.`,
            });
        }
    } catch (error) {
        console.error('Error awarding badge:', error);
    }
};

export const checkAndAwardBadges = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', userId));
    const accountsSnapshot = await getDocs(accountsQuery);
    
    let completedVaults = 0;
    let totalVaults = 0;
    let emergencyFundExists = false;

    for (const accountDoc of accountsSnapshot.docs) {
        const vaultsQuery = query(collection(db, 'accounts', accountDoc.id, 'vaults'));
        const vaultsSnapshot = await getDocs(vaultsQuery);
        totalVaults += vaultsSnapshot.size;
        vaultsSnapshot.forEach(doc => {
            if (doc.data().currentAmount >= doc.data().targetAmount) {
                completedVaults++;
            }
            if (doc.data().name.toLowerCase() === 'emergency fund') {
                emergencyFundExists = true;
            }
        });
    }

    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactionCount = transactionsSnapshot.size;

    for (const badge of predefinedBadges) {
        switch (badge.id) {
            case 'savings_master':
                if (completedVaults >= badge.criteria.completedVaults) {
                    await awardBadge(userId, badge);
                }
                break;
            case 'first_transaction':
                if (transactionCount >= badge.criteria.transactions) {
                    await awardBadge(userId, badge);
                }
                break;
            case 'first_vault':
                if (totalVaults >= badge.criteria.vaults) {
                    await awardBadge(userId, badge);
                }
                break;
            case 'emergency_funder':
                if (emergencyFundExists) {
                    await awardBadge(userId, badge);
                }
                break;
            case 'streak_7':
            case 'streak_30':
                if (userData && userData.streak >= badge.criteria.streakDays) {
                    await awardBadge(userId, badge);
                }
                break;
        }
    }
};

export const fetchActiveChallenges = async (userId: string): Promise<Challenge[]> => {
    try {
        const q = query(collection(db, 'userChallenges'), where('userId', '==', userId), where('isCompleted', '==', false));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Challenge));
    } catch (error) {
        console.error('Error fetching active challenges:', error);
        return [];
    }
};

export const addChallenge = async (challengeData: Omit<Challenge, 'id' | 'isCompleted' | 'currentValue'>): Promise<string | null> => {
    try {
        const docRef = await addDoc(collection(db, 'userChallenges'), {
            ...challengeData,
            currentValue: 0,
            isCompleted: false,
            startDate: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding challenge:', error);
        return null;
    }
};

export const updateChallengeProgress = async (challengeId: string, newCurrentValue: number) => {
    try {
        const challengeDocRef = doc(db, 'userChallenges', challengeId);
        const challengeDoc = await getDoc(challengeDocRef);

        if (challengeDoc.exists()) {
            const challengeData = challengeDoc.data() as Challenge;
            let updatedIsCompleted = challengeData.isCompleted;

            if (challengeData.type === 'savings_goal') {
                const finalValue = Math.min(newCurrentValue, challengeData.targetValue);
                if (finalValue >= challengeData.targetValue) {
                    updatedIsCompleted = true; 
                }
                await updateDoc(challengeDocRef, { currentValue: finalValue, isCompleted: updatedIsCompleted });
            }
            console.log(`Challenge ${challengeId} progress updated.`);
        }
    } catch (error) {
        console.error('Error updating challenge progress:', error);
    }
};

export const checkAndCompleteChallenges = async (userId: string) => {
    const activeChallenges = await fetchActiveChallenges(userId);
    const now = new Date();

    for (const challenge of activeChallenges) {
        if (challenge.endDate.toDate() < now) {
            if (!challenge.isCompleted) {
                await updateDoc(doc(db, 'userChallenges', challenge.id), { isCompleted: true, status: 'failed' });
                console.log(`Challenge ${challenge.id} failed due to expiry.`);
            }
            continue;
        }

        if (challenge.type === 'savings_goal') {
            const savingsQuery = query(
                collection(db, 'transactions'), 
                where('userId', '==', userId),
                where('type', '==', 'savings'), 
                where('date', '>=', challenge.startDate),
                where('date', '<=', challenge.endDate)
            );
            const querySnapshot = await getDocs(savingsQuery);
            const savedAmount = querySnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);

            await updateChallengeProgress(challenge.id, savedAmount);

            if (savedAmount >= challenge.targetValue) {
                await updateDoc(doc(db, 'userChallenges', challenge.id), { isCompleted: true, status: 'succeeded' });
                console.log(`Challenge ${challenge.id} succeeded!`);
            }
        }
    }
};
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { addNotification } from './notificationService';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // e.g., 'trophy-outline', 'wallet-outline'
    type: 'savings_completion' | 'streak' | 'challenge' | 'milestone';
    criteria: any; // Specific criteria for the badge
}

export interface AwardedBadge extends Badge {
    awardedAt: any; // Timestamp
    userId: string;
}
export interface SavingsGoal {
    type: 'savings_goal';
    targetValue: number;
    currentValue: number;
    startDate: any; // Timestamp
    endDate: any; // Timestamp
    category?: string; // For spending_limit challenges
    isCompleted: boolean;
    userId: string;
}

export interface PredefinedChallenge {
    id: string;
    name: string;
    description: string;
    type: 'savings_goal';
    targetValue: number;
    durationDays: number; // Duration in days for the challenge
    category?: string; // For spending_limit challenges
}

// Predefined Badges (can be stored in Firestore or a static file)
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
    
    { id: 'save_50_in_7_days', name: 'Save $50 in 7 Days', description: 'Save $50 within a week.', type: 'savings_goal', targetValue: 50, durationDays: 7 },
    
    { id: 'emergency_fund_kickstart', name: 'Emergency Fund Kickstart', description: 'Save $200 towards your emergency fund.', type: 'savings_goal', targetValue: 200, durationDays: 30 },
    
];

/**
 * Fetches all awarded badges for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of AwardedBadge objects.
 */
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

/**
 * Awards a badge to a user if they meet the criteria and haven't already received it.
 * @param userId The ID of the user.
 * @param badge The badge to potentially award.
 */
export const awardBadge = async (userId: string, badge: Badge) => {
    try {
        const q = query(collection(db, 'awardedBadges'), where('userId', '==', userId), where('id', '==', badge.id));
        const existingBadges = await getDocs(q);

        if (existingBadges.empty) {
            await addDoc(collection(db, 'awardedBadges'), {
                ...badge,
                userId,
                awardedAt: serverTimestamp(),
            });
            console.log(`Badge '${badge.name}' awarded to user ${userId}`);

            // Send a notification
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

/**
 * Checks user's progress against predefined badge criteria and awards badges.
 * This function should be called periodically (e.g., on app launch, after significant actions).
 * @param userId The ID of the user.
 */
export const checkAndAwardBadges = async (userId: string) => {
    // Fetch user data, transactions, savings vaults, etc.
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : null;

    // Fetch all accounts for the user
    const accountsQuery = query(collection(db, 'accounts'), where('userId', '==', userId));
    const accountsSnapshot = await getDocs(accountsQuery);
    let completedVaults = 0;
    let totalVaults = 0; // To count total vaults for 'first_vault'

    for (const accountDoc of accountsSnapshot.docs) {
        const vaultsQuery = query(collection(db, 'accounts', accountDoc.id, 'vaults'));
        const vaultsSnapshot = await getDocs(vaultsQuery);
        completedVaults += vaultsSnapshot.docs.filter(doc => doc.data().currentAmount >= doc.data().targetAmount).length;
        totalVaults += vaultsSnapshot.size; // Count total vaults
    }

    // For budget adherence, we need to track consecutive months. This is complex and might require server-side logic.
    // For now, we'll just check current month budget status.

    for (const badge of predefinedBadges) {
        switch (badge.type) {
            case 'savings_completion':
                if (completedVaults >= badge.criteria.completedVaults) {
                    await awardBadge(userId, badge);
                }
                break;
            case 'streak':
                if (userData && userData.streak >= badge.criteria.streakDays) {
                    await awardBadge(userId, badge);
                }
                break;
            
            case 'challenge':
                // Challenges are awarded separately based on their completion status
                break;
            case 'milestone':
                if (badge.id === 'first_transaction' || badge.id === 'transaction_master') {
                    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
                    const transactionsSnapshot = await getDocs(transactionsQuery);
                    if (transactionsSnapshot.size >= badge.criteria.transactions) {
                        await awardBadge(userId, badge);
                    }
                } else if (badge.id === 'first_vault') {
                    if (totalVaults >= badge.criteria.vaults) {
                        await awardBadge(userId, badge);
                    }
                
                }
                // Other milestone badges are placeholders and require specific data tracking
                // if (badge.id === 'financial_literacy') { /* ... */ }
                // if (badge.id === 'investment_explorer') { /* ... */ }
                // if (badge.id === 'debt_destroyer') { /* ... */ }
                // if (badge.id === 'emergency_funder') { /* ... */ }
                // if (badge.id === 'net_worth_builder') { /* ... */ }
                // if (badge.id === 'financial_freedom') { /* ... */ }
                break;
        }
    }
};

/**
 * Fetches all active challenges for a specific user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Challenge objects.
 */
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

/**
 * Adds a new challenge for a user.
 * @param challengeData The data for the new challenge.
 * @returns A promise that resolves to the ID of the new challenge, or null if an error occurred.
 */
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

/**
 * Updates the progress of a specific challenge.
 * @param challengeId The ID of the challenge to update.
 * @param newCurrentValue The new current value for the challenge.
 * @returns A promise indicating success or failure.
 */
export const updateChallengeProgress = async (challengeId: string, newCurrentValue: number) => {
    try {
        const challengeDocRef = doc(db, 'userChallenges', challengeId);
        const challengeDoc = await getDoc(challengeDocRef);

        if (challengeDoc.exists()) {
            const challengeData = challengeDoc.data() as Challenge;
            let updatedIsCompleted = challengeData.isCompleted;

            if (challengeData.type === 'savings_goal') {
                // For savings goal, currentValue should increase towards targetValue
                const finalValue = Math.min(newCurrentValue, challengeData.targetValue);
                if (finalValue >= challengeData.targetValue) {
                    updatedIsCompleted = true; // Savings goal achieved
                }
                await updateDoc(challengeDocRef, { currentValue: finalValue, isCompleted: updatedIsCompleted });
            }
            console.log(`Challenge ${challengeId} progress updated.`);
        }
    } catch (error) {
        console.error('Error updating challenge progress:', error);
    }
};

/**
 * Checks and completes challenges based on user activities.
 * This function should be called after relevant user actions (e.g., adding transaction, making savings deposit).
 * @param userId The ID of the user.
 */
export const checkAndCompleteChallenges = async (userId: string) => {
    const activeChallenges = await fetchActiveChallenges(userId);
    const now = new Date();

    for (const challenge of activeChallenges) {
        // Check if challenge has expired
        if (challenge.endDate.toDate() < now) {
            if (!challenge.isCompleted) {
                // Mark as failed if not completed by end date
                await updateDoc(doc(db, 'userChallenges', challenge.id), { isCompleted: true, status: 'failed' });
                console.log(`Challenge ${challenge.id} failed due to expiry.`);
            }
            continue;
        }

        if (challenge.type === 'savings_goal') {
            // Sum savings deposits for the challenge period
            // This requires a way to track savings deposits, assuming it's part of transactions or a separate collection
            // For simplicity, let's assume a 'savings' transaction type or similar
            const savingsQuery = query(
                collection(db, 'transactions'), // Assuming savings are tracked as transactions
                where('userId', '==', userId),
                where('type', '==', 'savings'), // Or a specific category for savings
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

export const fetchAllBadges = async (): Promise<Badge[]> => {
    return predefinedBadges;
};

export const fetchPredefinedChallenges = async (): Promise<PredefinedChallenge[]> => {
    return predefinedChallenges;
};
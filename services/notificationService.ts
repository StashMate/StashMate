import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { trackBudget } from '../firebase'; // Assuming trackBudget is exported from firebase.ts
import { subDays, isToday, isTomorrow, addDays } from 'date-fns';

export interface Notification {
    id: string;
    userId: string;
    type: 'bill_reminder' | 'budget_alert' | 'streak_warning' | 'info';
    title: string;
    message: string;
    read: boolean;
    createdAt: any; // Timestamp
    // Add any other relevant data for specific notification types
    data?: {
        transactionId?: string;
        categoryId?: string;
        budgetAmount?: number;
        spentAmount?: number;
        streakDays?: number;
        billDueDate?: any; // Timestamp
    };
}

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: { toDate: () => Date };
    isRecurring?: boolean; // Assuming a flag for recurring transactions
    dueDate?: any; // Timestamp for recurring bills
}

interface UserData {
    streak?: number;
    lastLogin?: any; // Timestamp
}

interface Budget {
    category: string;
    budgetAmount: number;
}

/**
 * Generates a list of notifications based on user data, transactions, and budgets.
 * @param userId The ID of the current user.
 * @returns A promise that resolves to an array of Notification objects.
 */
export const generateNotifications = async (userId: string): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const now = new Date();

    // Fetch user's transactions
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions: Transaction[] = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

    // Fetch user's budgets
    const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', userId));
    const budgetsSnapshot = await getDocs(budgetsQuery);
    const userBudgets: Budget[] = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));

    // Fetch user data for streak
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDocs(userDocRef);
    const userData: UserData = userDoc.exists() ? userDoc.data() as UserData : {};

    // 1. Bill Reminders (recurring transactions due in 3 days)
    transactions.forEach(t => {
        if (t.isRecurring && t.dueDate) {
            const dueDate = t.dueDate.toDate();
            const threeDaysFromNow = addDays(now, 3);
            if (dueDate <= threeDaysFromNow && dueDate >= now) { // Due within the next 3 days
                notifications.push({
                    id: `bill-reminder-${t.id}`,
                    userId,
                    type: 'bill_reminder',
                    title: 'Upcoming Bill Reminder',
                    message: `Your recurring bill for '${t.name}' of $${t.amount.toFixed(2)} is due on ${format(dueDate, 'MMM dd, yyyy')}.`,
                    read: false,
                    createdAt: serverTimestamp(),
                    data: { transactionId: t.id, billDueDate: t.dueDate }
                });
            }
        }
    });

    // 2. Budget Alerts (category spending hits 80%/100%)
    for (const budget of userBudgets) {
        const budgetStatus = await trackBudget(userId, budget.category);
        if (budgetStatus.success && budgetStatus.spentAmount !== undefined && budgetStatus.budgetAmount !== undefined) {
            const progress = budgetStatus.progress || 0;
            if (progress >= 1 && budgetStatus.warning) {
                notifications.push({
                    id: `budget-alert-100-${budget.category}`,
                    userId,
                    type: 'budget_alert',
                    title: 'Budget Exceeded!',
                    message: `You have exceeded your budget for '${budget.category}'. You've spent $${budgetStatus.spentAmount.toFixed(2)} out of $${budgetStatus.budgetAmount.toFixed(2)}.`,
                    read: false,
                    createdAt: serverTimestamp(),
                    data: { categoryId: budget.category, budgetAmount: budget.budgetAmount, spentAmount: budgetStatus.spentAmount }
                });
            } else if (progress >= 0.8 && progress < 1 && budgetStatus.warning) {
                notifications.push({
                    id: `budget-alert-80-${budget.category}`,
                    userId,
                    type: 'budget_alert',
                    title: 'Budget Nearing Limit',
                    message: `You've spent ${Math.round(progress * 100)}% of your budget for '${budget.category}'. You've spent $${budgetStatus.spentAmount.toFixed(2)} out of $${budgetStatus.budgetAmount.toFixed(2)}.`,
                    read: false,
                    createdAt: serverTimestamp(),
                    data: { categoryId: budget.category, budgetAmount: budget.budgetAmount, spentAmount: budgetStatus.spentAmount }
                });
            }
        }
    }

    // 3. Streak Warning (no savings activity 1 day before streak resets)
    if (userData.streak !== undefined && userData.lastLogin) {
        const lastLoginDate = userData.lastLogin.toDate();
        const dayBeforeToday = subDays(now, 1);

        // If last login was yesterday and streak is about to reset today (no activity today)
        if (isToday(dayBeforeToday) && !isToday(lastLoginDate)) { // This logic needs refinement based on how streak is actually calculated/reset
            notifications.push({
                id: `streak-warning-${userId}`,
                userId,
                type: 'streak_warning',
                title: 'Streak Warning!',
                message: `Your savings streak of ${userData.streak} days might reset soon! Make a savings activity today to keep it going.`,
                read: false,
                createdAt: serverTimestamp(),
                data: { streakDays: userData.streak }
            });
        }
    }

    // You can add more logic here for other notification types
    // Example: New feature announcement, significant financial events, etc.

    return notifications;
};

/**
 * Marks a specific notification as read in Firestore.
 * @param notificationId The ID of the notification to mark as read.
 * @param userId The ID of the user who owns the notification.
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
    try {
        const notificationDocRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationDocRef, {
            read: true,
            readAt: serverTimestamp(),
        });
        console.log(`Notification ${notificationId} marked as read.`);
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

/**
 * Fetches all notifications for a user from Firestore.
 * @param userId The ID of the user.
 * @returns A promise that resolves to an array of Notification objects.
 */
export const fetchNotifications = async (userId: string): Promise<Notification[]> => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
            // orderBy('createdAt', 'desc') // Order by creation date, newest first
        );
        const querySnapshot = await getDocs(notificationsQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

/**
 * Adds a new notification to Firestore.
 * This function can be used by backend processes or other parts of the app
 * to create notifications that will be displayed to the user.
 * @param notificationData The data for the new notification.
 * @returns A promise that resolves to the ID of the new notification, or null if an error occurred.
 */
export const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string | null> => {
    try {
        const notificationsCollectionRef = collection(db, 'notifications');
        const docRef = await addDoc(notificationsCollectionRef, {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding notification:', error);
        return null;
    }
};

import { addDays, format, isToday, subDays } from 'date-fns';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';


export interface Notification {
    id: string;
    userId: string;
    type: 'bill_reminder' | 'streak_warning' | 'info' | 'gamification_level_up' | 'gamification_badge_unlocked' | 'gamification_challenge_completed' | 'welcome_back';
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
        badgeName?: string;
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
    lastWelcomeNotificationSent?: any; // Timestamp of last welcome notification
    badges?: string[]; // Assuming user data includes a list of acquired badges
}


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

/**
 * Generates a welcome back notification if not already sent today.
 * @param userId The ID of the current user.
 */
const generateWelcomeBackNotification = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData: UserData = userDoc.exists() ? userDoc.data() as UserData : {};

    const now = new Date();
    const lastSent = userData.lastWelcomeNotificationSent?.toDate();

    if (!lastSent || !isToday(lastSent)) {
        await addNotification({
            userId,
            type: 'welcome_back',
            title: 'Welcome Back!',
            message: 'We missed you! Check out what"s new.',
            read: false,
        });
        await updateDoc(userDocRef, {
            lastWelcomeNotificationSent: serverTimestamp(),
        });
    }
};

/**
 * Generates a badge unlocked notification.
 * @param userId The ID of the current user.
 * @param badgeName The name of the badge unlocked.
 */
export const generateBadgeUnlockedNotification = async (userId: string, badgeName: string) => {
    await addNotification({
        userId,
        type: 'gamification_badge_unlocked',
        title: 'Badge Unlocked!',
        message: `Congratulations! You've unlocked the ${badgeName} badge.`,
        read: false,
        data: { badgeName },
    });
};

/**
 * Generates a list of notifications based on user data, transactions, and budgets.
 * @param userId The ID of the current user.
 * @returns A promise that resolves to an array of Notification objects.
 */
export const generateNotifications = async (userId: string): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const now = new Date();

    // Generate welcome back notification (once per day)
    await generateWelcomeBackNotification(userId);

    // Fetch user's transactions
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    const transactions: Transaction[] = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));

    

    // Fetch user data for streak and badges
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
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
                    message: `Your recurring bill for '${t.name}' of ${t.amount.toFixed(2)} is due on ${format(dueDate, 'MMM dd, yyyy')}.`,
                    read: false,
                    createdAt: serverTimestamp(),
                    data: { transactionId: t.id, billDueDate: t.dueDate }
                });
            }
        }
    });

    

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

    // Placeholder for new badge notifications
    // This would typically involve comparing current badges with previously known badges
    // For demonstration, let's assume a new badge is acquired if `userData.badges` is updated
    // In a real scenario, this would be triggered by the gamification service.
    // Example: if (newlyAcquiredBadge) { await generateBadgeUnlockedNotification(userId, newlyAcquiredBadge.name); }

    // Save all generated notifications to Firestore
    for (const notification of notifications) {
        // We need to omit 'id' and 'createdAt' as addNotification generates them
        const { id, createdAt, ...notificationToSave } = notification;
        await addNotification(notificationToSave);
    }

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
export const fetchNotifications = async (userId: string, onlyUnread: boolean = false): Promise<Notification[]> => {
    try {
        let notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId)
            // orderBy('createdAt', 'desc') // Order by creation date, newest first
        );

        if (onlyUnread) {
            notificationsQuery = query(notificationsQuery, where('read', '==', false));
        }

        const querySnapshot = await getDocs(notificationsQuery);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

/**
 * Fetches the count of unread notifications for a user.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the number of unread notifications.
 */
export const fetchUnreadNotificationsCount = async (userId: string): Promise<number> => {
    try {
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            where('read', '==', false)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        return 0;
    }
};

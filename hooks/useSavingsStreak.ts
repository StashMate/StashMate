import { collectionGroup, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';

export const useSavingsStreak = () => {
    const { user } = useUser();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!user) return;

        const depositsQuery = query(
            collectionGroup(db, 'deposits'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(depositsQuery, (snapshot) => {
            const deposits = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    ...data,
                    date: data.date.toDate(), // Convert Firestore Timestamp to Date
                };
            });

            // Sort deposits by date in descending order
            deposits.sort((a, b) => b.date.getTime() - a.date.getTime());

            if (deposits.length === 0) {
                setStreak(0);
                return;
            }

            let currentStreak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Check if the most recent deposit was today or yesterday
            const mostRecentDepositDate = new Date(deposits[0].date);
            mostRecentDepositDate.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - mostRecentDepositDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays <= 1) {
                currentStreak = 1;
                let lastDate = mostRecentDepositDate;

                for (let i = 1; i < deposits.length; i++) {
                    const currentDate = new Date(deposits[i].date);
                    currentDate.setHours(0, 0, 0, 0);

                    const dateDiff = (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

                    if (dateDiff === 1) {
                        currentStreak++;
                    } else if (dateDiff > 1) {
                        break; // Streak is broken
                    }
                    // If dateDiff is 0, it's a deposit on the same day, so we continue

                    lastDate = currentDate;
                }
            }

            setStreak(currentStreak);
        });

        return () => unsubscribe();
    }, [user]);

    return streak;
};
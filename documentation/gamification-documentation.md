# Gamification System Documentation

This document details the gamification features implemented in the StashMate application, including badges, challenges, and how they interact with user activities and data.

## Overview

The gamification system aims to motivate users to achieve their financial goals by rewarding them with badges for milestones and engaging them with time-bound challenges. This system encourages consistent positive financial behavior.

## Badges

Badges are digital awards given to users for completing specific financial achievements. They are designed to recognize and reinforce good habits.

### Badge Types and Criteria

Badges are defined by the `Badge` interface and stored in `predefinedBadges` within `services/gamificationService.ts`. Each badge has a `type` and `criteria` that determine when it should be awarded.

*   **`savings_completion`**: Awarded for completing a certain number of savings vaults.
    *   **Criteria Example:** `completedVaults: 5` (Awarded when 5 savings vaults are completed).
*   **`budget_adherence`**: Awarded for maintaining spending under budget for a consecutive period.
    *   **Criteria Example:** `consecutiveMonths: 3` (Awarded for 3 consecutive months of budget adherence).
    *   **Note:** The current implementation for `budget_adherence` is a placeholder. Tracking consecutive months of budget adherence accurately typically requires more complex server-side logic to aggregate monthly budget performance and check for consecutive success.
*   **`streak`**: Awarded for maintaining a daily savings streak for a specified number of days.
    *   **Criteria Examples:** `streakDays: 7`, `streakDays: 30`.
*   **`challenge`**: Awarded upon successful completion of specific time-bound challenges.

### Awarding Badges

The `checkAndAwardBadges(userId: string)` function in `services/gamificationService.ts` is responsible for evaluating user progress against predefined badge criteria. This function should be called after significant user actions that might contribute to badge criteria (e.g., adding a transaction, making a savings deposit, or on app launch).

*   It fetches the user's data (including streak), and iterates through all accounts to count completed savings vaults.
*   For each `predefinedBadge`, it checks if the user meets the `criteria`.
*   If the criteria are met and the user has not already been awarded that badge, the `awardBadge` function is called to record the badge in the `awardedBadges` Firestore collection.

## Challenges

Challenges are time-bound, specific financial goals that users can participate in. They provide a focused way to improve financial habits.

### Challenge Types

Challenges are defined by the `Challenge` interface in `services/gamificationService.ts`.

*   **`spending_limit`**: Aims to keep spending under a certain amount within a specified category and timeframe.
    *   **Example:** "No eating out this week" (track "Restaurant" category, target spending $0).
*   **`savings_goal`**: Aims to save a specific amount within a given timeframe.
    *   **Example:** "Save $50 in 5 days."

### Managing Challenges

*   **`addChallenge(challengeData)`**: Allows adding new challenges for a user. The `startDate` is set to `serverTimestamp()` upon creation.
*   **`fetchActiveChallenges(userId)`**: Retrieves all challenges for a user that are not yet completed.
*   **`updateChallengeProgress(challengeId, newCurrentValue)`**: Updates the `currentValue` of a challenge. For `spending_limit` challenges, `currentValue` should not exceed `targetValue`. For `savings_goal` challenges, `currentValue` increases towards `targetValue`.
*   **`checkAndCompleteChallenges(userId)`**: This function should be called after relevant user activities (e.g., adding a transaction, making a savings deposit). It:
    *   Fetches all active challenges for the user.
    *   Checks if challenges have expired and marks them as 'failed' if not completed.
    *   For `spending_limit` challenges, it sums expenses within the challenge period and category, updates `currentValue`, and marks as 'succeeded' if spending is within the limit by the `endDate`.
    *   For `savings_goal` challenges, it sums relevant savings transactions, updates `currentValue`, and marks as 'succeeded' if the target is met.

## Integration Points

### `firebase.ts`

*   **`addTransaction`**: After a new transaction is added, `checkAndAwardBadges` and `checkAndCompleteChallenges` are called to update user progress and potentially award badges or complete challenges.
*   **`updateTransaction`**: Similarly, after a transaction is updated, `checkAndAwardBadges` and `checkAndCompleteChallenges` are triggered.
*   **`signInWithEmail` / `signInWithGoogle`**: These functions now store the user's `timezoneOffset` in their Firestore user document. This offset is crucial for accurately calculating streak resets based on the user's local midnight.

### `app/rewards.tsx`

*   This screen displays the `AwardedBadges` and `ActiveChallenges` fetched using `fetchAwardedBadges` and `fetchActiveChallenges` from `services/gamificationService.ts`.
*   It provides a visual representation of the user's achievements and ongoing goals.

## Edge Cases and Considerations

1.  **Time Zones (Streaks)**:
    *   **Problem:** Streaks should reset at midnight in the user's local time, not UTC or server time.
    *   **Solution:** When a user signs up or logs in, their `timezoneOffset` (the difference in minutes between UTC and local time) is stored in their Firestore user document. The streak calculation logic in `firebase.ts` (within `signInWithEmail` and `signInWithGoogle`) now uses this `timezoneOffset` to determine the start of the day in the user's local time, ensuring accurate streak resets.

2.  **Refunds (Negative Expenses)**:
    *   **Problem:** Refunds should deduct from expenses, effectively being treated as negative expenses.
    *   **Solution:** The `updateTransaction` function in `firebase.ts` now explicitly handles cases where an expense transaction's `amount` is updated to a negative value. While no complex logic is added here for now, the system is designed to allow negative expense amounts to directly reduce total expenses in reports and budget tracking. Further refinement might involve a dedicated `type: 'refund'` for clearer data representation.

3.  **Data Conflicts (Editing Transactions Affecting Streaks)**:
    *   **Problem:** If a user edits a past transaction, it could potentially invalidate or alter a previously earned streak.
    *   **Current Approach:** The `checkAndAwardBadges` and `checkAndCompleteChallenges` functions are called after *any* transaction update. This means that if a past transaction is edited, the system will re-evaluate relevant badges and challenges based on the new data. For streaks, the current logic primarily relies on `lastLogin` and the daily login pattern. If a transaction edit affects a day that was previously counted towards a streak (e.g., by removing the only savings activity for that day), the streak might be retroactively broken. This is a complex scenario to handle perfectly client-side without a robust server-side re-evaluation system. For now, the system will re-evaluate based on the updated data, which might lead to a streak being lost if the underlying activity is removed.
    *   **Future Consideration:** For a more robust solution, a server-side process could periodically re-evaluate all streaks and badge criteria, especially for historical data changes, to ensure data consistency and prevent client-side manipulation or inconsistencies.

## Firestore Structure

### `awardedBadges` Collection

Stores documents representing badges awarded to users. Each document contains:

*   `id` (Badge ID, e.g., `savings_master`)
*   `name`
*   `description`
*   `icon`
*   `type`
*   `criteria`
*   `userId`: The ID of the user who received the badge.
*   `awardedAt`: Timestamp of when the badge was awarded.

### `userChallenges` Collection

Stores documents representing active and completed challenges for users. Each document contains:

*   `id` (Challenge ID)
*   `name`
*   `description`
*   `type`
*   `targetValue`
*   `currentValue`
*   `startDate`
*   `endDate`
*   `category` (Optional, for `spending_limit` challenges)
*   `isCompleted`: Boolean indicating if the challenge is completed.
*   `userId`: The ID of the user participating in the challenge.
*   `status` (Optional, e.g., 'succeeded', 'failed')

### `users` Collection

User documents now include:

*   `timezoneOffset`: The user's local timezone offset in minutes from UTC. This is captured during sign-up/login.

## Future Enhancements

*   **Server-Side Gamification Logic:** Implement Cloud Functions or a backend service to run `checkAndAwardBadges` and `checkAndCompleteChallenges` periodically and after relevant database writes (e.g., `onCreate`, `onUpdate` for transactions, savings, etc.). This ensures consistency and reduces client-side load.
*   **User-Defined Challenges:** Allow users to create their own custom challenges.
*   **Badge Display Enhancements:** More visually appealing badge displays, animations, and sharing options.
*   **Leaderboards:** Introduce leaderboards for challenges or overall financial health.
*   **Push Notifications for Achievements:** Send push notifications when a user earns a badge or completes a challenge.
*   **Detailed Challenge Progress:** Provide more granular progress tracking and visual feedback for challenges.

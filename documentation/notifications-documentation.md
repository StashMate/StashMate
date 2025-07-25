# Notification System Documentation

This document outlines the design and implementation of the notification system within the StashMate application.

## Overview

The notification system is designed to provide timely and relevant alerts to users based on their financial activities and predefined conditions. Notifications are generated server-side (or simulated client-side for demonstration) and stored in Firestore, then fetched and displayed in the `NotificationsScreen`.

## Notification Types and Trigger Conditions

The system currently supports the following notification types:

1.  **Bill Reminders**
    *   **Trigger Condition:** Recurring transactions that are due within the next 3 days.
    *   **Logic:** The `generateNotifications` function queries for transactions marked as `isRecurring` and checks their `dueDate`. If a `dueDate` falls within the next 3 days from the current date, a `bill_reminder` notification is generated.

2.  **Budget Alerts**
    *   **Trigger Condition:** A user's spending in a specific category hits 80% or 100% of their allocated budget.
    *   **Logic:** For each budget defined by the user, the `generateNotifications` function calls `trackBudget` (from `firebase.ts`) to get the current spending and budget amount. If the `progress` (spent amount / budget amount) is `>= 0.8` (80%) or `>= 1` (100%), a `budget_alert` notification is generated. Different messages are provided for 80% and 100% thresholds.

3.  **Streak Warning**
    *   **Trigger Condition:** No savings activity 1 day before the user's streak resets.
    *   **Logic:** The `generateNotifications` function checks the user's `streak` and `lastLogin` data. If the `lastLogin` was yesterday and there has been no activity today (implying the streak is about to reset), a `streak_warning` notification is generated.

## Architecture and Flow

### `services/notificationService.ts`

This file contains the core logic for managing notifications:

*   **`Notification` Interface:** Defines the structure of a notification object, including `id`, `userId`, `type`, `title`, `message`, `read` status, `createdAt` timestamp, and an optional `data` object for type-specific information.
*   **`generateNotifications(userId: string): Promise<Notification[]>`:**
    *   This is the primary function responsible for evaluating all trigger conditions.
    *   It fetches the user's transactions, budgets, and user profile data from Firestore.
    *   It iterates through these data points, applies the defined trigger conditions, and constructs `Notification` objects.
    *   **Note:** In a production environment, this function would ideally be run periodically on a backend server (e.g., a Firebase Cloud Function, a cron job) to generate and persist notifications in Firestore. For this client-side implementation, it's called directly by the `NotificationsScreen` for demonstration purposes.
*   **`markNotificationAsRead(notificationId: string, userId: string)`:** Updates the `read` status of a specific notification in Firestore to `true`.
*   **`fetchNotifications(userId: string): Promise<Notification[]>`:** Retrieves all notifications for a given user from the `notifications` collection in Firestore.
*   **`addNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<string | null>`:** A utility function to add a new notification document to the `notifications` collection in Firestore. This can be used by other parts of the application or backend processes to create notifications.

### `app/notifications.tsx`

This screen is responsible for displaying notifications to the user:

*   It uses `useEffect` to call `fetchNotifications` when the component mounts, retrieving all notifications for the logged-in user.
*   It manages loading and error states for fetching data.
*   Notifications are rendered in a `ScrollView`. Each notification item is a `TouchableOpacity`.
*   When a notification is pressed, `handleNotificationPress` is called, which in turn calls `markNotificationAsRead` to update the notification's status in Firestore and locally in the state.
*   Unread notifications are visually distinguished with a dot and different styling.

### `app/(tabs)/dashboard.tsx`

*   The bell icon in the dashboard header navigates the user to the `NotificationsScreen` using `router.push('/notifications')`.

## Firestore Structure

Notifications are stored in a top-level Firestore collection named `notifications`. Each document in this collection represents a single notification and has the following fields (as per the `Notification` interface):

*   `id` (Document ID)
*   `userId`: The ID of the user to whom the notification belongs.
*   `type`: (`bill_reminder`, `budget_alert`, `streak_warning`, `info`)
*   `title`: The main title of the notification.
*   `message`: The detailed message of the notification.
*   `read`: Boolean indicating if the user has read the notification.
*   `createdAt`: Timestamp of when the notification was created.
*   `readAt` (Optional): Timestamp of when the notification was marked as read.
*   `data` (Optional): An object containing additional context relevant to the notification type (e.g., `transactionId`, `categoryId`, `billDueDate`, `streakDays`).

## Future Enhancements

*   **Backend Generation:** Migrate `generateNotifications` to a backend service (e.g., Firebase Cloud Functions, a dedicated cron job) to ensure notifications are generated reliably and efficiently without relying on the client application being open.
*   **Push Notifications:** Integrate with a push notification service (e.g., Firebase Cloud Messaging) to send real-time alerts to users even when the app is closed.
*   **Notification Preferences:** Allow users to customize which types of notifications they receive.
*   **Deep Linking:** Implement deep linking for notifications, so tapping a notification can take the user directly to the relevant screen or feature within the app (e.g., tapping a bill reminder takes them to the transaction details).
*   **Notification Badges:** Display a badge count on the bell icon in the dashboard to indicate the number of unread notifications.
*   **More Notification Types:** Add notifications for goal completion, new features, security alerts, etc.
*   **Pagination/Loading More:** Implement pagination for notifications if the list is expected to grow very large.

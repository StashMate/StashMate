 
# Goals Feature Logic

This document outlines the plan to transition the Goals feature from a static implementation to a dynamic, Firestore-backed system. It includes data model changes, new features, and UI/UX enhancements.

## 1. Core Objectives

-   **Dynamic Data:** Replace static data with real-time data from Firestore.
-   **User-Specific Goals:** Ensure users can only see and manage their own goals.
-   **Automated Progress Tracking:** Implement a system to automatically update goal progress based on user savings.
-   **Smart Notifications:** Alert users when a goal is affordable or a deadline is approaching.
-   **Improved UI/UX:** Enhance the user interface to be more informative and visually appealing.

## 2. Data Model

We will create a new `goals` collection in Firestore with the following schema for each document:

```json
{
  "userId": "string", // Foreign key to the users collection
  "name": "string", // Name of the goal (e.g., "Dream Vacation")
  "targetAmount": "number", // The target amount to save
  "currentAmount": "number", // The amount currently saved towards the goal
  "deadline": "timestamp", // The date the user wants to achieve the goal by
  "imageUrl": "string", // URL for the goal's cover image
  "createdAt": "timestamp" // When the goal was created
}
```

## 3. Feature Implementation

### 3.1. `addGoal.tsx` - Creating a New Goal

1.  **Firebase Storage for Images:**
    -   Instead of storing image URIs directly, upload the selected image to Firebase Storage.
    -   This provides a persistent and reliable way to manage user-uploaded content.
    -   The `imageUrl` in Firestore will point to the location in the Storage bucket.

2.  **Saving to Firestore:**
    -   On save, create a new document in the `goals` collection.
    -   The document will include the `userId`, `name`, `targetAmount`, `deadline`, and the `imageUrl` from Firebase Storage.
    -   `currentAmount` will be initialized to `0`.

### 3.2. `goals.tsx` - Displaying Goals

1.  **Fetching Data:**
    -   Use a real-time listener (`onSnapshot`) to fetch all goals from the `goals` collection where the `userId` matches the currently logged-in user.
    -   Display a loading indicator while the data is being fetched.
    -   Handle empty states gracefully, prompting the user to create a new goal if none exist.

2.  **Displaying Progress:**
    -   The progress bar will now reflect `currentAmount` / `targetAmount`.
    -   The UI will clearly show how much has been saved and how much is remaining.

### 3.3. Affordability and Deadline Notifications

1.  **Affordability Check:**
    -   Fetch the user's total savings from their savings vaults.
    -   For each goal, compare the `targetAmount` with the user's total available savings.
    -   If `totalSavings >= targetAmount`, display a "Ready to Fund!" or similar notification on the goal card.

2.  **Deadline Tracking:**
    -   For each goal, calculate the time remaining until the `deadline`.
    -   If the deadline is approaching (e.g., within 30 days), display a visual indicator (e.g., a clock icon and a "Deadline Approaching!" message).
    -   If the deadline has passed, update the UI to indicate this (e.g., "Deadline Passed").

## 4. UI/UX Enhancements

-   **Goal Card Redesign:**
    -   Add a dedicated section on the goal card for the affordability/deadline notifications.
    -   Improve the visual hierarchy to make the most important information stand out.
-   **Empty State:**
    -   Provide a more engaging empty state with a clear call-to-action to create a new goal.
-   **Confetti/Celebration:**
    -   When a goal is fully funded, trigger a fun animation (like confetti) to celebrate the user's achievement.

## 5. Nice-to-Have Features (Future Enhancements)

-   **Goal Contributions:**
    -   Allow users to contribute a specific amount from their savings directly to a goal.
-   **Automated Savings Plan:**
    -   Help users create an automated savings plan to reach their goals faster (e.g., "Save $50/week towards this goal").
-   **Goal Pausing/Archiving:**
    -   Allow users to pause a goal or archive it once completed.

This plan provides a clear roadmap for transforming the Goals feature into a powerful and engaging tool for users. By leveraging Firestore for real-time data and implementing smart notifications, we can create a much more valuable experience. 
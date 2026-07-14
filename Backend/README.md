# RivODS Backend

> Organization-based employee wellness, step tracking, rewards,
> redemption and challenge management backend built with **Node.js,
> Express.js and MongoDB**.

## Overview

RivODS is a multi-tenant backend where organizations can onboard
employees, track daily activity, reward healthy habits, manage reward
catalogs, and run organization-wide fitness challenges.

Employees sync their daily steps, earn reward coins, participate in
challenges, and redeem rewards. Organization admins manage users,
rewards, challenges, and redemption approvals.

------------------------------------------------------------------------

# Features

## Authentication

-   JWT Authentication
-   Role-based Authorization (Admin / User)
-   Secure password hashing
-   Protected routes

## Organization Management

-   Multi-tenant architecture
-   Organization-specific data isolation
-   Admin-managed resources

## User Management

-   Employee profile management
-   Profile image upload (Cloudinary)
-   Total steps tracking
-   Reward wallet
-   Pagination support

## Step Tracking

-   Daily step synchronization
-   Automatic reward coin calculation
-   Daily step history
-   Total lifetime steps

Reward Formula:

``` text
500 Steps = 1 Reward Coin
```

## Reward Management

-   Create rewards
-   Update rewards
-   Activate / Deactivate rewards
-   CSV reward import
-   Reward catalog

## Redemption System

-   User creates redemption request
-   Shopkeeper/Admin claims redemption
-   Redemption history
-   Reward coin deduction

## Challenges

-   Create organization challenges
-   Join challenge
-   Automatic progress tracking
-   Mid-day join support using `startingSteps`
-   Reward claiming after completion

------------------------------------------------------------------------

# Tech Stack

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   Cloudinary
-   Multer
-   CSV Parser

------------------------------------------------------------------------

# Architecture

``` text
Organization
      │
      ├───────────────┐
      │               │
    Users        Challenges
      │               │
      │         ChallengeProgress
      │               │
      ├───────────────┘
      │
DailyStepLog
      │
      ▼
Reward Coins
      │
Reward Catalog
      │
Redemption
```

------------------------------------------------------------------------

# Project Structure

``` text
src/
│
├── controllers/
├── lib/
│   └── challenges/
│       ├── getChallenge.js
│       ├── getChallengeProgress.js
│       ├── calculateChallengeProgress.js
│       ├── joinChallenge.js
│       └── updateChallengeProgress.js
│
├── middlewares/
├── models/
├── routes/
└── index.js
```

------------------------------------------------------------------------

# Challenge Flow

``` text
GET /challenges/active
        │
        ▼
Join Challenge
        │
POST /challenges/:challengeId/join
        │
        ▼
GET /challenges/:challengeId
        │
        ▼
POST /steps/sync
        │
        ▼
Backend Updates Challenge Progress
        │
        ▼
GET /challenges/:challengeId
        │
        ▼
POST /challenges/:challengeId/claim
```

------------------------------------------------------------------------

# Challenge Progress

Users **must join** a challenge before progress starts.

ChallengeProgress stores:

-   challengeId
-   userId
-   organizationId
-   joinedAt
-   startingSteps
-   currentValue
-   isCompleted
-   completedAt
-   rewardGranted

When a user joins in the middle of the day:

``` text
Today's Progress =
Today's Steps
-
startingSteps
```

Future days count completely.

------------------------------------------------------------------------

# APIs

## Authentication

-   POST `/api/auth/signup`
-   POST `/api/auth/login`

## Users

-   GET `/api/users/details`
-   PATCH `/api/users/profile`
-   POST `/api/users/profile-image`

## Steps

-   POST `/api/steps/sync`
-   GET `/api/steps/today`
-   GET `/api/steps/history`

## Rewards

-   GET `/api/rewards`
-   POST `/api/rewards`
-   PATCH `/api/rewards/:rewardId`
-   PATCH `/api/rewards/:rewardId/activate`
-   PATCH `/api/rewards/:rewardId/deactivate`
-   DELETE `/api/rewards/:rewardId`
-   POST `/api/rewards/upload-csv`

## Redemptions

-   POST `/api/redemptions`
-   PATCH `/api/redemptions/:redemptionId/claim`
-   GET `/api/redemptions/my`
-   GET `/api/redemptions`

## Challenges

### Admin

-   POST `/api/challenges`
-   PATCH `/api/challenges/:challengeId`
-   DELETE `/api/challenges/:challengeId`

### User

-   GET `/api/challenges/active`
-   POST `/api/challenges/:challengeId/join`
-   GET `/api/challenges/:challengeId`
-   POST `/api/challenges/:challengeId/claim`

------------------------------------------------------------------------

# Database Models

-   Organization
-   User
-   DailyStepLog
-   RewardCatalog
-   Redemption
-   Challenge
-   ChallengeProgress

------------------------------------------------------------------------

# Performance

-   MongoDB compound indexes
-   Pagination
-   Multi-tenant isolation
-   Helper-based business logic
-   Automatic challenge progress updates
-   CSV bulk reward upload

------------------------------------------------------------------------

# Environment Variables

``` env
PORT=

MONGO_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REWARD_STEPS=500
```

------------------------------------------------------------------------

# Future Improvements

-   Google Fit Integration
-   Apple Health Integration
-   Push Notifications
-   Leaderboards
-   Analytics Dashboard
-   Reward Categories
-   Search & Filters
-   Background Jobs

------------------------------------------------------------------------

# Author

**Joydeep Hans**

B.Sc. (Hons.) Computer Science

Backend Developer \| Node.js \| Express.js \| MongoDB \| JWT \|
Cloudinary

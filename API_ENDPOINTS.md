# Two-Way Betting Backend - API Endpoints Documentation

## Overview
This document lists all API endpoints available in the Two-Way Betting Backend system. The server includes support for authentication, user management, betting, chat with bet offers, badges, and more.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## API Endpoints by Module

### 1. Authentication Routes (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/firebase` | Firebase/Google sign-in | No |
| POST | `/auth/refresh-token` | Refresh JWT token | No |
| POST | `/auth/logout` | Logout user | Yes |

---

### 2. User Routes (`/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get current user profile | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| GET | `/users/security` | Get security info | Yes |
| GET | `/users/profile/:userId` | Get another user's profile | Yes |

---

### 3. Preferences Routes (`/preferences`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/preferences/sports` | Get available sports | No |
| GET | `/preferences/leagues` | Get available leagues | No |
| GET | `/preferences/my-preferences` | Get user's preferences | Yes |
| PUT | `/preferences/my-preferences` | Update user preferences | Yes |

---

### 4. Wallet Routes (`/wallet`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wallet/balance` | Get wallet balance | Yes |
| POST | `/wallet/deposit` | Initiate deposit | Yes |
| POST | `/wallet/withdraw` | Withdraw funds | Yes |
| GET | `/wallet/transactions` | Get transaction history | Yes |

---

### 5. Payment Routes (`/payments`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/deposit` | Initiate payment deposit | Yes |

---

### 6. Bet Routes (`/bets`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bets` | Create new bet | Yes |
| GET | `/bets` | Get user's bets | Yes |
| GET | `/bets/:id` | Get specific bet by ID | Yes |
| GET | `/bets/match/:matchId` | Get bets for a match | Yes |
| POST | `/bets/:betId/accept` | Accept/request to accept a bet | Yes |
| GET | `/bets/:betId/accept-requests` | Get pending accept requests | Yes |
| POST | `/bets/:betId/choose-opponent` | Choose opponent from requests | Yes |
| POST | `/bets/:betId/early-settlement/request` | Request early settlement | Yes |
| POST | `/bets/:betId/early-settlement/respond` | Respond to settlement request | Yes |

---

### 7. Match Routes (`/matches`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/matches/upcoming` | Get upcoming matches | No |
| GET | `/matches/live` | Get live matches | No |
| GET | `/matches/:id` | Get match by ID | No |
| GET | `/matches/:id/overview` | Get match overview with chat & stakes | No |
| GET | `/matches/:id/odds-suggestion` | Get suggested odds for a match and prediction | No |
| GET | `/matches/:id/participants` | Get match participants/bets | Yes |
| POST | `/matches/refresh` | Refresh match data (admin) | Yes (Admin) |

---

### 8. Chat Routes (`/chat`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/chat/match/:matchId` | Post message to match chat | Yes |
| GET | `/chat/match/:matchId` | Get match chat messages | Yes |

**Chat Message Payload:**
```json
{
  "message": "optional text",
  "betOffer": {
    "betId": "optional - reference existing bet",
    "marketType": "match_winner",
    "creatorPrediction": "home",
    "odds": 2.5,
    "creatorStake": 20,
    "outcome": "Liverpool wins"
  }
}
```

---

### 9. Message Routes (`/messages`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages` | Send private message | Yes |
| GET | `/messages/conversations` | Get all conversations | Yes |
| GET | `/messages/conversation/:userId` | Get conversation with user | Yes |

---

### 10. Badge Routes (`/badges`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/badges` | Get all available badges | Yes |
| POST | `/badges` | Create new badge (admin) | Yes (Admin) |
| GET | `/badges/user/:userId` | Get user's earned badges | Yes |
| POST | `/badges/check-award` | Check for new badge eligibility | Yes |

---

### 11. Marketplace Routes (`/marketplace`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/marketplace/match/:matchId` | Get open bets for match | Yes |

---

### 12. KYC Routes (`/kyc`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/kyc/submit` | Submit KYC documents | Yes |
| GET | `/kyc/status` | Get KYC status | Yes |
| GET | `/kyc/all` | Get all KYC submissions (admin) | Yes (Admin) |
| PUT | `/kyc/verify/:kycId` | Verify KYC (admin) | Yes (Admin) |

---

### 13. Leaderboard Routes (`/leaderboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/leaderboard` | Get leaderboard (daily/weekly/monthly) | No |
| GET | `/leaderboard/rank` | Get user's rank | No |
| GET | `/leaderboard/rank/:userId` | Get specific user's rank | No |

---

### 14. Admin Routes (`/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users (admin) | Yes (Admin) |
| PUT | `/admin/users/:userId` | Update user (admin) | Yes (Admin) |
| GET | `/admin/bets` | Get all bets (admin) | Yes (Admin) |
| POST | `/admin/bets/:betId/resolve` | Resolve bet (admin) | Yes (Admin) |
| POST | `/admin/matches` | Create/upsert match (admin) | Yes (Admin) |
| PUT | `/admin/matches/:matchId` | Update match (admin) | Yes (Admin) |

---

### 15. Support Routes (`/support`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/support/quicklinks` | Get support quick links | No |

---

### 16. Webhook Routes (`/webhooks`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/webhooks/paynow` | PayNow payment webhook | No |
| POST | `/webhooks` | Generic webhook handler | No |

---

## Socket.IO Events

### Match Chat
- **Join**: `joinMatch(matchId)` - Join match chat room
- **Leave**: `leaveMatch(matchId)` - Leave match chat room
- **Send Message**: `matchMessage({ matchId, message, betOffer? })`
- **Receive**: `matchMessage(message)` - Real-time message broadcast

### Private Messages
- **Send**: `privateMessage({ toUserId, message })`
- **Receive**: `privateMessage(message)` - Real-time message
- **Acknowledgment**: `privateMessageSent(message)`

---

## Key Features

### 1. **Match Chat with Bet Offers** ⭐ (NEW)
Match chat now supports embedding bet offers directly in messages:
- Send a chat message with optional bet offer payload
- Bet offer can reference an existing bet or create a new one inline
- Includes stake, prediction, odds, and outcome
- Users can accept bets via the standard accept endpoint

### 2. **Two-Way Betting System**
- Create open bets with custom odds and stakes
- Multiple users can request to accept
- Bet creator chooses opponent
- Early settlement negotiation support
- Automatic settlement when match result is determined

### 3. **Badge System**
- Earn badges based on achievements
- Predefined badges awarded automatically
- Admin can create custom badges
- Check eligibility and claim badges

### 4. **Wallet & Payments**
- Deposit & withdrawal with multiple methods
- PayNow integration
- Transaction tracking
- Real-time balance updates

### 5. **Leaderboards**
- Track user performance
- Daily, weekly, monthly, all-time rankings
- Real-time rank updates

### 6. **KYC Verification**
- Document upload and verification
- Admin dashboard for review
- Status tracking

---

## Changes Made (Latest Session)

### Modified Files:
1. **src/models/match-chat.js** - Added bet offer metadata support
2. **src/utils/validators.js** - Added betOfferSchema validation
3. **src/services/chatService.js** - Enhanced postMessage with bet offer handling
4. **src/sockets/handlers/chatHandler.js** - Updated event handler for bet offers

### Removed Files:
1. `.env.example` - Unnecessary example file
2. `TODO.md` - Development tracking file

### Result:
✅ All APIs are set and operational

---

## Postman Testing Guide

### 1. Start the server
1. Set your `.env` values.
2. Run:
```bash
npm install
npm start
```
3. Confirm the backend is running on `http://localhost:5000`.

---

## Auth API Testing Payloads

### Register (Create new account)
**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Minimal payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Full payload (with preferences):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "StrongPassword456!",
  "phone": "+263771234567",
  "preferredSports": ["football", "basketball"],
  "preferredLeagues": ["Premier League", "NBA"]
}
```

**Expected response (201):**
```json
{
  "success": true,
  "data": {
    "id": "userid123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login (Sign in)
**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Payload:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected response (200):**
```json
{
  "success": true,
  "data": {
    "id": "userid123",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Firebase/Google Sign-in
**Endpoint:** `POST http://localhost:5000/api/auth/firebase`

**Payload:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIn0..."
}
```

**Note:** 
- Get `idToken` from Firebase Google login on your frontend
- If Firebase is not configured in `.env`, this will fail gracefully

**Expected response (200):**
```json
{
  "success": true,
  "data": {
    "id": "userid456",
    "name": "Google User",
    "email": "user@gmail.com",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Refresh Token (Get new JWT)
**Endpoint:** `POST http://localhost:5000/api/auth/refresh-token`

**Payload:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ..."
}
```

**Expected response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout
**Endpoint:** `POST http://localhost:5000/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Payload:**
```json
{}
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Testing Workflow

### Step 1: Register
1. Copy the **Register** payload above
2. `POST` to `/api/auth/register`
3. Save the response `token` and `refreshToken`

### Step 2: Login
1. Use the same credentials from Step 1
2. `POST` to `/api/auth/login`
3. Confirm you get a new `token` and `refreshToken`

### Step 3: Set Bearer Token
In Postman, go to:
- **Authorization** tab → Type: **Bearer Token**
- Paste the `token` value

### Step 4: Refresh Token (Optional)
1. Use the `refreshToken` from any previous response
2. `POST` to `/api/auth/refresh-token`
3. Confirm you get a new JWT `token`

### Step 5: Logout
1. Use your current Bearer token from Step 3
2. `POST` to `/api/auth/logout`
3. Confirm success response

### Step 6: Try Protected Endpoint
After logout, try `GET /api/users/profile` with your old token — it should fail with 401.

---

## Password Requirements

- **Minimum length:** 6 characters
- **Recommended:** Mix of uppercase, lowercase, numbers, and special characters (e.g., `"SecurePass123!"`)

---

## Valid Sports for Preferences

```
football, basketball, tennis, cricket, baseball, hockey, other
```

---

## Phone Format

- **Pattern:** `+?[0-9]{10,15}` (optional `+` prefix, 10–15 digits)
- **Examples:**
  - `+263771234567` ✅
  - `2263771234567` ✅
  - `771234567` ❌ (too short)

---

### 2. Authentication

#### Register
- URL: `POST http://localhost:5000/api/auth/register`
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "StrongPassword123"
}
```

#### Login
- URL: `POST http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "StrongPassword123"
}
```
---

### 3. Bet endpoints (continued below)

#### Create a bet
- URL: `POST http://localhost:5000/api/bets`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "matchId": "<matchId>",
  "marketType": "match_winner",
  "creatorPrediction": "home",
  "creatorStake": 20,
  "odds": 2.5,
  "outcome": "Home wins"
}
```

#### List your bets
- URL: `GET http://localhost:5000/api/bets`
- Headers: `Authorization: Bearer <token>`

#### Get bet details
- URL: `GET http://localhost:5000/api/bets/<betId>`
- Headers: `Authorization: Bearer <token>`

#### Accept a bet request
- URL: `POST http://localhost:5000/api/bets/<betId>/accept`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "decision": "accept"
}
```

#### Early settlement request
- URL: `POST http://localhost:5000/api/bets/<betId>/early-settlement/request`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "proposedAmount": 30
}
```

#### Respond to early settlement
- URL: `POST http://localhost:5000/api/bets/<betId>/early-settlement/respond`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "accept": true
}
```

### 4. Match endpoints

#### Get upcoming matches
- URL: `GET http://localhost:5000/api/matches/upcoming`

#### Get live matches
- URL: `GET http://localhost:5000/api/matches/live`

#### Get match details
- URL: `GET http://localhost:5000/api/matches/<matchId>`

#### Get match overview
- URL: `GET http://localhost:5000/api/matches/<matchId>/overview`

#### Get odds suggestion
- URL: `GET http://localhost:5000/api/matches/<matchId>/odds-suggestion`
- Query example: `?prediction=home`

### 5. Chat endpoints

#### Post match chat message
- URL: `POST http://localhost:5000/api/chat/match/<matchId>`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "message": "Want to bet on this game?",
  "betOffer": {
    "marketType": "match_winner",
    "creatorPrediction": "away",
    "odds": 3.2,
    "creatorStake": 15,
    "outcome": "Away wins"
  }
}
```

#### Get chat messages
- URL: `GET http://localhost:5000/api/chat/match/<matchId>`
- Headers: `Authorization: Bearer <token>`

### 6. Wallet and payments

#### Get wallet balance
- URL: `GET http://localhost:5000/api/wallet/balance`
- Headers: `Authorization: Bearer <token>`

#### Deposit funds
- URL: `POST http://localhost:5000/api/wallet/deposit`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "amount": 50
}
```

#### Withdraw funds
- URL: `POST http://localhost:5000/api/wallet/withdraw`
- Headers: `Authorization: Bearer <token>`
- Body (JSON):
```json
{
  "amount": 20,
  "method": "bank"
}
```

### 7. KYC endpoints

#### Submit KYC
- URL: `POST http://localhost:5000/api/kyc/submit`
- Headers: `Authorization: Bearer <token>`
- Form-data fields:
  - `documentType`
  - `documentNumber`
  - `documentFile` (file upload)

#### Get KYC status
- URL: `GET http://localhost:5000/api/kyc/status`
- Headers: `Authorization: Bearer <token>`

### 8. Test order
1. Register/login and get a Bearer token.
2. Create a bet or use chat bet offer to post a match message.
3. Accept or choose an opponent for the bet.
4. Use match routes to verify match and odds data.
5. Use wallet routes to confirm balances.
6. Use KYC routes for identity flow if required.

### 9. Render and `.env` status
- `render.yaml` now includes the correct PayNow env variable names and Firebase env variables.
- Your local `.env` contains Firebase keys, but ensure `FIREBASE_PRIVATE_KEY` is valid PEM.
- The app now also supports `EMAIL_USER` / `EMAIL_PASS` as legacy SMTP env names.

✅ Match chat now supports bet offers
✅ No syntax errors
✅ All dependencies installed
✅ Ready for production deployment

---

## Error Codes

Common HTTP Status Codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Too Many Requests (rate limited)
- **500** - Server Error

---

## Documentation
- **Swagger/OpenAPI**: `http://localhost:5000/api-docs`
- Full interactive API documentation available at startup

---

**Last Updated**: April 7, 2026
**Status**: ✅ Production Ready

// Bet statuses
const BET_STATUS = {
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
};

// Market types
const MARKET_TYPE = {
  MATCH_WINNER: 'match_winner',
  OVER_UNDER: 'over_under',
  BTTS: 'btts',
  FIRST_GOALSCORER: 'first_goalscorer',
  HANDICAP: 'handicap',
  EXACT_GOALS: 'exact_goals',
  NEXT_GOAL: 'next_goal',
};

// Standard match statuses
const MATCH_STATUS = {
  NOT_STARTED: 'NS',
  LIVE: 'LIVE',
  HALFTIME: 'HT',
  FULL_TIME: 'FT',
  CANCELLED: 'CANC',
  POSTPONED: 'POSTP',
  ABANDONED: 'ABAN',
  SUSPENDED: 'SUSP',
};

const SUPPORTED_SPORTS = [
  'football',
  'basketball',
  'cricket',
  'tennis',
  'horse_racing',
  'rugby',
  'esports',
  'boxing',
  'american_football',
  'hockey',
];

// Transaction types
const TRANSACTION_TYPE = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET_LOCK: 'bet_lock',
  BET_RELEASE: 'bet_release',
  BET_WIN: 'bet_win',
  COMMISSION: 'commission',
  REFUND: 'refund',
  EARLY_SETTLEMENT: 'early_settlement',
};

// Notification types
const NOTIFICATION_TYPE = {
  BET_CREATED: 'bet_created',
  BET_MATCHED: 'bet_matched',
  BET_LIVE: 'bet_live',
  BET_SETTLED: 'bet_settled',
  BET_CANCELLED: 'bet_cancelled',
  BET_DISPUTED: 'bet_disputed',
  BET_ACCEPT_REQUEST: 'bet_accept_request',
  BET_ACCEPT_SELECTED: 'bet_accept_selected',
  EARLY_SETTLEMENT_REQUEST: 'early_settlement_request',
  EARLY_SETTLEMENT_RESPONSE: 'early_settlement_response',
  WALLET_CREDIT: 'wallet_credit',
  WALLET_DEBIT: 'wallet_debit',
  KYC_STATUS: 'kyc_status',
  SYSTEM_ALERT: 'system_alert',
  MATCH_CHAT_MESSAGE: 'match_chat_message',
  PRIVATE_MESSAGE: 'private_message',
  BADGE_EARNED: 'badge_earned',
};

// User roles
const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  SUPPORT: 'support',
};

// KYC status
const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Leaderboard periods
const LEADERBOARD_PERIOD = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  ALL_TIME: 'all_time',
};

module.exports = {
  BET_STATUS,
  MARKET_TYPE,
  MATCH_STATUS,
  SUPPORTED_SPORTS,
  TRANSACTION_TYPE,
  NOTIFICATION_TYPE,
  USER_ROLE,
  KYC_STATUS,
  LEADERBOARD_PERIOD,
};
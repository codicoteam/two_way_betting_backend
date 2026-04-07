const Badge = require('../models/badge');
const User = require('../models/user');
const Bet = require('../models/bet');
const Match = require('../models/match');

/**
 * Determine whether a user has placed enough bets on their favorite team.
 */
const countFavoriteTeamBets = async (user, criteria) => {
  const favoriteTeam = criteria.teamId || user.favoriteTeam;
  if (!favoriteTeam) return 0;

  const bets = await Bet.find({ createdBy: user._id, marketType: 'match_winner' }).select('matchId creatorPrediction');
  if (!bets.length) return 0;

  const matchIds = bets.map((bet) => bet.matchId);
  const matches = await Match.find({ matchId: { $in: matchIds } }).select('matchId homeTeam.name awayTeam.name');
  const matchMap = matches.reduce((map, match) => {
    map[match.matchId] = match;
    return map;
  }, {});

  return bets.reduce((count, bet) => {
    const match = matchMap[bet.matchId];
    if (!match) return count;
    if (bet.creatorPrediction === 'home' && match.homeTeam.name === favoriteTeam) return count + 1;
    if (bet.creatorPrediction === 'away' && match.awayTeam.name === favoriteTeam) return count + 1;
    return count;
  }, 0);
};

/**
 * Check and award badges for a user based on their stats
 */
exports.checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const allBadges = await Badge.find();
  const earnedBadgeIds = user.badges.map(b => b.badgeId.toString());

  const newlyEarned = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge._id.toString())) continue;

    let earned = false;
    const { criteria } = badge;

    switch (criteria.type) {
      case 'bets_on_team':
        const count = await countFavoriteTeamBets(user, criteria);
        if (count >= criteria.threshold) earned = true;
        break;
      default:
        break;
    }

    if (earned) {
      user.badges.push({ badgeId: badge._id, earnedAt: new Date() });
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    await user.save();
  }

  return newlyEarned;
};

/**
 * Get all badges (for admin)
 */
exports.getAllBadges = async () => {
  return Badge.find().sort({ category: 1, name: 1 });
};

/**
 * Create a new badge (admin only)
 */
exports.createBadge = async (badgeData) => {
  const badge = await Badge.create(badgeData);
  return badge;
};
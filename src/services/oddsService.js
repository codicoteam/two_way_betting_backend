/**
 * Calculate implied probability from decimal odds
 */
exports.impliedProbability = (decimalOdds) => {
  return 1 / decimalOdds;
};

/**
 * Calculate backer stake given creator stake and odds
 */
exports.calculateBackerStake = (creatorStake, odds) => {
  return creatorStake * (odds - 1);
};

/**
 * Calculate potential payout for a given stake and odds
 */
exports.potentialPayout = (stake, odds) => {
  return stake * odds;
};

/**
 * Validate that odds are within acceptable range
 */
exports.validateOdds = (odds) => {
  return odds >= 1.01 && odds <= 100;
};
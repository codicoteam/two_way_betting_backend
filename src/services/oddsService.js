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

exports.calculateFavoriteOdds = (favoriteStrength, underdogStrength) => {
  if (typeof favoriteStrength !== 'number' || typeof underdogStrength !== 'number' || underdogStrength <= 0) {
    return 1.05;
  }
  const ratio = underdogStrength / favoriteStrength;
  const suggested = 1 + Math.min(0.25, Math.max(0.01, ratio * 0.25));
  return Math.max(1.01, Math.min(2.0, suggested));
};

exports.suggestOdds = (match, prediction) => {
  const homeStrength = exports.getTeamStrength(match.homeTeam?.stats);
  const awayStrength = exports.getTeamStrength(match.awayTeam?.stats);
  const homeIsFavorite = homeStrength >= awayStrength;
  const favoriteStrength = Math.max(homeStrength, awayStrength);
  const underdogStrength = Math.min(homeStrength, awayStrength);
  const favoriteTeam = homeIsFavorite ? 'home' : 'away';
  const underdogTeam = homeIsFavorite ? 'away' : 'home';
  const homeOdds = homeIsFavorite
    ? exports.calculateFavoriteOdds(favoriteStrength, underdogStrength)
    : exports.calculateSuggestedOdds(favoriteStrength, underdogStrength);
  const awayOdds = homeIsFavorite
    ? exports.calculateSuggestedOdds(favoriteStrength, underdogStrength)
    : exports.calculateFavoriteOdds(favoriteStrength, underdogStrength);
  const result = {
    homeOdds: Number(homeOdds.toFixed(2)),
    awayOdds: Number(awayOdds.toFixed(2)),
    favoriteTeam,
    underdogTeam,
    homeStrength,
    awayStrength,
    strengthRatio: favoriteStrength / Math.max(underdogStrength, 1),
  };
  if (!prediction) {
    return result;
  }

  if (prediction === 'draw') {
    return {
      ...result,
      suggestedOdds: 3.0,
      prediction,
    };
  }

  const chosenOdds = prediction === 'home' ? result.homeOdds : result.awayOdds;
  return {
    ...result,
    prediction,
    suggestedOdds: chosenOdds,
    isUnderdog: prediction !== 'draw' && prediction !== favoriteTeam,
  };
};

/**
 * Calculate a numeric strength score from team stats.
 * Supports different stat fields from external match providers.
 */
exports.getTeamStrength = (stats) => {
  if (!stats || typeof stats !== 'object') return 50;

  const values = [];
  if (typeof stats.rating === 'number') values.push(stats.rating);
  if (typeof stats.power === 'number') values.push(stats.power);
  if (typeof stats.strength === 'number') values.push(stats.strength);
  if (typeof stats.overallRating === 'number') values.push(stats.overallRating);
  if (typeof stats.elo === 'number') values.push(stats.elo);
  if (typeof stats.points === 'number') values.push(stats.points);
  if (typeof stats.score === 'number') values.push(stats.score);

  if (values.length > 0) {
    return Math.max(...values);
  }
  if (typeof stats.rank === 'number') {
    return Math.max(1, 100 - stats.rank);
  }
  if (typeof stats.position === 'number') {
    return Math.max(1, 100 - stats.position);
  }

  return 50;
};

exports.calculateSuggestedOdds = (favoriteStrength, underdogStrength) => {
  if (typeof favoriteStrength !== 'number' || typeof underdogStrength !== 'number' || underdogStrength <= 0) {
    return 2.0;
  }
  const ratio = favoriteStrength / underdogStrength;
  return Math.max(1.01, 1 + (ratio - 1) * 0.75);
};

exports.compareTeams = (match, prediction) => {
  const homeStrength = exports.getTeamStrength(match.homeTeam?.stats);
  const awayStrength = exports.getTeamStrength(match.awayTeam?.stats);

  const favoriteTeam = homeStrength >= awayStrength ? 'home' : 'away';
  const underdogTeam = favoriteTeam === 'home' ? 'away' : 'home';
  const favoriteStrength = Math.max(homeStrength, awayStrength);
  const underdogStrength = Math.min(homeStrength, awayStrength);
  const strengthRatio = underdogStrength > 0 ? favoriteStrength / underdogStrength : 1;
  const isUnderdog = prediction && prediction !== 'draw' && prediction !== favoriteTeam;
  const suggestedOdds = isUnderdog ? exports.calculateSuggestedOdds(favoriteStrength, underdogStrength) : null;

  return {
    favoriteTeam,
    underdogTeam,
    homeStrength,
    awayStrength,
    strengthRatio,
    isUnderdog,
    suggestedOdds,
  };
};

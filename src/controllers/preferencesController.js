const User = require('../models/user');

/**
 * Get available sports
 */
exports.getAvailableSports = async (req, res, next) => {
  try {
    const sports = ['football', 'basketball', 'tennis', 'cricket', 'baseball', 'hockey', 'other'];
    res.json({ success: true, data: sports });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available leagues (from matches in database)
 */
exports.getAvailableLeagues = async (req, res, next) => {
  try {
    const Match = require('../models/match');
    const leagues = await Match.distinct('leagueName').sort();
    res.json({ success: true, data: leagues });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user preferences
 */
exports.getUserPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('preferredSports preferredLeagues');
    if (!user) throw new Error('User not found');
    
    res.json({ 
      success: true, 
      data: {
        preferredSports: user.preferredSports || [],
        preferredLeagues: user.preferredLeagues || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 */
exports.updateUserPreferences = async (req, res, next) => {
  try {
    const { preferredSports, preferredLeagues } = req.body;
    
    // Validate sports if provided
    const validSports = ['football', 'basketball', 'tennis', 'cricket', 'baseball', 'hockey', 'other'];
    if (preferredSports) {
      const invalidSports = preferredSports.filter(sport => !validSports.includes(sport));
      if (invalidSports.length > 0) {
        return res.status(400).json({ 
          success: false, 
          errors: [`Invalid sports: ${invalidSports.join(', ')}`] 
        });
      }
    }

    // Validate league limit
    if (preferredLeagues && preferredLeagues.length > 5) {
      return res.status(400).json({ 
        success: false, 
        errors: ['Maximum 5 leagues allowed'] 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: {
          preferredSports: preferredSports || [],
          preferredLeagues: preferredLeagues || []
        }
      },
      { new: true, runValidators: true }
    ).select('preferredSports preferredLeagues');

    res.json({ 
      success: true, 
      data: {
        preferredSports: user.preferredSports,
        preferredLeagues: user.preferredLeagues
      }
    });
  } catch (error) {
    next(error);
  }
};

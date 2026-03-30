exports.getQuicklinks = async (req, res, next) => {
  try {
    const quicklinks = [
      {
        title: 'Help Center',
        description: 'Browse FAQs and tutorials on how to place bets, manage your account, and use DuelBet.',
        url: 'https://duelbet.com/help',
      },
      {
        title: 'Support Chat',
        description: 'Start a live chat with support for account or betting issues.',
        url: 'https://duelbet.com/support',
      },
      {
        title: 'Betting Rules',
        description: 'See the DuelBet rules for fair play, settlement, and payouts.',
        url: 'https://duelbet.com/rules',
      },
      {
        title: 'Contact Us',
        description: 'Email or call the DuelBet support team for urgent help.',
        url: 'mailto:support@duelbet.com',
      },
      {
        title: 'Security Help',
        description: 'Learn how to keep your account and wallet safe.',
        url: 'https://duelbet.com/security',
      },
    ];

    res.json({ success: true, data: quicklinks });
  } catch (error) {
    next(error);
  }
};

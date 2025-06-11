import express from 'express';
import { auth, isAdmin, rateLimit } from '../middleware/auth';
import Subscription, { ISubscription } from '../models/Subscription';
import { sendVerificationEmail, sendUnsubscribeConfirmation } from '../utils/email';

const router = express.Router();

// Rate limit for public endpoints: 20 requests per hour
const publicRateLimit = rateLimit(60 * 60 * 1000, 20);

// Subscribe to notifications
router.post('/subscribe', publicRateLimit, async (req, res) => {
  try {
    const { email, preferences, categories } = req.body;

    // Check if already subscribed
    let subscription = await Subscription.findOne({ email });

    if (subscription) {
      if (subscription.isVerified) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      // Resend verification for unverified subscription
      subscription.generateVerificationToken();
      await subscription.save();
      await sendVerificationEmail(subscription.email, subscription.verificationToken);
      return res.json({ message: 'Verification email resent' });
    }

    // Create new subscription
    subscription = new Subscription({
      email,
      preferences: preferences || {
        jobs: true,
        results: true,
        admissions: true,
        notifications: true
      },
      categories: categories || []
    });

    await subscription.save();
    await sendVerificationEmail(subscription.email, subscription.verificationToken);

    res.status(201).json({ message: 'Please check your email to verify subscription' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating subscription' });
  }
});

// Verify subscription
router.get('/verify/:token', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      verificationToken: req.params.token,
      verificationExpires: { $gt: new Date() }
    });

    if (!subscription) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    subscription.isVerified = true;
    subscription.verificationToken = '';
    await subscription.save();

    res.json({ message: 'Subscription verified successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error verifying subscription' });
  }
});

// Update subscription preferences
router.patch('/preferences', publicRateLimit, async (req, res) => {
  try {
    const { email, preferences, categories } = req.body;

    const subscription = await Subscription.findOne({ email, isVerified: true });
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (preferences) {
      subscription.preferences = {
        ...subscription.preferences,
        ...preferences
      };
    }

    if (categories) {
      subscription.categories = categories;
    }

    await subscription.save();
    res.json(subscription);
  } catch (error) {
    res.status(400).json({ message: 'Error updating preferences' });
  }
});

// Unsubscribe
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      unsubscribeToken: req.params.token
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await subscription.remove();
    await sendUnsubscribeConfirmation(subscription.email);

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    res.status(400).json({ message: 'Error unsubscribing' });
  }
});

// Get subscription status
router.get('/status/:email', publicRateLimit, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      email: req.params.email.toLowerCase()
    });

    if (!subscription) {
      return res.json({ subscribed: false });
    }

    res.json({
      subscribed: subscription.isVerified,
      preferences: subscription.preferences,
      categories: subscription.categories
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking subscription status' });
  }
});

// List all subscriptions (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      verified,
      search
    } = req.query;

    const query: any = {};

    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const total = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      subscriptions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// Delete subscription (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription' });
  }
});

// Get subscription statistics (admin only)
router.get('/stats/overview', auth, isAdmin, async (req, res) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $facet: {
          totalSubscriptions: [{ $count: 'count' }],
          verifiedSubscriptions: [
            { $match: { isVerified: true } },
            { $count: 'count' }
          ],
          preferenceStats: [
            {
              $group: {
                _id: null,
                jobs: {
                  $sum: { $cond: [{ $eq: ['$preferences.jobs', true] }, 1, 0] }
                },
                results: {
                  $sum: { $cond: [{ $eq: ['$preferences.results', true] }, 1, 0] }
                },
                admissions: {
                  $sum: { $cond: [{ $eq: ['$preferences.admissions', true] }, 1, 0] }
                },
                notifications: {
                  $sum: { $cond: [{ $eq: ['$preferences.notifications', true] }, 1, 0] }
                }
              }
            }
          ],
          recentSubscriptions: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription statistics' });
  }
});

export default router;
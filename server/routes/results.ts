import express from 'express';
import { auth, isEditorOrAdmin, rateLimit } from '../middleware/auth';
import Result, { IResult } from '../models/Result';

const router = express.Router();

// Rate limit for public endpoints: 100 requests per 15 minutes
const publicRateLimit = rateLimit(15 * 60 * 1000, 100);

// Get all results with filtering and pagination
router.get('/', publicRateLimit, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      type,
      status,
      search,
      sortBy = 'resultDate',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await Result.countDocuments(query);

    // Execute query with pagination and sorting
    const results = await Result.find(query)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      results,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results' });
  }
});

// Get result by ID
router.get('/:id', publicRateLimit, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result' });
  }
});

// Create new result (protected route)
router.post('/', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error creating result' });
  }
});

// Update result (protected route)
router.patch('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Update only allowed fields
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'organization',
      'examDate',
      'resultDate',
      'category',
      'resultUrl',
      'type',
      'status'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => (result[update as keyof IResult] = req.body[update]));
    await result.save();

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error updating result' });
  }
});

// Delete result (protected route)
router.delete('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result' });
  }
});

// Get result statistics
router.get('/stats/overview', publicRateLimit, async (req, res) => {
  try {
    const stats = await Result.aggregate([
      {
        $facet: {
          totalResults: [{ $count: 'count' }],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          recentResults: [
            {
              $match: {
                resultDate: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
              }
            },
            { $count: 'count' }
          ],
          categoryStats: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching result statistics' });
  }
});

export default router;
import express from 'express';
import { auth, isEditorOrAdmin, rateLimit } from '../middleware/auth';
import Admission, { IAdmission } from '../models/Admission';

const router = express.Router();

// Rate limit for public endpoints: 100 requests per 15 minutes
const publicRateLimit = rateLimit(15 * 60 * 1000, 100);

// Get all admissions with filtering and pagination
router.get('/', publicRateLimit, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      institute,
      course,
      status,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (category) query.category = category;
    if (institute) query.institute = institute;
    if (course) query.course = course;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { institute: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await Admission.countDocuments(query);

    // Execute query with pagination and sorting
    const admissions = await Admission.find(query)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      admissions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admissions' });
  }
});

// Get admission by ID
router.get('/:id', publicRateLimit, async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admission' });
  }
});

// Create new admission (protected route)
router.post('/', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(201).json(admission);
  } catch (error) {
    res.status(400).json({ message: 'Error creating admission' });
  }
});

// Update admission (protected route)
router.patch('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    // Update only allowed fields
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'institute',
      'course',
      'startDate',
      'endDate',
      'eligibility',
      'totalSeats',
      'applicationFee',
      'applicationUrl',
      'category',
      'status',
      'documents'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => (admission[update as keyof IAdmission] = req.body[update]));
    await admission.save();

    res.json(admission);
  } catch (error) {
    res.status(400).json({ message: 'Error updating admission' });
  }
});

// Delete admission (protected route)
router.delete('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }
    res.json({ message: 'Admission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admission' });
  }
});

// Get admission statistics
router.get('/stats/overview', publicRateLimit, async (req, res) => {
  try {
    const now = new Date();
    
    const stats = await Admission.aggregate([
      {
        $facet: {
          totalAdmissions: [{ $count: 'count' }],
          activeAdmissions: [
            {
              $match: {
                startDate: { $lte: now },
                endDate: { $gte: now }
              }
            },
            { $count: 'count' }
          ],
          upcomingAdmissions: [
            {
              $match: {
                startDate: { $gt: now }
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
          ],
          instituteStats: [
            {
              $group: {
                _id: '$institute',
                count: { $sum: 1 }
              }
            }
          ],
          courseStats: [
            {
              $group: {
                _id: '$course',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admission statistics' });
  }
});

export default router;
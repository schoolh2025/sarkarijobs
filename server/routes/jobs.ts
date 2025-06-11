import express from 'express';
import { auth, isEditorOrAdmin, rateLimit } from '../middleware/auth';
import Job, { IJob } from '../models/Job';

const router = express.Router();

// Rate limit for public endpoints: 100 requests per 15 minutes
const publicRateLimit = rateLimit(15 * 60 * 1000, 100);

// Get all jobs with filtering and pagination
router.get('/', publicRateLimit, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      department,
      status,
      search,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query;

    const query: any = {};

    // Apply filters
    if (category) query.category = category;
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'title.hi': { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await Job.countDocuments(query);

    // Execute query with pagination and sorting
    const jobs = await Job.find(query)
      .sort({ [sortBy as string]: sortOrder === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      jobs,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get job by ID
router.get('/:id', publicRateLimit, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job' });
  }
});

// Create new job (protected route)
router.post('/', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job' });
  }
});

// Update job (protected route)
router.patch('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update only allowed fields
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'department',
      'startDate',
      'endDate',
      'category',
      'eligibility',
      'salary',
      'location',
      'vacancies',
      'applicationUrl',
      'status'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => (job[update as keyof IJob] = req.body[update]));
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job' });
  }
});

// Delete job (protected route)
router.delete('/:id', auth, isEditorOrAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Get job statistics
router.get('/stats/overview', publicRateLimit, async (req, res) => {
  try {
    const now = new Date();
    
    const stats = await Job.aggregate([
      {
        $facet: {
          totalJobs: [{ $count: 'count' }],
          activeJobs: [
            {
              $match: {
                startDate: { $lte: now },
                endDate: { $gte: now }
              }
            },
            { $count: 'count' }
          ],
          upcomingJobs: [
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
          departmentStats: [
            {
              $group: {
                _id: '$department',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job statistics' });
  }
});

export default router;
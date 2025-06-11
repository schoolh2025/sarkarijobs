import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Job from '../models/Job';
import Result from '../models/Result';
import Admission from '../models/Admission';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkarijobs';

// Sample data for seeding
const sampleData = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@sarkarijobs.schoolhunt.in',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  jobs: [
    {
      title: {
        en: 'Railway Recruitment 2024',
        hi: 'रेलवे भर्ती 2024'
      },
      description: {
        en: 'Indian Railways is hiring for various positions across India.',
        hi: 'भारतीय रेलवे विभिन्न पदों के लिए भर्ती कर रहा है।'
      },
      department: 'Indian Railways',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      category: 'Railway Jobs',
      eligibility: '12th Pass, Graduation',
      salary: '25,000 - 35,000',
      location: 'All India',
      vacancies: 1000,
      applicationUrl: 'https://indianrailways.gov.in/recruitment',
      status: 'active'
    }
  ],
  results: [
    {
      title: {
        en: 'UPSC Civil Services Result 2023',
        hi: 'यूपीएससी सिविल सेवा परिणाम 2023'
      },
      description: {
        en: 'UPSC Civil Services Examination Results Declared',
        hi: 'यूपीएससी सिविल सेवा परीक्षा परिणाम घोषित'
      },
      organization: 'UPSC',
      examDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      resultDate: new Date(),
      category: 'Civil Services',
      resultUrl: 'https://upsc.gov.in/results',
      type: 'result',
      status: 'published'
    }
  ],
  admissions: [
    {
      title: {
        en: 'Delhi University Admission 2024',
        hi: 'दिल्ली विश्वविद्यालय प्रवेश 2024'
      },
      description: {
        en: 'Admissions open for various undergraduate courses',
        hi: 'विभिन्न स्नातक पाठ्यक्रमों के लिए प्रवेश खुला है'
      },
      institute: 'Delhi University',
      course: 'Undergraduate Programs',
      startDate: new Date(),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      eligibility: '12th Pass with minimum 60%',
      totalSeats: 5000,
      applicationFee: {
        general: 1000,
        reserved: 500
      },
      applicationUrl: 'https://admission.du.ac.in',
      category: 'University',
      status: 'active',
      documents: [
        '12th Marksheet',
        'Character Certificate',
        'Migration Certificate'
      ]
    }
  ]
};

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Result.deleteMany({}),
      Admission.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User(sampleData.admin);
    await admin.save();
    console.log('Created admin user');

    // Create jobs
    await Job.insertMany(sampleData.jobs);
    console.log('Created sample jobs');

    // Create results
    await Result.insertMany(sampleData.results);
    console.log('Created sample results');

    // Create admissions
    await Admission.insertMany(sampleData.admissions);
    console.log('Created sample admissions');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder
seedDatabase();
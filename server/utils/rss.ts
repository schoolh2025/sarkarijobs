import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import Job from '../models/Job';
import Result from '../models/Result';
import Admission from '../models/Admission';

const parseXml = promisify(parseString);

interface RSSItem {
  title: string[];
  description: string[];
  link: string[];
  pubDate: string[];
  category?: string[];
}

interface RSSFeed {
  rss: {
    channel: [{
      item: RSSItem[];
    }];
  };
}

// Function to fetch and parse RSS feed
const fetchRSSFeed = async (url: string): Promise<RSSItem[]> => {
  try {
    const response = await axios.get(url);
    const feed = await parseXml(response.data) as RSSFeed;
    return feed.rss.channel[0].item;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    return [];
  }
};

// Function to determine content type from categories or title
const determineContentType = (item: RSSItem): 'job' | 'result' | 'admission' | null => {
  const title = item.title[0].toLowerCase();
  const categories = item.category?.map(cat => cat.toLowerCase()) || [];

  if (
    title.includes('vacancy') ||
    title.includes('recruitment') ||
    title.includes('job') ||
    categories.some(cat => ['jobs', 'vacancies', 'recruitment'].includes(cat))
  ) {
    return 'job';
  }

  if (
    title.includes('result') ||
    title.includes('score') ||
    title.includes('merit list') ||
    categories.some(cat => ['results', 'scores'].includes(cat))
  ) {
    return 'result';
  }

  if (
    title.includes('admission') ||
    title.includes('application') ||
    title.includes('course') ||
    categories.some(cat => ['admissions', 'education'].includes(cat))
  ) {
    return 'admission';
  }

  return null;
};

// Function to extract dates from description
const extractDates = (description: string): { startDate?: Date; endDate?: Date } => {
  const dates: { startDate?: Date; endDate?: Date } = {};

  // Common date patterns
  const datePatterns = [
    /start date:?\s*(\d{1,2}[-./ ]\d{1,2}[-./ ]\d{2,4})/i,
    /last date:?\s*(\d{1,2}[-./ ]\d{1,2}[-./ ]\d{2,4})/i,
    /opening date:?\s*(\d{1,2}[-./ ]\d{1,2}[-./ ]\d{2,4})/i,
    /closing date:?\s*(\d{1,2}[-./ ]\d{1,2}[-./ ]\d{2,4})/i
  ];

  datePatterns.forEach(pattern => {
    const match = description.match(pattern);
    if (match && match[1]) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        if (pattern.source.includes('start') || pattern.source.includes('opening')) {
          dates.startDate = date;
        } else {
          dates.endDate = date;
        }
      }
    }
  });

  return dates;
};

// Function to process job items
const processJobItem = async (item: RSSItem): Promise<void> => {
  try {
    const { startDate, endDate } = extractDates(item.description[0]);
    
    const jobData = {
      title: {
        en: item.title[0],
        hi: '' // To be translated
      },
      description: {
        en: item.description[0],
        hi: '' // To be translated
      },
      department: item.category?.[0] || 'General',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      category: 'Government',
      applicationUrl: item.link[0],
      status: 'active'
    };

    await Job.findOneAndUpdate(
      { applicationUrl: jobData.applicationUrl },
      jobData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error processing job item:', error);
  }
};

// Function to process result items
const processResultItem = async (item: RSSItem): Promise<void> => {
  try {
    const resultData = {
      title: {
        en: item.title[0],
        hi: '' // To be translated
      },
      description: {
        en: item.description[0],
        hi: '' // To be translated
      },
      organization: item.category?.[0] || 'General',
      resultDate: new Date(item.pubDate[0]),
      examDate: new Date(), // To be extracted from description
      category: 'Examination',
      resultUrl: item.link[0],
      type: 'result',
      status: 'published'
    };

    await Result.findOneAndUpdate(
      { resultUrl: resultData.resultUrl },
      resultData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error processing result item:', error);
  }
};

// Function to process admission items
const processAdmissionItem = async (item: RSSItem): Promise<void> => {
  try {
    const { startDate, endDate } = extractDates(item.description[0]);

    const admissionData = {
      title: {
        en: item.title[0],
        hi: '' // To be translated
      },
      description: {
        en: item.description[0],
        hi: '' // To be translated
      },
      institute: item.category?.[0] || 'General',
      course: 'General', // To be extracted from description
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      category: 'Education',
      applicationUrl: item.link[0],
      status: 'active'
    };

    await Admission.findOneAndUpdate(
      { applicationUrl: admissionData.applicationUrl },
      admissionData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error processing admission item:', error);
  }
};

// Main function to update content from RSS feeds
export const updateContentFromRSS = async (feeds: string[]): Promise<void> => {
  try {
    for (const feedUrl of feeds) {
      const items = await fetchRSSFeed(feedUrl);

      for (const item of items) {
        const contentType = determineContentType(item);

        switch (contentType) {
          case 'job':
            await processJobItem(item);
            break;
          case 'result':
            await processResultItem(item);
            break;
          case 'admission':
            await processAdmissionItem(item);
            break;
          default:
            console.log('Skipping item with unknown content type:', item.title[0]);
        }
      }
    }
  } catch (error) {
    console.error('Error updating content from RSS feeds:', error);
  }
};

// Schedule regular updates (can be called from a cron job)
export const scheduleContentUpdates = (feeds: string[], intervalMinutes: number = 60): void => {
  setInterval(() => {
    updateContentFromRSS(feeds).catch(error => {
      console.error('Scheduled content update failed:', error);
    });
  }, intervalMinutes * 60 * 1000);
};
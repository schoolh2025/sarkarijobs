import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        jobs: 'Jobs',
        results: 'Results',
        admissions: 'Admissions',
      },
      home: {
        results: 'Latest Results',
        admissions: 'Admissions',
        latestResults: 'Recent Updates',
        jobs: 'Latest Jobs',
      },
      job: {
        active: 'Active',
        expired: 'Expired',
        startDate: 'Start Date',
        endDate: 'Last Date',
        apply: 'Apply Now',
        vacancies: 'Vacancies',
        salary: 'Salary',
      },
      footer: {
        about: 'About Us',
        description: 'Your trusted source for government job updates, results, and admissions across India.',
        quickLinks: 'Quick Links',
        aboutUs: 'About Us',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Use',
        subscribe: 'Subscribe to Updates',
        emailPlaceholder: 'Enter your email',
        subscribeButton: 'Subscribe',
        subscribeSuccess: 'Successfully subscribed to updates!',
        subscribeError: 'Failed to subscribe. Please try again.',
        rights: 'All rights reserved.',
      },
    },
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        jobs: 'नौकरियां',
        results: 'रिजल्ट',
        admissions: 'प्रवेश',
      },
      home: {
        results: 'नवीनतम परिणाम',
        admissions: 'प्रवेश',
        latestResults: 'हाल की अपडेट',
        jobs: 'नवीनतम नौकरियां',
      },
      job: {
        active: 'सक्रिय',
        expired: 'समाप्त',
        startDate: 'आरंभ तिथि',
        endDate: 'अंतिम तिथि',
        apply: 'अभी आवेदन करें',
        vacancies: 'रिक्तियां',
        salary: 'वेतन',
      },
      footer: {
        about: 'हमारे बारे में',
        description: 'भारत भर में सरकारी नौकरी अपडेट, परिणाम और प्रवेश के लिए आपका विश्वसनीय स्रोत।',
        quickLinks: 'त्वरित लिंक',
        aboutUs: 'हमारे बारे में',
        contact: 'संपर्क करें',
        privacy: 'गोपनीयता नीति',
        terms: 'उपयोग की शर्तें',
        subscribe: 'अपडेट के लिए सदस्यता लें',
        emailPlaceholder: 'अपना ईमेल दर्ज करें',
        subscribeButton: 'सदस्यता लें',
        subscribeSuccess: 'अपडेट के लिए सफलतापूर्वक सदस्यता ली गई!',
        subscribeError: 'सदस्यता लेने में विफल। कृपया पुनः प्रयास करें।',
        rights: 'सर्वाधिकार सुरक्षित।',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
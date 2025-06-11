import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  useTheme,
} from '@mui/material';
import { CalendarToday, LocationOn, WorkOutline } from '@mui/icons-material';
import { Job } from '../../store/jobsSlice';

interface JobCardProps {
  job: Job;
  showDetails?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, showDetails = false }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const currentLanguage = i18n.language;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isJobActive = () => {
    const now = new Date();
    const endDate = new Date(job.endDate);
    return endDate > now;
  };

  return (
    <Card
      elevation={2}
      sx={{
        mb: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {job.title[currentLanguage]}
          </Typography>
          <Chip
            label={isJobActive() ? t('job.active') : t('job.expired')}
            color={isJobActive() ? 'success' : 'error'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <WorkOutline fontSize="small" />
            <Typography variant="body2">{job.department}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOn fontSize="small" />
            <Typography variant="body2">{job.location}</Typography>
          </Box>
        </Box>

        {showDetails && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {job.description[currentLanguage]}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <CalendarToday fontSize="small" sx={{ color: theme.palette.customColors.startDate }} />
              <Typography variant="body2" sx={{ color: theme.palette.customColors.startDate }}>
                {t('job.startDate')}: {formatDate(job.startDate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarToday fontSize="small" sx={{ color: theme.palette.customColors.endDate }} />
              <Typography variant="body2" sx={{ color: theme.palette.customColors.endDate }}>
                {t('job.endDate')}: {formatDate(job.endDate)}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            href={job.applicationUrl}
            target="_blank"
            disabled={!isJobActive()}
          >
            {t('job.apply')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Chip
            label={job.category}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${t('job.vacancies')}: ${job.vacancies}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${t('job.salary')}: ${job.salary}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default JobCard;
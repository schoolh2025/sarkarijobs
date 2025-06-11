import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { RootState } from '../../store';
import JobCard from '../../components/JobCard';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const jobs = useSelector((state: RootState) => state.jobs.items);
  const results = useSelector((state: RootState) => state.results.items);
  const admissions = useSelector((state: RootState) => state.admissions.items);

  const ColumnHeader: React.FC<{ title: string }> = ({ title }) => (
    <Typography
      variant="h6"
      sx={{
        p: 2,
        bgcolor: theme.palette.primary.main,
        color: 'white',
        borderRadius: '8px 8px 0 0',
      }}
    >
      {title}
    </Typography>
  );

  const ColumnContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {children}
    </Paper>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {/* Results Column */}
        <Grid item xs={12} md={3}>
          <ColumnContainer>
            <ColumnHeader title={t('home.results')} />
            <Box sx={{ p: 2 }}>
              {results.map((result) => (
                <Box key={result.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{result.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ColumnContainer>
        </Grid>

        {/* Admissions Column */}
        <Grid item xs={12} md={3}>
          <ColumnContainer>
            <ColumnHeader title={t('home.admissions')} />
            <Box sx={{ p: 2 }}>
              {admissions.map((admission) => (
                <Box key={admission.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{admission.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {admission.institute}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ColumnContainer>
        </Grid>

        {/* Latest Results Column */}
        <Grid item xs={12} md={3}>
          <ColumnContainer>
            <ColumnHeader title={t('home.latestResults')} />
            <Box sx={{ p: 2 }}>
              {results.slice(0, 5).map((result) => (
                <Box key={result.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{result.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {result.date}
                  </Typography>
                </Box>
              ))}
            </Box>
          </ColumnContainer>
        </Grid>

        {/* Jobs Column */}
        <Grid item xs={12} md={3}>
          <ColumnContainer>
            <ColumnHeader title={t('home.jobs')} />
            <Box sx={{ p: 2 }}>
              {jobs.slice(0, 5).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </Box>
          </ColumnContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
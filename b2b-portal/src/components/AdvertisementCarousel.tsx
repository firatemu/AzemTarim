'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardMedia, IconButton, MobileStepper, Paper } from '@mui/material';
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';

interface Advertisement {
  id: string;
  type: 'HOMEPAGE_BANNER' | 'LOGIN_POPUP';
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
  startsAt?: string;
  endsAt?: string;
}

interface AdvertisementCarouselProps {
  location: 'homepage' | 'login';
  autoPlay?: boolean;
  interval?: number;
}

export function AdvertisementCarousel({
  location,
  autoPlay = true,
  interval = 5000,
}: AdvertisementCarouselProps) {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = 5; // Show max 5 ads

  // Fetch advertisements
  const { data: ads = [] } = useQuery({
    queryKey: ['b2b-advertisements', location],
    queryFn: async () => {
      const type = location === 'homepage' ? 'HOMEPAGE_BANNER' : 'LOGIN_POPUP';
      const res = await axios.get<Advertisement[]>('/b2b/advertisements', {
        params: {
          type,
          isActive: true,
          limit: maxSteps,
        },
      });
      return res.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Filter ads by date and limit
  const activeAds = ads
    .filter((ad) => {
      const now = new Date();
      if (ad.startsAt && new Date(ad.startsAt) > now) return false;
      if (ad.endsAt && new Date(ad.endsAt) < now) return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, maxSteps);

  useEffect(() => {
    if (!autoPlay || activeAds.length <= 1) return;

    const timer = setInterval(() => {
      setActiveStep((prevActiveStep) => (prevActiveStep + 1) % activeAds.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, activeAds.length]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % activeAds.length);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + activeAds.length) % activeAds.length);
  };

  if (activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[activeStep];

  if (!currentAd) {
    return null;
  }

  const cardContent = (
    <Card
      component={Link}
      href={currentAd.linkUrl || '#'}
      sx={{
        position: 'relative',
        textDecoration: 'none',
        cursor: currentAd.linkUrl ? 'pointer' : 'default',
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: '100%',
          height: { xs: 200, md: 300 },
          objectFit: 'cover',
        }}
        image={currentAd.imageUrl}
        alt="Advertisement"
      />
    </Card>
  );

  if (activeAds.length === 1) {
    return <Box sx={{ my: 2 }}>{cardContent}</Box>;
  }

  return (
    <Box sx={{ my: 2, maxWidth: '100%', flexGrow: 1 }}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        {cardContent}

        <MobileStepper
          steps={activeAds.length}
          position="static"
          activeStep={activeStep}
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === activeAds.length - 1}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          }
        />
      </Paper>
    </Box>
  );
}

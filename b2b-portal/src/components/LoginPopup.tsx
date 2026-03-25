'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Advertisement {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
}

export function LoginPopup() {
  const [open, setOpen] = useState(false);
  const [ad, setAd] = useState<Advertisement | null>(null);

  // Check if popup already shown this session
  useEffect(() => {
    const popupShown = sessionStorage.getItem('b2b_popup_shown');
    if (popupShown) return;

    // Fetch popup advertisement
    const fetchPopup = async () => {
      try {
        const res = await axios.get<{ data: Advertisement[] }>('/b2b/advertisements/popup');
        const ads = res.data.data || [];

        // Filter active ads
        const now = new Date();
        const activeAd = ads.find((a) => {
          if (!a.isActive) return false;
          if (a.startsAt && new Date(a.startsAt) > now) return false;
          if (a.endsAt && new Date(a.endsAt) < now) return false;
          return true;
        });

        if (activeAd) {
          setAd(activeAd);
          setOpen(true);
          sessionStorage.setItem('b2b_popup_shown', 'true');
        }
      } catch (err) {
        console.error('Failed to fetch popup:', err);
      }
    };

    fetchPopup();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  if (!ad || !open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          position: 'relative',
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'background.default',
          },
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle sx={{ pr: 6 }}>Hoş Geldiniz!</DialogTitle>

      <DialogContent>
        <Box
          component="img"
          src={ad.imageUrl}
          alt="Advertisement"
          sx={{
            width: '100%',
            height: 'auto',
            borderRadius: 2,
            cursor: ad.linkUrl ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (ad.linkUrl) {
              window.open(ad.linkUrl, '_blank');
            }
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="contained" autoFocus>
          Geç
        </Button>
      </DialogActions>
    </Dialog>
  );
}

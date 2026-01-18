'use client';

import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTabStore } from '@/stores/tabStore';
import { useRouter } from 'next/navigation';

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, removeTab } = useTabStore();
  const router = useRouter();

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    const tab = tabs.find((t) => t.id === newValue);
    if (tab) {
      router.push(tab.path);
    }
  };

  const handleCloseTab = (
    event: React.MouseEvent,
    tabId: string
  ) => {
    event.stopPropagation();
    const isClosingActive = activeTab === tabId;
    let fallbackPath: string | undefined;

    if (isClosingActive) {
      const closingIndex = tabs.findIndex((t) => t.id === tabId);
      const previousTab = tabs[closingIndex - 1];
      const nextTab = tabs[closingIndex + 1];
      const targetTab = previousTab ?? nextTab;
      fallbackPath = targetTab?.path;
    }

    removeTab(tabId);

    if (isClosingActive) {
      router.push(fallbackPath ?? '/dashboard');
    }
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="module tabs"
        sx={{
          '& .MuiTabs-indicator': {
            height: 3,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {tabs.map((tab) => {
          const canCloseTab = tabs.length > 1 || tab.id !== 'dashboard';
          const isActive = tab.id === activeTab;

          return (
            <Tab
              key={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.label}
                  {canCloseTab && (
                    <Box
                      component="span"
                      onClick={(e) => handleCloseTab(e, tab.id)}
                      sx={{ 
                        ml: 0.5, 
                        p: 0.25,
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </Box>
                  )}
                </Box>
              }
              value={tab.id}
              sx={{ 
                textTransform: 'none', 
                minHeight: 48,
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#667eea',
                  fontWeight: 600,
                }
              }}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}


// client/components/projects/ProjectCardSkeleton.tsx
'use client';

import { 
  Card, 
  CardContent, 
  Skeleton, 
  Box, 
  CardActions 
} from '@mui/material';

interface ProjectCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ProjectCardSkeleton({ viewMode = 'grid' }: ProjectCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <Card 
        sx={{ 
          mb: 1, 
          '&:hover': { 
            boxShadow: (theme) => theme.shadows[4] 
          } 
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        '&:hover': { 
          boxShadow: (theme) => theme.shadows[8] 
        } 
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        {/* Project title */}
        <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
        
        {/* Description */}
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
        
        {/* Progress bar */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="text" width="20%" height={16} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={6} sx={{ borderRadius: 1 }} />
        </Box>
        
        {/* Status and due date */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        </Box>
        
        {/* Owner info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="40%" height={16} />
        </Box>
      </CardContent>
      
      <CardActions sx={{ pt: 0 }}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Box sx={{ ml: 'auto' }}>
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardActions>
    </Card>
  );
}

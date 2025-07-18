import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color?: string;
  subtitle?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = React.memo(({
  title,
  value,
  icon,
  color = 'primary.main',
  subtitle,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        height: '100%',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          component="div"
          sx={{ mt: 2, fontWeight: 'bold' }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
});

export default DashboardCard;

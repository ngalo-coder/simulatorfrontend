import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DashboardProps {
  title: string;
  tabs: { icon: React.ReactElement; label: string }[];
  tabPanels: React.ReactNode[];
  onRefresh?: () => void;
  startSimulation?: () => void;
}

const Dashboard: React.FC<DashboardProps> = React.memo(({
  title,
  tabs,
  tabPanels,
  onRefresh,
  startSimulation,
}) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {startSimulation && (
            <Button
              variant="outlined"
              color="primary"
              onClick={startSimulation}
            >
              Start Simulation
            </Button>
          )}
          {onRefresh && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={onRefresh}
            >
              Refresh Data
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              id={`dashboard-tab-${index}`}
              aria-controls={`dashboard-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {tabPanels.map((panel, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          {panel}
        </TabPanel>
      ))}
    </Container>
  );
});

export default Dashboard;

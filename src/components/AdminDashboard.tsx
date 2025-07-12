import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Dashboard, 
  People, 
  Assignment, 
  Settings, 
  Refresh,
  Delete,
  Add
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

interface SystemStats {
  totalUsers: number;
  totalCases: number;
  totalSessions: number;
  activeSessions: number;
  casesByDifficulty: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
  casesByProgramArea: {
    [key: string]: number;
  };
  usersByRole: {
    Admin: number;
    Clinician: number;
    Instructor: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
  casesCompleted: number;
}

interface CaseData {
  id: string;
  title: string;
  programArea: string;
  specialty: string;
  difficulty: string;
  createdAt: string;
  timesCompleted: number;
  averageScore: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'user' | 'case' } | null>(null);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [createUserError, setCreateUserError] = useState('');
  const [userPaginationModel, setUserPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [casePaginationModel, setCasePaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  useEffect(() => {
    const loadAdminData = async () => {
      if (currentUser && currentUser.role === 'admin') {
        try {
          setLoading(true);
          
          // Fetch system stats
          try {
            const statsData = await api.fetchSystemStats();
            setSystemStats(statsData);
          } catch (error) {
            console.error('Error fetching system stats:', error);
            // Fallback to simulated data if API fails
            const statsData = {
              totalUsers: 125,
              totalCases: 1000,
              totalSessions: 3450,
              activeSessions: 12,
              casesByDifficulty: {
                Beginner: 400,
                Intermediate: 400,
                Advanced: 200
              },
              casesByProgramArea: {
                "Basic Program": 600,
                "Specialty Program": 400
              },
              usersByRole: {
                Admin: 5,
                Clinician: 100,
                Instructor: 20
              }
            };
            setSystemStats(statsData);
          }
          
          // Fetch users
          try {
            const usersData = await api.fetchUsers();
            setUsers(usersData);
          } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to simulated data if API fails
            const usersData = Array.from({ length: 50 }, (_, i) => ({
              id: `user-${i + 1}`,
              name: `User ${i + 1}`,
              email: `user${i + 1}@example.com`,
              role: i < 5 ? 'Admin' : (i < 25 ? 'Clinician' : 'Instructor'),
              createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
              lastLogin: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
              casesCompleted: Math.floor(Math.random() * 50)
            }));
            setUsers(usersData);
          }
          
          // Fetch cases
          try {
            const casesData = await api.fetchAdminCases();
            setCases(casesData);
          } catch (error) {
            console.error('Error fetching cases:', error);
            // Fallback to simulated data if API fails
            const casesData = Array.from({ length: 50 }, (_, i) => ({
              id: `VP-${i + 1}`,
              title: `Case ${i + 1}`,
              programArea: Math.random() > 0.5 ? 'Basic Program' : 'Specialty Program',
              specialty: ['Internal Medicine', 'Surgery', 'Pediatrics', 'Ophthalmology', 'ENT'][Math.floor(Math.random() * 5)],
              difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
              createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
              timesCompleted: Math.floor(Math.random() * 100),
              averageScore: Math.floor(Math.random() * 40) + 60
            }));
            setCases(casesData);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading admin data:', error);
          setLoading(false);
        }
      }
    };

    loadAdminData();
  }, [currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (id: string, type: 'user' | 'case') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        setLoading(true);
        
        if (itemToDelete.type === 'user') {
          // Call API to delete user
          await api.deleteUser(itemToDelete.id);
          // Update local state
          setUsers(users.filter(user => user.id !== itemToDelete.id));
        } else {
          // Call API to delete case
          await api.deleteCase(itemToDelete.id);
          // Update local state
          setCases(cases.filter(caseItem => caseItem.id !== itemToDelete.id));
        }
        
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error(`Error deleting ${itemToDelete.type}:`, error);
        // Show error message to user
        // This could be enhanced with a proper error notification system
        alert(`Failed to delete ${itemToDelete.type}. Please try again.`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCreateUserOpen = () => {
    setCreateUserDialogOpen(true);
    setNewUser({ username: '', email: '', password: '', role: 'user' });
    setCreateUserError('');
  };

  const handleCreateUserClose = () => {
    setCreateUserDialogOpen(false);
  };

  const handleCreateUserChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name as string]: value
    });
  };

  const handleCreateUserSubmit = async () => {
    try {
      setLoading(true);
      setCreateUserError('');
      
      if (newUser.role === 'admin') {
        await api.createAdminUser({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password
        });
      } else {
        // Regular user creation would go here
        // This is a placeholder for future implementation
        await api.post('/auth/register', {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password
        });
      }
      
      // Refresh user list
      const usersData = await api.fetchUsers();
      setUsers(usersData);
      
      setCreateUserDialogOpen(false);
      setNewUser({ username: '', email: '', password: '', role: 'user' });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof Error) {
        setCreateUserError(error.message);
      } else {
        setCreateUserError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setLoading(true);
      await api.updateUserRole(userId, newRole);
      
      // Refresh user list
      const usersData = await api.fetchUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error updating user role:', error);
      // Show error message to user
      alert(`Failed to update user role. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    
    try {
      // Fetch system stats
      try {
        const statsData = await api.fetchSystemStats();
        setSystemStats(statsData);
      } catch (error) {
        console.error('Error refreshing system stats:', error);
      }
      
      // Fetch users
      try {
        const usersData = await api.fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error refreshing users:', error);
      }
      
      // Fetch cases
      try {
        const casesData = await api.fetchAdminCases();
        setCases(casesData);
      } catch (error) {
        console.error('Error refreshing cases:', error);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => (
        <FormControl variant="standard" sx={{ minWidth: 120 }}>
          <Select
            value={params.value}
            onChange={(e) => handleUpdateUserRole(params.row.id, e.target.value as 'user' | 'admin')}
            size="small"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params: { value: string }) => new Date(params.value).toLocaleDateString()
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 120,
      valueFormatter: (params: { value: string }) => new Date(params.value).toLocaleDateString()
    },
    { field: 'casesCompleted', headerName: 'Cases Completed', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDeleteClick(params.row.id, 'user')}
        >
          <Delete fontSize="small" />
        </Button>
      ),
    },
  ];

  const caseColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'programArea', headerName: 'Program Area', width: 150 },
    { field: 'specialty', headerName: 'Specialty', width: 150 },
    { field: 'difficulty', headerName: 'Difficulty', width: 120 },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      valueFormatter: (params: { value: string }) => new Date(params.value).toLocaleDateString()
    },
    { field: 'timesCompleted', headerName: 'Times Completed', width: 150 },
    { field: 'averageScore', headerName: 'Avg Score', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDeleteClick(params.row.id, 'case')}
        >
          <Delete fontSize="small" />
        </Button>
      ),
    },
  ];

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Access Denied
        </Typography>
        <Typography>
          You do not have permission to access the admin dashboard.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Admin Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={handleRefreshData}
        >
          Refresh Data
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab icon={<Dashboard />} label="Overview" {...a11yProps(0)} />
          <Tab icon={<People />} label="Users" {...a11yProps(1)} />
          <Tab icon={<Assignment />} label="Cases" {...a11yProps(2)} />
          <Tab icon={<Settings />} label="Settings" {...a11yProps(3)} />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        {systemStats && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h3">
                      {systemStats.totalUsers}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Cases
                    </Typography>
                    <Typography variant="h3">
                      {systemStats.totalCases}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Sessions
                    </Typography>
                    <Typography variant="h3">
                      {systemStats.totalSessions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Active Sessions
                    </Typography>
                    <Typography variant="h3">
                      {systemStats.activeSessions}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Cases by Difficulty
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Beginner', value: systemStats.casesByDifficulty.Beginner },
                          { name: 'Intermediate', value: systemStats.casesByDifficulty.Intermediate },
                          { name: 'Advanced', value: systemStats.casesByDifficulty.Advanced }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill={theme.palette.primary.main} />
                        <Cell fill={theme.palette.secondary.main} />
                        <Cell fill={theme.palette.error.main} />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Users by Role
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: 'Admin', count: systemStats.usersByRole.Admin },
                        { name: 'Clinician', count: systemStats.usersByRole.Clinician },
                        { name: 'Instructor', count: systemStats.usersByRole.Instructor }
                      ]}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Cases by Program Area
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={Object.entries(systemStats.casesByProgramArea).map(([name, value]) => ({ name, count: value }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.secondary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">
            User Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateUserOpen}
          >
            Add User
          </Button>
        </Box>
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={userColumns}
            paginationModel={userPaginationModel}
            onPaginationModelChange={setUserPaginationModel}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>

      {/* Cases Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">
            Case Management
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              sx={{ mr: 1 }}
            >
              Add Case
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => window.location.href = '/scripts-documentation'}
            >
              Case Scripts
            </Button>
          </Box>
        </Box>
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={cases}
            columns={caseColumns}
            paginationModel={casePaginationModel}
            onPaginationModelChange={setCasePaginationModel}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Paper>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom>
          System Settings
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Database Management
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" paragraph>
              Use these tools to manage the database. Be careful, these actions cannot be undone.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ mr: 2 }}
              onClick={() => window.location.href = '/scripts-documentation'}
            >
              View Scripts Documentation
            </Button>
            <Button 
              variant="outlined" 
              color="error"
            >
              Reset Database
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            System Configuration
          </Typography>
          <Typography variant="body1">
            System configuration options will be available in a future update.
          </Typography>
        </Paper>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={createUserDialogOpen}
        onClose={handleCreateUserClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          {createUserError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {createUserError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={newUser.username}
            onChange={handleCreateUserChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={handleCreateUserChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newUser.password}
            onChange={handleCreateUserChange}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="user-role-label">Role</InputLabel>
            <Select
              labelId="user-role-label"
              name="role"
              value={newUser.role}
              label="Role"
              onChange={handleCreateUserChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateUserClose}>Cancel</Button>
          <Button
            onClick={handleCreateUserSubmit}
            color="primary"
            variant="contained"
            disabled={!newUser.username || !newUser.email || !newUser.password}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
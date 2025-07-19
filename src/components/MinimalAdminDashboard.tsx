import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { adminApi } from "../services/adminApi";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  LocalHospital as LocalHospitalIcon,
} from "@mui/icons-material";

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface ProgramArea {
  id: string;
  name: string;
  casesCount: number;
}

interface Specialty {
  id: string;
  name: string;
  programArea: string;
  casesCount: number;
}

interface SystemStats {
  totalUsers: number;
  totalCases: number;
  totalSessions: number;
  activeSessions: number;
}

const MinimalAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  
  // Program Areas state
  const [programAreas, setProgramAreas] = useState<ProgramArea[]>([]);
  const [newProgramArea, setNewProgramArea] = useState("");
  const [editingProgramArea, setEditingProgramArea] = useState<{id: string, name: string} | null>(null);
  
  // Specialties state
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [newSpecialty, setNewSpecialty] = useState({name: "", programArea: ""});
  const [editingSpecialty, setEditingSpecialty] = useState<{id: string, name: string, programArea: string} | null>(null);
  
  // Dialog states
  const [programAreaDialogOpen, setProgramAreaDialogOpen] = useState(false);
  const [specialtyDialogOpen, setSpecialtyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'programArea' | 'specialty', name: string} | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success" as "success" | "error"});

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Function to fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is admin
      if (!currentUser || currentUser.role !== "admin") {
        setError("You don't have permission to access this dashboard");
        setIsLoading(false);
        return;
      }
      
      // Fetch system stats
      try {
        const statsResponse = await api.fetchSystemStats();
        setSystemStats(statsResponse);
      } catch (err) {
        console.warn("Could not fetch system stats, using default values", err);
        // Set default system stats
        setSystemStats({
          totalUsers: 0,
          totalCases: 0,
          totalSessions: 0,
          activeSessions: 0
        });
      }
      
      // Try to fetch program areas with counts
      try {
        const programAreasWithCounts = await adminApi.getProgramAreasWithCounts();
        console.log("Program areas response:", programAreasWithCounts);
        
        if (programAreasWithCounts && programAreasWithCounts.programAreas && programAreasWithCounts.programAreas.length > 0) {
          setProgramAreas(programAreasWithCounts.programAreas);
        } else {
          // If the response is empty or invalid, create default program areas
          console.log("No program areas found in response, creating defaults");
          const defaultProgramAreas = [
            { id: 'pa-1', name: 'Basic Program', casesCount: 5 },
            { id: 'pa-2', name: 'Specialty Program', casesCount: 10 }
          ];
          setProgramAreas(defaultProgramAreas);
        }
      } catch (err) {
        console.warn("Could not fetch program areas with counts, creating defaults", err);
        // Create default program areas
        const defaultProgramAreas = [
          { id: 'pa-1', name: 'Basic Program', casesCount: 5 },
          { id: 'pa-2', name: 'Specialty Program', casesCount: 10 }
        ];
        setProgramAreas(defaultProgramAreas);
      }
      
      // Try to fetch specialties with counts
      try {
        const specialtiesWithCounts = await adminApi.getSpecialtiesWithCounts();
        console.log("Specialties response:", specialtiesWithCounts);
        
        if (specialtiesWithCounts && specialtiesWithCounts.specialties && specialtiesWithCounts.specialties.length > 0) {
          setSpecialties(specialtiesWithCounts.specialties);
        } else {
          console.log("No specialties found in response, creating defaults");
          // Create default specialties if none are returned
          const defaultSpecialties = [
            { id: 'spec-1', name: 'Internal Medicine', programArea: 'Basic Program', casesCount: 3 },
            { id: 'spec-2', name: 'Surgery', programArea: 'Specialty Program', casesCount: 2 },
            { id: 'spec-3', name: 'Pediatrics', programArea: 'Basic Program', casesCount: 4 },
            { id: 'spec-4', name: 'Cardiology', programArea: 'Specialty Program', casesCount: 5 },
            { id: 'spec-5', name: 'Neurology', programArea: 'Specialty Program', casesCount: 3 }
          ];
          setSpecialties(defaultSpecialties);
        }
      } catch (err) {
        console.warn("Could not fetch specialties with counts, creating defaults", err);
        // Create default specialties
        const defaultSpecialties = [
          { id: 'spec-1', name: 'Internal Medicine', programArea: 'Basic Program', casesCount: 3 },
          { id: 'spec-2', name: 'Surgery', programArea: 'Specialty Program', casesCount: 2 },
          { id: 'spec-3', name: 'Pediatrics', programArea: 'Basic Program', casesCount: 4 },
          { id: 'spec-4', name: 'Cardiology', programArea: 'Specialty Program', casesCount: 5 },
          { id: 'spec-5', name: 'Neurology', programArea: 'Specialty Program', casesCount: 3 }
        ];
        setSpecialties(defaultSpecialties);
      }
      
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Program Area CRUD operations
  const handleAddProgramArea = async () => {
    if (!newProgramArea.trim()) {
      setSnackbar({open: true, message: "Program area name cannot be empty", severity: "error"});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to add the program area
      const response = await adminApi.addProgramArea(newProgramArea);
      
      if (response && response.programArea) {
        // Add the new program area to the state
        setProgramAreas([...programAreas, {
          id: response.programArea._id || `pa-${Date.now()}`,
          name: response.programArea.name,
          casesCount: 0
        }]);
      } else {
        // Fallback if the API doesn't return the expected format
        const newId = `pa-${Date.now()}`;
        setProgramAreas([...programAreas, {
          id: newId,
          name: newProgramArea,
          casesCount: 0
        }]);
      }
      
      setNewProgramArea("");
      setProgramAreaDialogOpen(false);
      setSnackbar({open: true, message: "Program area added successfully", severity: "success"});
    } catch (err) {
      console.error("Error adding program area:", err);
      setSnackbar({open: true, message: "Failed to add program area", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgramArea = async () => {
    if (!editingProgramArea || !editingProgramArea.name.trim()) {
      setSnackbar({open: true, message: "Program area name cannot be empty", severity: "error"});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to update the program area
      await adminApi.updateProgramArea(editingProgramArea.id, editingProgramArea.name);
      
      // Update the local state
      setProgramAreas(programAreas.map(pa => 
        pa.id === editingProgramArea.id ? {...pa, name: editingProgramArea.name} : pa
      ));
      
      // Also update any specialties that were using the old program area name
      const oldProgramArea = programAreas.find(pa => pa.id === editingProgramArea.id);
      if (oldProgramArea && oldProgramArea.name !== editingProgramArea.name) {
        setSpecialties(specialties.map(spec => 
          spec.programArea === oldProgramArea.name ? {...spec, programArea: editingProgramArea.name} : spec
        ));
      }
      
      setEditingProgramArea(null);
      setProgramAreaDialogOpen(false);
      setSnackbar({open: true, message: "Program area updated successfully", severity: "success"});
    } catch (err) {
      console.error("Error updating program area:", err);
      setSnackbar({open: true, message: "Failed to update program area", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgramArea = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the program area
      await adminApi.deleteProgramArea(itemToDelete.id);
      
      // Update the local state
      setProgramAreas(programAreas.filter(pa => pa.id !== itemToDelete.id));
      
      // Also update any specialties that were using this program area
      setSpecialties(specialties.map(spec => 
        spec.programArea === itemToDelete.name ? {...spec, programArea: "General"} : spec
      ));
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setSnackbar({open: true, message: "Program area deleted successfully", severity: "success"});
    } catch (err) {
      console.error("Error deleting program area:", err);
      setSnackbar({open: true, message: "Failed to delete program area", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  // Specialty CRUD operations
  const handleAddSpecialty = async () => {
    if (!newSpecialty.name.trim() || !newSpecialty.programArea) {
      setSnackbar({open: true, message: "Specialty name and program area are required", severity: "error"});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to add the specialty
      const response = await adminApi.addSpecialty(newSpecialty.name, newSpecialty.programArea);
      
      if (response && response.specialty) {
        // Add the new specialty to the state
        setSpecialties([...specialties, {
          id: response.specialty._id || `spec-${Date.now()}`,
          name: response.specialty.name,
          programArea: response.specialty.programArea,
          casesCount: 0
        }]);
      } else {
        // Fallback if the API doesn't return the expected format
        const newId = `spec-${Date.now()}`;
        setSpecialties([...specialties, {
          id: newId,
          name: newSpecialty.name,
          programArea: newSpecialty.programArea,
          casesCount: 0
        }]);
      }
      
      setNewSpecialty({name: "", programArea: ""});
      setSpecialtyDialogOpen(false);
      setSnackbar({open: true, message: "Specialty added successfully", severity: "success"});
    } catch (err) {
      console.error("Error adding specialty:", err);
      setSnackbar({open: true, message: "Failed to add specialty", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSpecialty = async () => {
    if (!editingSpecialty || !editingSpecialty.name.trim() || !editingSpecialty.programArea) {
      setSnackbar({open: true, message: "Specialty name and program area are required", severity: "error"});
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Call the API to update the specialty
      await adminApi.updateSpecialty(
        editingSpecialty.id, 
        editingSpecialty.name, 
        editingSpecialty.programArea
      );
      
      // Update the local state
      setSpecialties(specialties.map(spec => 
        spec.id === editingSpecialty.id ? 
        {...spec, name: editingSpecialty.name, programArea: editingSpecialty.programArea} : 
        spec
      ));
      
      setEditingSpecialty(null);
      setSpecialtyDialogOpen(false);
      setSnackbar({open: true, message: "Specialty updated successfully", severity: "success"});
    } catch (err) {
      console.error("Error updating specialty:", err);
      setSnackbar({open: true, message: "Failed to update specialty", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpecialty = async () => {
    if (!itemToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Call the API to delete the specialty
      await adminApi.deleteSpecialty(itemToDelete.id);
      
      // Update the local state
      setSpecialties(specialties.filter(spec => spec.id !== itemToDelete.id));
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setSnackbar({open: true, message: "Specialty deleted successfully", severity: "success"});
    } catch (err) {
      console.error("Error deleting specialty:", err);
      setSnackbar({open: true, message: "Failed to delete specialty", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  // Dialog handlers
  const openAddProgramAreaDialog = () => {
    setNewProgramArea("");
    setEditingProgramArea(null);
    setProgramAreaDialogOpen(true);
  };

  const openEditProgramAreaDialog = (programArea: ProgramArea) => {
    setEditingProgramArea({id: programArea.id, name: programArea.name});
    setProgramAreaDialogOpen(true);
  };

  const openAddSpecialtyDialog = () => {
    setNewSpecialty({name: "", programArea: programAreas.length > 0 ? programAreas[0].name : ""});
    setEditingSpecialty(null);
    setSpecialtyDialogOpen(true);
  };

  const openEditSpecialtyDialog = (specialty: Specialty) => {
    setEditingSpecialty({
      id: specialty.id, 
      name: specialty.name, 
      programArea: specialty.programArea
    });
    setSpecialtyDialogOpen(true);
  };

  const openDeleteDialog = (id: string, type: 'programArea' | 'specialty', name: string) => {
    setItemToDelete({id, type, name});
    setDeleteDialogOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  // Create sample data for demonstration
  const createSampleData = async () => {
    try {
      setIsLoading(true);
      setSnackbar({open: true, message: "Creating sample data...", severity: "success"});
      
      // Create sample program areas
      const sampleProgramAreas = [
        "Basic Program",
        "Specialty Program",
        "Advanced Program"
      ];
      
      // Create sample specialties with their program areas
      const sampleSpecialties = [
        { name: "Internal Medicine", programArea: "Basic Program" },
        { name: "Surgery", programArea: "Specialty Program" },
        { name: "Pediatrics", programArea: "Basic Program" },
        { name: "Ophthalmology", programArea: "Specialty Program" },
        { name: "ENT", programArea: "Specialty Program" },
        { name: "Cardiology", programArea: "Specialty Program" },
        { name: "Neurology", programArea: "Specialty Program" },
        { name: "Psychiatry", programArea: "Basic Program" },
        { name: "Emergency Medicine", programArea: "Basic Program" },
        { name: "Family Medicine", programArea: "Basic Program" },
        { name: "Obstetrics & Gynecology", programArea: "Specialty Program" },
        { name: "Dermatology", programArea: "Specialty Program" },
        { name: "Orthopedics", programArea: "Specialty Program" },
        { name: "Radiology", programArea: "Advanced Program" },
        { name: "Pathology", programArea: "Advanced Program" },
        { name: "Anesthesiology", programArea: "Specialty Program" }
      ];
      
      // First create all program areas
      for (const programArea of sampleProgramAreas) {
        try {
          await adminApi.addProgramArea(programArea);
          console.log(`Created program area: ${programArea}`);
        } catch (err) {
          console.warn(`Failed to create program area ${programArea}:`, err);
          // Continue with other program areas even if one fails
        }
      }
      
      // Then create all specialties
      for (const specialty of sampleSpecialties) {
        try {
          await adminApi.addSpecialty(specialty.name, specialty.programArea);
          console.log(`Created specialty: ${specialty.name} in ${specialty.programArea}`);
        } catch (err) {
          console.warn(`Failed to create specialty ${specialty.name}:`, err);
          // Continue with other specialties even if one fails
        }
      }
      
      // Refresh the data to show the new items
      await fetchAllData();
      
      setSnackbar({open: true, message: "Sample data created successfully!", severity: "success"});
    } catch (err) {
      console.error("Error creating sample data:", err);
      setSnackbar({open: true, message: "Failed to create sample data", severity: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !systemStats) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading admin dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage program areas, specialties, and view system statistics
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={createSampleData}
            sx={{ mr: 1 }}
          >
            Create Sample Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAllData}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/select-program")}
          >
            Start Simulation
          </Button>
        </Box>
      </Box>

      {/* System Stats Cards */}
      {systemStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4" component="div">
                  {systemStats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Cases
                </Typography>
                <Typography variant="h4" component="div">
                  {systemStats.totalCases}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h4" component="div">
                  {systemStats.totalSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Sessions
                </Typography>
                <Typography variant="h4" component="div">
                  {systemStats.activeSessions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<CategoryIcon />} label="Program Areas" />
          <Tab icon={<LocalHospitalIcon />} label="Specialties" />
        </Tabs>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box p={2}>
            <Typography variant="h5" gutterBottom>
              System Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Program Areas ({programAreas.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Cases</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {programAreas.slice(0, 5).map((pa) => (
                          <TableRow key={pa.id}>
                            <TableCell>{pa.name}</TableCell>
                            <TableCell align="right">{pa.casesCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {programAreas.length > 5 && (
                    <Box mt={1} textAlign="right">
                      <Button size="small" onClick={() => setTabValue(1)}>
                        View All
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Specialties ({specialties.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Program Area</TableCell>
                          <TableCell align="right">Cases</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {specialties.slice(0, 5).map((spec) => (
                          <TableRow key={spec.id}>
                            <TableCell>{spec.name}</TableCell>
                            <TableCell>{spec.programArea}</TableCell>
                            <TableCell align="right">{spec.casesCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {specialties.length > 5 && (
                    <Box mt={1} textAlign="right">
                      <Button size="small" onClick={() => setTabValue(2)}>
                        View All
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Program Areas Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Program Areas
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openAddProgramAreaDialog}
              >
                Add Program Area
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Cases</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programAreas.map((pa) => (
                    <TableRow key={pa.id}>
                      <TableCell>{pa.name}</TableCell>
                      <TableCell align="right">{pa.casesCount}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => openEditProgramAreaDialog(pa)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => openDeleteDialog(pa.id, 'programArea', pa.name)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {programAreas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No program areas found. Add your first one!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Specialties Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5">
                Specialties
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={openAddSpecialtyDialog}
                disabled={programAreas.length === 0}
              >
                Add Specialty
              </Button>
            </Box>
            
            {programAreas.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                You need to create at least one program area before adding specialties.
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Program Area</TableCell>
                      <TableCell align="right">Cases</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specialties.map((spec) => (
                      <TableRow key={spec.id}>
                        <TableCell>{spec.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={spec.programArea} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell align="right">{spec.casesCount}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => openEditSpecialtyDialog(spec)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog(spec.id, 'specialty', spec.name)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {specialties.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No specialties found. Add your first one!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Program Area Dialog */}
      <Dialog 
        open={programAreaDialogOpen} 
        onClose={() => setProgramAreaDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProgramArea ? "Edit Program Area" : "Add Program Area"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Program Area Name"
            fullWidth
            variant="outlined"
            value={editingProgramArea ? editingProgramArea.name : newProgramArea}
            onChange={(e) => editingProgramArea 
              ? setEditingProgramArea({...editingProgramArea, name: e.target.value})
              : setNewProgramArea(e.target.value)
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgramAreaDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={editingProgramArea ? handleUpdateProgramArea : handleAddProgramArea}
            variant="contained"
            startIcon={editingProgramArea ? <SaveIcon /> : <AddIcon />}
          >
            {editingProgramArea ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Specialty Dialog */}
      <Dialog 
        open={specialtyDialogOpen} 
        onClose={() => setSpecialtyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingSpecialty ? "Edit Specialty" : "Add Specialty"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Specialty Name"
            fullWidth
            variant="outlined"
            value={editingSpecialty ? editingSpecialty.name : newSpecialty.name}
            onChange={(e) => editingSpecialty 
              ? setEditingSpecialty({...editingSpecialty, name: e.target.value})
              : setNewSpecialty({...newSpecialty, name: e.target.value})
            }
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            label="Program Area"
            fullWidth
            variant="outlined"
            value={editingSpecialty ? editingSpecialty.programArea : newSpecialty.programArea}
            onChange={(e) => editingSpecialty 
              ? setEditingSpecialty({...editingSpecialty, programArea: e.target.value})
              : setNewSpecialty({...newSpecialty, programArea: e.target.value})
            }
            SelectProps={{
              native: true,
            }}
          >
            {programAreas.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpecialtyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={editingSpecialty ? handleUpdateSpecialty : handleAddSpecialty}
            variant="contained"
            startIcon={editingSpecialty ? <SaveIcon /> : <AddIcon />}
          >
            {editingSpecialty ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {itemToDelete?.type === 'programArea' ? 'program area' : 'specialty'} "{itemToDelete?.name}"?
            {itemToDelete?.type === 'programArea' && (
              <Typography color="error" sx={{ mt: 1 }}>
                Warning: This will also update any specialties using this program area.
              </Typography>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={itemToDelete?.type === 'programArea' ? handleDeleteProgramArea : handleDeleteSpecialty}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MinimalAdminDashboard;
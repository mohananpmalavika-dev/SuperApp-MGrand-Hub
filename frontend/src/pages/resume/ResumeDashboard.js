import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  FileCopy,
  GetApp,
  Share,
  MoreVert,
  Description,
} from '@mui/icons-material';
import axios from 'axios';
import './ResumeDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function ResumeDashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchResumes();
    fetchStatistics();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/resume/resumes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setResumes(response.data.data.resumes);
      }
    } catch (err) {
      setError('Failed to load resumes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/resume/resumes/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleMenuOpen = (event, resume) => {
    setAnchorEl(event.currentTarget);
    setSelectedResume(resume);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (resume) => {
    navigate(`/resume/builder/${resume._id}`);
    handleMenuClose();
  };

  const handleDuplicate = async (resume) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/resume/resumes/${resume._id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchResumes();
      handleMenuClose();
    } catch (err) {
      setError('Failed to duplicate resume');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/resume/resumes/${selectedResume._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchResumes();
      setDeleteDialog(false);
      handleMenuClose();
    } catch (err) {
      setError('Failed to delete resume');
    }
  };

  const handleExportPDF = async (resume) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/resume/resumes/${resume._id}/export/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      handleMenuClose();
    } catch (err) {
      setError('Failed to export PDF');
    }
  };

  const handleExportDOCX = async (resume) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/resume/resumes/${resume._id}/export/docx`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.title}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      handleMenuClose();
    } catch (err) {
      setError('Failed to export DOCX');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <div className="resume-dashboard">
      <AppBar position="sticky" sx={{ bgcolor: '#2c3e50' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📝 Resume Builder
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={() => navigate('/resume/builder/new')}
          >
            New Resume
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#3498db', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Resumes</Typography>
                  <Typography variant="h3">{stats.total}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#2ecc71', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Published</Typography>
                  <Typography variant="h3">{stats.byStatus.published}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#f39c12', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Exports</Typography>
                  <Typography variant="h3">{stats.totalExports}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: '#9b59b6', color: 'white' }}>
                <CardContent>
                  <Typography variant="h6">Total Views</Typography>
                  <Typography variant="h3">{stats.totalViews}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Resumes Grid */}
        <Typography variant="h5" gutterBottom>
          My Resumes
        </Typography>

        {resumes.length === 0 ? (
          <Card sx={{ p: 6, textAlign: 'center' }}>
            <Description sx={{ fontSize: 64, color: '#bdc3c7', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No resumes yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first professional resume
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/resume/builder/new')}
            >
              Create Resume
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {resumes.map((resume) => (
              <Grid item xs={12} sm={6} md={4} key={resume._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {resume.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, resume)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resume.personalInfo.firstName} {resume.personalInfo.lastName}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={resume.status}
                        size="small"
                        color={getStatusColor(resume.status)}
                      />
                      <Chip label={resume.template} size="small" variant="outlined" />
                      {resume.exportCount > 0 && (
                        <Chip label={`${resume.exportCount} exports`} size="small" />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(resume)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<GetApp />}
                      onClick={() => handleExportPDF(resume)}
                    >
                      PDF
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleEdit(selectedResume)}>
            <Edit sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={() => handleDuplicate(selectedResume)}>
            <FileCopy sx={{ mr: 1 }} /> Duplicate
          </MenuItem>
          <MenuItem onClick={() => handleExportPDF(selectedResume)}>
            <GetApp sx={{ mr: 1 }} /> Export PDF
          </MenuItem>
          <MenuItem onClick={() => handleExportDOCX(selectedResume)}>
            <GetApp sx={{ mr: 1 }} /> Export DOCX
          </MenuItem>
          <MenuItem onClick={() => setDeleteDialog(true)}>
            <Delete sx={{ mr: 1, color: 'error.main' }} /> Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Resume?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedResume?.title}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}

export default ResumeDashboard;

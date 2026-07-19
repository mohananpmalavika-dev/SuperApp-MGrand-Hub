import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  AudioFile,
  VideoFile,
  Download,
  Preview,
  Delete,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Refresh,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008';

const PDFContentGenerator = () => {
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [notesPreview, setNotesPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Poll active jobs
  useEffect(() => {
    const activeJobs = jobs.filter((job) => job.status === 'processing');
    if (activeJobs.length === 0) return;

    const interval = setInterval(() => {
      activeJobs.forEach((job) => {
        pollJobStatus(job.id);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/content-generation/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/content-generation/status/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setJobs((prevJobs) =>
          prevJobs.map((job) => (job.id === jobId ? response.data.status : job))
        );
      }
    } catch (err) {
      console.error('Failed to poll status:', err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        handleUpload(file);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        handleUpload(file);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/content-generation/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Fetch updated jobs list
        await fetchJobs();
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (jobId, type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/content-generation/download/${jobId}/${type}`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = type === 'notes' ? 'json' : type === 'audio' ? 'mp3' : 'mp4';
      link.setAttribute('download', `content_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(`Failed to download ${type}`);
    }
  };

  const handlePreviewNotes = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/content-generation/preview/${jobId}/notes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setNotesPreview(response.data.notes);
        setPreviewOpen(true);
      }
    } catch (err) {
      setError('Failed to load notes preview');
    }
  };

  const handleDelete = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/content-generation/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    } catch (err) {
      setError('Failed to delete content');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <Schedule color="primary" />;
      default:
        return <Schedule />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        📚 PDF Content Generator
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload a PDF document to automatically generate comprehensive study notes, audio narration,
        and engaging video lessons powered by AI.
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 4,
          mb: 4,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="pdf-upload-input"
          disabled={uploading}
        />
        <label htmlFor="pdf-upload-input" style={{ width: '100%', cursor: 'pointer' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CloudUpload sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h6">
              {dragActive
                ? 'Drop the PDF here'
                : selectedFile
                ? selectedFile.name
                : 'Drag & drop a PDF file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select a file (max 50MB)
            </Typography>
            {!uploading && (
              <Button variant="contained" component="span">
                Select PDF
              </Button>
            )}
            {uploading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={24} />
                <Typography>Uploading and processing...</Typography>
              </Box>
            )}
          </Box>
        </label>
      </Paper>

      {/* Jobs List */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Generated Content</Typography>
        <IconButton onClick={fetchJobs} title="Refresh">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {jobs.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No content generated yet. Upload a PDF to get started!
            </Alert>
          </Grid>
        ) : (
          jobs
            .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
            .map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getStatusIcon(job.status)}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {job.filename}
                      </Typography>
                      <Chip
                        label={job.status}
                        color={
                          job.status === 'completed'
                            ? 'success'
                            : job.status === 'failed'
                            ? 'error'
                            : 'primary'
                        }
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Started: {formatDate(job.startedAt)}
                    </Typography>

                    {job.completedAt && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Completed: {formatDate(job.completedAt)}
                      </Typography>
                    )}

                    {job.status === 'processing' && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <LinearProgress />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          {job.currentStep || 'Processing...'}
                        </Typography>
                      </Box>
                    )}

                    {job.error && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {job.error}
                      </Alert>
                    )}

                    {job.status === 'completed' && job.result && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {job.result.metadata.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          📄 {job.result.metadata.sections} sections generated
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                          <Button
                            startIcon={<Preview />}
                            size="small"
                            variant="outlined"
                            onClick={() => handlePreviewNotes(job.id)}
                          >
                            Preview Notes
                          </Button>
                          <Button
                            startIcon={<Description />}
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(job.id, 'notes')}
                          >
                            Download Notes
                          </Button>
                          <Button
                            startIcon={<AudioFile />}
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(job.id, 'audio')}
                          >
                            Download Audio
                          </Button>
                          <Button
                            startIcon={<VideoFile />}
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(job.id, 'video')}
                          >
                            Download Video
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(job.id)}
                            sx={{ ml: 'auto' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
        )}
      </Grid>

      {/* Notes Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {notesPreview?.title}
          <Typography variant="caption" display="block" color="text.secondary">
            Generated: {notesPreview && formatDate(notesPreview.generatedAt)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {notesPreview?.sections.map((section, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                {section.title}
              </Typography>

              {section.summary && (
                <Typography variant="body1" paragraph>
                  {section.summary}
                </Typography>
              )}

              {section.keyPoints && section.keyPoints.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🔑 Key Points:
                  </Typography>
                  <List dense>
                    {section.keyPoints.map((point, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={`• ${point}`} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {section.definitions && section.definitions.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📖 Definitions:
                  </Typography>
                  {section.definitions.map((def, i) => (
                    <Typography variant="body2" key={i} sx={{ mb: 1 }}>
                      <strong>{def.term}:</strong> {def.definition}
                    </Typography>
                  ))}
                </Box>
              )}

              {section.formulas && section.formulas.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📐 Formulas:
                  </Typography>
                  {section.formulas.map((formula, i) => (
                    <Typography
                      variant="body2"
                      key={i}
                      sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, mb: 1 }}
                    >
                      {formula}
                    </Typography>
                  ))}
                </Box>
              )}

              {section.examples && section.examples.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    💡 Examples:
                  </Typography>
                  {section.examples.map((example, i) => (
                    <Typography variant="body2" key={i} sx={{ mb: 1 }}>
                      {i + 1}. {example}
                    </Typography>
                  ))}
                </Box>
              )}

              {index < notesPreview.sections.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PDFContentGenerator;

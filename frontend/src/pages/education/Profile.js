import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Person, Edit, Save } from '@mui/icons-material';

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Student Name',
    email: 'student@example.com',
    phone: '+91 1234567890',
    targetExam: 'CA Foundation',
    examDate: '2024-11-01',
    studyGoal: 4,
    notifications: true,
  });

  const handleSave = () => {
    setEditing(false);
    // Save to backend
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                <Person sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profile.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.email}
              </Typography>
              <Button
                variant="outlined"
                startIcon={editing ? <Save /> : <Edit />}
                onClick={() => (editing ? handleSave() : setEditing(true))}
                sx={{ mt: 2 }}
              >
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editing}>
                    <InputLabel>Target Exam</InputLabel>
                    <Select
                      value={profile.targetExam}
                      label="Target Exam"
                      onChange={(e) => setProfile({ ...profile, targetExam: e.target.value })}
                    >
                      <MenuItem value="CA Foundation">CA Foundation</MenuItem>
                      <MenuItem value="CA Intermediate">CA Intermediate</MenuItem>
                      <MenuItem value="IAS Prelims">IAS Prelims</MenuItem>
                      <MenuItem value="JEE Main">JEE Main</MenuItem>
                      <MenuItem value="Class 10">Class 10</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Exam Date"
                    type="date"
                    value={profile.examDate}
                    onChange={(e) => setProfile({ ...profile, examDate: e.target.value })}
                    disabled={!editing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Daily Study Goal (hours)"
                    type="number"
                    value={profile.studyGoal}
                    onChange={(e) => setProfile({ ...profile, studyGoal: e.target.value })}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Box mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.notifications}
                      onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                      disabled={!editing}
                    />
                  }
                  label="Email Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

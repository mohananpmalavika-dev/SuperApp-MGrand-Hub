import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  MenuBook as BookIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

const StudyPlan = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    course: '',
    type: 'lesson',
    duration: 30,
    priority: 'medium',
    date: new Date().toISOString().split('T')[0],
  });

  const [weeklyPlan, setWeeklyPlan] = useState([
    {
      id: 1,
      day: 'Monday',
      date: '2026-07-20',
      tasks: [
        { id: 1, title: 'Complete Accounting Basics - Lesson 5', course: 'CA Foundation', type: 'lesson', duration: 45, completed: true, priority: 'high' },
        { id: 2, title: 'Practice Questions Set 3', course: 'CA Foundation', type: 'practice', duration: 30, completed: true, priority: 'medium' },
        { id: 3, title: 'Watch Video: Journal Entries', course: 'CA Foundation', type: 'video', duration: 20, completed: false, priority: 'medium' },
      ],
    },
    {
      id: 2,
      day: 'Tuesday',
      date: '2026-07-21',
      tasks: [
        { id: 4, title: 'Business Laws - Chapter 2', course: 'CA Foundation', type: 'lesson', duration: 60, completed: true, priority: 'high' },
        { id: 5, title: 'Mock Test 1', course: 'CA Foundation', type: 'test', duration: 90, completed: false, priority: 'high' },
      ],
    },
    {
      id: 3,
      day: 'Wednesday',
      date: '2026-07-22',
      tasks: [
        { id: 6, title: 'Mathematics - Algebra Revision', course: 'CA Foundation', type: 'lesson', duration: 45, completed: false, priority: 'medium' },
        { id: 7, title: 'AI Tutor Session - Doubts Clearing', course: 'CA Foundation', type: 'tutor', duration: 30, completed: false, priority: 'low' },
      ],
    },
    {
      id: 4,
      day: 'Thursday',
      date: '2026-07-23',
      tasks: [
        { id: 8, title: 'Economics - Demand & Supply', course: 'CA Foundation', type: 'lesson', duration: 50, completed: false, priority: 'high' },
        { id: 9, title: 'Practice Problems Set 5', course: 'CA Foundation', type: 'practice', duration: 40, completed: false, priority: 'medium' },
      ],
    },
    {
      id: 5,
      day: 'Friday',
      date: '2026-07-24',
      tasks: [
        { id: 10, title: 'Weekly Revision - All Topics', course: 'CA Foundation', type: 'revision', duration: 60, completed: false, priority: 'high' },
      ],
    },
    {
      id: 6,
      day: 'Saturday',
      date: '2026-07-25',
      tasks: [
        { id: 11, title: 'Full Length Mock Test', course: 'CA Foundation', type: 'test', duration: 180, completed: false, priority: 'high' },
      ],
    },
    {
      id: 7,
      day: 'Sunday',
      date: '2026-07-26',
      tasks: [
        { id: 12, title: 'Review Test Performance', course: 'CA Foundation', type: 'analysis', duration: 45, completed: false, priority: 'medium' },
        { id: 13, title: 'Plan Next Week', course: 'CA Foundation', type: 'planning', duration: 15, completed: false, priority: 'low' },
      ],
    },
  ]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setNewTask(task);
    } else {
      setEditingTask(null);
      setNewTask({
        title: '',
        course: '',
        type: 'lesson',
        duration: 30,
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleToggleTask = (dayId, taskId) => {
    setWeeklyPlan(weeklyPlan.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          tasks: day.tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        };
      }
      return day;
    }));
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'lesson': return <SchoolIcon />;
      case 'practice': return <AssignmentIcon />;
      case 'test': return <AssignmentIcon color="error" />;
      case 'video': return <BookIcon />;
      case 'tutor': return <SchoolIcon color="primary" />;
      case 'revision': return <BookIcon color="warning" />;
      default: return <SchoolIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const calculateDayProgress = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
  };

  const calculateTotalMinutes = (tasks) => {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getTodayIndex = () => {
    const today = new Date().toISOString().split('T')[0];
    return weeklyPlan.findIndex(day => day.date === today);
  };

  const todayIndex = getTodayIndex();

  // Calculate overall stats
  const allTasks = weeklyPlan.flatMap(day => day.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;
  const overallProgress = (completedTasks / totalTasks) * 100;
  const totalStudyTime = calculateTotalMinutes(allTasks);
  const completedStudyTime = calculateTotalMinutes(allTasks.filter(t => t.completed));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalendarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Study Plan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your personalized weekly schedule
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>

      {/* Overall Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {completedTasks}/{totalTasks}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={overallProgress} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {overallProgress.toFixed(0)}% Complete
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimerIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Study Time
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatDuration(completedStudyTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                of {formatDuration(totalStudyTime)} planned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                7 Days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {weeklyPlan.length} days planned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrophyIcon color="error" />
                <Typography variant="body2" color="text.secondary">
                  Streak
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                7 Days
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Keep it going! 🔥
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Week View" />
          <Tab label="Today" />
        </Tabs>
      </Paper>

      {/* Week View */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {weeklyPlan.map((day, index) => {
            const progress = calculateDayProgress(day.tasks);
            const isToday = index === todayIndex;
            const totalMinutes = calculateTotalMinutes(day.tasks);

            return (
              <Grid item xs={12} key={day.id}>
                <Card 
                  sx={{ 
                    border: isToday ? 2 : 0,
                    borderColor: 'primary.main',
                    bgcolor: isToday ? 'action.hover' : 'background.paper'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: isToday ? 'primary.main' : 'action.selected',
                            width: 48,
                            height: 48
                          }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            {day.day.substring(0, 1)}
                          </Typography>
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {day.day}
                            {isToday && <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(day.date).toLocaleDateString('en-IN', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })} • {formatDuration(totalMinutes)} planned
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                        <Typography variant="body2" color="text.secondary">
                          {day.tasks.filter(t => t.completed).length}/{day.tasks.length} completed
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Box>

                    <List dense>
                      {day.tasks.map((task) => (
                        <ListItem
                          key={task.id}
                          sx={{
                            bgcolor: task.completed ? 'action.hover' : 'transparent',
                            borderRadius: 1,
                            mb: 0.5,
                            '&:hover': {
                              bgcolor: 'action.selected',
                            },
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={task.completed}
                              onChange={() => handleToggleTask(day.id, task.id)}
                              icon={<UncheckedIcon />}
                              checkedIcon={<CheckCircleIcon />}
                            />
                          </ListItemIcon>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {getTaskIcon(task.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  color: task.completed ? 'text.secondary' : 'text.primary'
                                }}
                              >
                                {task.title}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip 
                                  label={task.type} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Chip 
                                  label={formatDuration(task.duration)} 
                                  size="small" 
                                  icon={<TimerIcon />}
                                  variant="outlined"
                                />
                                <Chip 
                                  label={task.priority} 
                                  size="small" 
                                  color={getPriorityColor(task.priority)}
                                />
                              </Box>
                            }
                          />
                          <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Today View */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          {todayIndex === -1 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No tasks scheduled for today
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Today's Schedule - {weeklyPlan[todayIndex].day}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {formatDuration(calculateTotalMinutes(weeklyPlan[todayIndex].tasks))} of study time planned
              </Typography>
              <List>
                {weeklyPlan[todayIndex].tasks.map((task, index) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      bgcolor: task.completed ? 'action.hover' : 'transparent',
                      borderRadius: 2,
                      mb: 2,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={task.completed}
                        onChange={() => handleToggleTask(weeklyPlan[todayIndex].id, task.id)}
                        icon={<UncheckedIcon />}
                        checkedIcon={<CheckCircleIcon />}
                      />
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getTaskIcon(task.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={task.course} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={task.type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={formatDuration(task.duration)} 
                            size="small" 
                            icon={<TimerIcon />}
                            variant="outlined"
                          />
                          <Chip 
                            label={task.priority} 
                            size="small" 
                            color={getPriorityColor(task.priority)}
                          />
                        </Box>
                      }
                    />
                    <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                      <EditIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Course"
              fullWidth
              select
              value={newTask.course}
              onChange={(e) => setNewTask({ ...newTask, course: e.target.value })}
            >
              <MenuItem value="CA Foundation">CA Foundation</MenuItem>
              <MenuItem value="CA Intermediate">CA Intermediate</MenuItem>
              <MenuItem value="JEE Main">JEE Main</MenuItem>
              <MenuItem value="CBSE Class 10">CBSE Class 10</MenuItem>
            </TextField>
            <TextField
              label="Task Type"
              fullWidth
              select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            >
              <MenuItem value="lesson">Lesson</MenuItem>
              <MenuItem value="practice">Practice</MenuItem>
              <MenuItem value="test">Test</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="tutor">AI Tutor</MenuItem>
              <MenuItem value="revision">Revision</MenuItem>
            </TextField>
            <TextField
              label="Duration (minutes)"
              fullWidth
              type="number"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
            />
            <TextField
              label="Priority"
              fullWidth
              select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <TextField
              label="Date"
              fullWidth
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {editingTask ? 'Update' : 'Add'} Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudyPlan;

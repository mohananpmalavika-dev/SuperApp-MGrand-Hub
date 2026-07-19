import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EducationLayout from '../../components/education/EducationLayout';
import EducationDashboard from './EducationDashboard';
import CourseBrowser from './CourseBrowser';
import CourseDetail from './CourseDetail';
import LessonViewer from './LessonViewer';
import PracticeQuestions from './PracticeQuestions';
import TestInterface from './TestInterface';
import TestResults from './TestResults';
import AITutorChat from './AITutorChat';
import ProgressAnalytics from './ProgressAnalytics';
import Profile from './Profile';
import Notifications from './Notifications';
import StudyPlan from './StudyPlan';
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionManagement from './SubscriptionManagement';
import CAFoundationCourses from './CAFoundationCourses';
import CAFoundationCourse from './CAFoundationCourse';
import CAFoundationLesson from './CAFoundationLesson';

const EducationRoutes = () => {
  return (
    <EducationLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/education/dashboard" replace />} />
        <Route path="/dashboard" element={<EducationDashboard />} />
        <Route path="/courses" element={<CourseBrowser />} />
        <Route path="/ca-foundation" element={<CAFoundationCourses />} />
        <Route path="/ca-foundation/:courseId" element={<CAFoundationCourse />} />
        <Route path="/ca-foundation/:courseId/lesson/:lessonIndex" element={<CAFoundationLesson />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/lesson/:lessonId" element={<LessonViewer />} />
        <Route path="/practice" element={<PracticeQuestions />} />
        <Route path="/tests" element={<TestInterface />} />
        <Route path="/test/:testId/results" element={<TestResults />} />
        <Route path="/tutor" element={<AITutorChat />} />
        <Route path="/progress" element={<ProgressAnalytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/study-plan" element={<StudyPlan />} />
        <Route path="/subscription-plans" element={<SubscriptionPlans />} />
        <Route path="/subscription" element={<SubscriptionManagement />} />
      </Routes>
    </EducationLayout>
  );
};

export default EducationRoutes;

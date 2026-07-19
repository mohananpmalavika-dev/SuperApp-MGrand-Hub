import axios from 'axios';

const configuredUrl = process.env.REACT_APP_EDUCATION_SERVICE_URL || 'http://localhost:3013';
const educationApiUrl = configuredUrl.endsWith('/api/education')
  ? configuredUrl
  : `${configuredUrl.replace(/\/$/, '')}/api/education`;

const unwrap = (response) => response.data?.data ?? response.data;

export const getCAFoundationCourses = async () => {
  const response = await axios.get(`${educationApiUrl}/ca/courses`);
  return unwrap(response);
};

export const getCAFoundationCourse = async (courseId) => {
  const response = await axios.get(`${educationApiUrl}/ca/courses/${courseId}`);
  return unwrap(response);
};

export const getCAFoundationLesson = async (courseId, lessonIndex) => {
  const response = await axios.get(
    `${educationApiUrl}/ca/courses/${courseId}/lessons/${lessonIndex}`
  );
  return unwrap(response);
};

export { educationApiUrl };

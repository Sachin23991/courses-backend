const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Helper function to fetch courses from RapidAPI ---
async function fetchCourses(page = 0) {
  try {
    console.log(`Attempting to fetch courses, page: ${page}`);
    const options = {
      method: 'GET',
      url: 'https://paid-udemy-course-for-free.p.rapidapi.com/',
      params: { page },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'paid-udemy-course-for-free.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const courses = response.data || [];

    if (courses.length > 0) {
      console.log(`✅ Found ${courses.length} courses`);
      return courses;
    }

    console.log(`🟡 No courses found`);
    return [];
  } catch (error) {
    console.error(`🔴 Failed to fetch courses:`, error.message);
    return [];
  }
}

// --- Root Route for testing ---
app.get('/', (req, res) => {
  res.send('🚀 Udemy Free Courses API backend is running on Railway');
});

// --- Main API Endpoint ---
app.get('/api/courses', async (req, res) => {
  const page = req.query.page || 0;
  const courses = await fetchCourses(page);
  res.json(courses);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Fetch all free courses from RapidAPI ---
async function fetchAllCourses(pagination = 1) {
  try {
    console.log(`Fetching free courses, page: ${pagination}`);
    const options = {
      method: 'GET',
      url: 'https://udemy-free-courses.p.rapidapi.com/courses/',
      params: { id: 288, pagination },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'udemy-free-courses.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const courses = response.data?.courses || []; // array of course objects
    console.log(`✅ Found ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error('🔴 Failed to fetch courses:', error.message);
    return [];
  }
}

// --- Root route ---
app.get('/', (req, res) => {
  res.send('🚀 Udemy Free Courses API backend is running!');
});

// --- Main API Endpoint with search ---
app.get('/api/courses', async (req, res) => {
  const searchQuery = req.query.search?.trim().toLowerCase() || '';
  const page = req.query.page || 1;

  // Fetch all courses from the API
  const allCourses = await fetchAllCourses(page);

  if (allCourses.length === 0) {
    return res.json({ message: 'No free courses available at the moment.' });
  }

  // If user provided a search query, filter courses locally
  let filteredCourses = allCourses;
  if (searchQuery) {
    filteredCourses = allCourses.filter(course =>
      course.title.toLowerCase().includes(searchQuery)
    );
  }

  if (filteredCourses.length === 0) {
    return res.json({
      message: `No free courses found for "${searchQuery}". You can try paid courses.`
    });
  }

  // Return filtered courses (with images)
  res.json(filteredCourses);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

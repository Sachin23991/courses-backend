const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Helper function to fetch courses for a given query ---
async function fetchCoursesForQuery(query) {
  try {
    console.log(`Attempting to fetch courses for query: "${query}"`);
    const options = {
      method: 'GET',
      url: 'https://udemy-api2.p.rapidapi.com/course/search/', // ✅ replace with your confirmed working endpoint
      params: { search: query },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'paid-udemy-course-for-free.p.rapidapi.com' // ✅ match the host from RapidAPI
      }
    };

    const response = await axios.request(options);
    const courses = response.data?.courses || response.data?.results || [];

    if (courses.length > 0) {
      console.log(`✅ Found ${courses.length} courses for "${query}"`);
      return courses;
    }

    console.log(`🟡 No courses found for "${query}"`);
    return [];
  } catch (error) {
    console.error(`🔴 Failed to fetch for query "${query}":`, error.message);
    return []; // Return empty array instead of throwing
  }
}

// --- Root Route for Testing ---
app.get("/", (req, res) => {
  res.send("🚀 Udemy Courses backend is running on Railway");
});

// --- Main API Endpoint ---
app.get('/api/courses', async (req, res) => {
  const userInterestsQuery = req.query.interests;

  // Case 1: User has interests
  if (userInterestsQuery && userInterestsQuery.trim() !== "") {
    const firstInterest = userInterestsQuery.split(',')[0].trim();
    const recommendedCourses = await fetchCoursesForQuery(firstInterest);

    if (recommendedCourses.length > 0) {
      return res.json(recommendedCourses);
    }

    console.log(`Fallback: No results for "${firstInterest}", trying defaults.`);
  }

  // Case 2: No interests or no results → try defaults
  console.log("Entering default course recommendation logic...");
  const defaultTopics = ['Python', 'React', 'JavaScript', 'Data Science', 'AWS'];

  for (const topic of defaultTopics) {
    const defaultCourses = await fetchCoursesForQuery(topic);
    if (defaultCourses.length > 0) {
      return res.json(defaultCourses);
    }
  }

  // Final fallback → return empty array (not 404)
  console.log("🔴 No courses found for any topic.");
  res.json([]); 
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

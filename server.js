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
      url: 'https://udemy-paid-courses-for-free-api.p.rapidapi.com/rapidapi/courses/search',
      params: { page: '1', page_size: '20', query },
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'udemy-paid-courses-for-free-api.p.rapidapi.com'
      }
    };
    const response = await axios.request(options);
    const courses = response.data && response.data.results ? response.data.results : [];
    if (courses.length > 0) {
      console.log(`✅ Found ${courses.length} courses for "${query}"`);
      return courses;
    }
    console.log(`🟡 No courses found for "${query}"`);
    return [];
  } catch (error) {
    console.error(`🔴 Failed to fetch for query "${query}":`, error.message);
    return []; // Return empty array on error to allow trying the next topic
  }
}

// --- Root Route for Testing ---
app.get("/", (req, res) => {
  res.send("🚀 Udemy Courses backend (Final Version) is running on Railway");
});

// --- Main API Endpoint ---
app.get('/api/courses', async (req, res) => {
  const userInterestsQuery = req.query.interests;

  // --- Case 1: User has interests from the quiz ---
  if (userInterestsQuery) {
    const firstInterest = userInterestsQuery.split(',')[0].trim();
    const recommendedCourses = await fetchCoursesForQuery(firstInterest);
    if (recommendedCourses.length > 0) {
      return res.json(recommendedCourses);
    }
    // Fallback if their primary interest returns no results
    console.log(`Fallback: No results for interest "${firstInterest}", trying default topics.`);
  }

  // --- Case 2: User has no interests OR their interest had no results (Default Logic) ---
  console.log("Entering default course recommendation logic...");
  const defaultTopics = ['Python', 'React', 'JavaScript', 'Data Science', 'Project Management'];
  for (const topic of defaultTopics) {
    const defaultCourses = await fetchCoursesForQuery(topic);
    if (defaultCourses.length > 0) {
      // As soon as we find courses, send them and stop.
      return res.json(defaultCourses);
    }
  }

  // --- Final Fallback (Highly Unlikely) ---
  console.log("🔴 Could not find courses for any default topics.");
  res.status(404).json([]); // Send empty array if no courses are found for any topic
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

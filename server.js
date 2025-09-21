const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Allow requests from any origin
app.use(express.json());

// --- Helper Functions ---
/**
 * Shuffles an array in place and returns a slice of it.
 * @param {Array} array The array to shuffle.
 * @param {number} numItems The number of items to return.
 * @returns {Array} A new array with a specified number of shuffled items.
 */
const getShuffledSlice = (array, numItems) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numItems);
};

// --- Root Route for Testing ---
app.get("/", (req, res) => {
  res.send("🚀 Courses backend is running on Railway");
});

// --- API Endpoint ---
app.get('/api/courses', async (req, res) => {
  const userInterestsQuery = req.query.interests;

  // Check if RapidAPI key is set
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(500).json({ message: "Missing RapidAPI key in environment variables." });
  }

  const options = {
    method: 'GET',
    url: 'https://collection-for-coursera-courses.p.rapidapi.com/rapidapi/course/get_institution.php',
    headers: {
      'x-rapidapi-host': 'collection-for-coursera-courses.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    },
  };

  try {
    // 1. Fetch all courses from the external API
    const response = await axios.request(options);
    const allCourses = response.data;

    if (!Array.isArray(allCourses)) {
      throw new Error("External API did not return a valid array of courses.");
    }

    let recommendedCourses = [];

    if (userInterestsQuery) {
      console.log(`Filtering courses for interests: ${userInterestsQuery}`);
      const interestSet = new Set(userInterestsQuery.toLowerCase().split(','));

      recommendedCourses = allCourses.filter(course =>
        course.skills && course.skills.some(skill => interestSet.has(skill.toLowerCase()))
      );

      // Fallback: return shuffled courses if no matches
      if (recommendedCourses.length === 0) {
        console.log("No matching courses found, returning default shuffled courses.");
        recommendedCourses = getShuffledSlice(allCourses, 12);
      }
    } else {
      // Default: return shuffled courses
      console.log("No interests provided, returning default shuffled courses.");
      recommendedCourses = getShuffledSlice(allCourses, 12);
    }

    res.json(recommendedCourses);

  } catch (error) {
    console.error("Error in /api/courses:", error.message);
    res.status(500).json({ message: 'Failed to fetch course data.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

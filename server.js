const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allows requests from your React frontend

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


// --- API Endpoint ---

app.get('/api/courses', async (req, res) => {
  // Get interests from the query string (e.g., /api/courses?interests=Python,Data Science)
  const userInterestsQuery = req.query.interests;

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
        throw new Error("API did not return a valid course array.");
    }

    let recommendedCourses = [];

    // 2. Process the courses based on whether interests were provided
    if (userInterestsQuery) {
      console.log(`Filtering for interests: ${userInterestsQuery}`);
      const interestSet = new Set(userInterestsQuery.toLowerCase().split(','));
      
      recommendedCourses = allCourses.filter(course => 
        course.skills && course.skills.some(skill => interestSet.has(skill.toLowerCase()))
      );

      // Fallback: If no courses match the interests, provide a default set
      if (recommendedCourses.length === 0) {
        console.log("No specific matches found, returning default shuffled courses.");
        recommendedCourses = getShuffledSlice(allCourses, 12);
      }
    } else {
      // Default Case: No interests provided, so return a default list
      console.log("No interests provided, returning default shuffled courses.");
      recommendedCourses = getShuffledSlice(allCourses, 12);
    }

    // 3. Send the final list back to the frontend
    res.json(recommendedCourses);

  } catch (error) {
    console.error("Error in /api/courses:", error.message);
    res.status(500).json({ message: 'Failed to fetch course data.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
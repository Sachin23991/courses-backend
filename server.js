const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Allow requests from any origin

// --- Root Route for Testing ---
app.get("/", (req, res) => {
  res.send("🚀 Udemy Courses backend is running on Railway");
});

// --- API Endpoint ---
app.get('/api/courses', async (req, res) => {
  console.log("--- Received a new request for /api/courses ---");

  // --- 1. Check if the API Key is loaded ---
  if (!process.env.RAPIDAPI_KEY) {
    console.error("🔴 FATAL: RAPIDAPI_KEY is not defined in environment variables.");
    return res.status(500).json({ message: "Server configuration error: Missing API Key." });
  }
  console.log("✅ API Key is loaded. Key ends with: ..." + process.env.RAPIDAPI_KEY.slice(-4));

  // --- 2. Determine the search query ---
  const userInterestsQuery = req.query.interests;
  let searchQuery = '';

  if (userInterestsQuery) {
    searchQuery = userInterestsQuery.split(',')[0].trim();
    console.log(`🔎 User has interests. Searching for: "${searchQuery}"`);
  } else {
    const defaultTopics = ['Python', 'JavaScript', 'React', 'Data Science', 'Project Management', 'AWS'];
    searchQuery = defaultTopics[Math.floor(Math.random() * defaultTopics.length)];
    console.log(`🔎 No user interests. Searching for default topic: "${searchQuery}"`);
  }

  // --- 3. Prepare the API request ---
  const options = {
    method: 'GET',
    url: 'https://udemy-paid-courses-for-free-api.p.rapidapi.com/rapidapi/courses/search',
    params: {
      page: '1',
      page_size: '20',
      query: searchQuery
    },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'udemy-paid-courses-for-free-api.p.rapidapi.com'
    }
  };

  // --- 4. Make the API call and handle the response ---
  try {
    console.log("📡 Making request to RapidAPI...");
    const response = await axios.request(options);
    
    // IMPORTANT: Log the full structure of the API response
    console.log("✅ Received response from RapidAPI. Full data structure:");
    console.log(JSON.stringify(response.data, null, 2));

    // Safely access the results array
    const courses = response.data && response.data.results ? response.data.results : [];

    if (!Array.isArray(courses)) {
      console.error("🔴 API response.data.results is not an array!");
      throw new Error("External API did not return a valid array of courses.");
    }
    
    console.log(`👍 Successfully processed ${courses.length} courses. Sending response to frontend.`);
    res.json(courses);

  } catch (error) {
    console.error("🔴 An error occurred while calling RapidAPI!");
    // Provide detailed error information from Axios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error Status:", error.response.status);
      console.error("Error Headers:", JSON.stringify(error.response.headers, null, 2));
      console.error("Error Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error Request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    res.status(500).json({ message: 'Failed to fetch course data from the external API.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

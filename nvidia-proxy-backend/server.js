const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');  // Enable CORS

const app = express();
const port = 5000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());  // Allow CORS for all routes

const invokeUrl = "https://ai.api.nvidia.com/v1/vlm/adept/fuyu-8b";
const stream = true;

const headers = {
  "Authorization": "Bearer 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",
  "Accept": stream ? "text/event-stream" : "application/json"
};

app.post('/upload', async (req, res) => {
  try {
    const { imageB64 } = req.body;

    // Check if image is valid and under 180KB
    if (!imageB64 || Buffer.byteLength(imageB64, 'base64') > 180000) {
      return res.status(400).send('Image too large or invalid. Please upload an image below 180KB.');
    }

    const payload = {
      "messages": [
        {
          "role": "user",
          "content": `What do you see in the following image? <img src="data:image/png;base64,${imageB64}" />`
        }
      ],
      "max_tokens": 1024,
      "temperature": 0.20,
      "top_p": 0.70,
      "seed": 0,
      "stream": stream
    };

    const response = await axios.post(invokeUrl, payload, {
      headers: headers,
      responseType: 'stream',
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Pipe the streaming response to the frontend
    response.data.pipe(res);

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      res.status(500).send('Error during streaming.');
    });
  } catch (error) {
    console.error('API call failed:', error.response?.data || error.message);
    res.status(500).send('Error fetching image description.');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

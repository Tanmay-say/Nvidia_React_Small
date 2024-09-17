const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase request body size if necessary

const apiKey = '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';
const invokeUrl = 'https://ai.api.nvidia.com/v1/vlm/microsoft/kosmos-2';

app.post('/upload', async (req, res) => {
  try {
    const { imageB64 } = req.body;

    if (imageB64.length > 180_000) {
      return res.status(400).send('Image too large. Please upload an image below 180KB.');
    }

    const payload = {
      "messages": [
        {
          "role": "user",
          "content": `Who is in this photo? <img src="data:image/png;base64,${imageB64}" />`
        }
      ],
      "max_tokens": 1024,
      "temperature": 0.20,
      "top_p": 0.20
    };

    const response = await axios.post(invokeUrl, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('API call failed:', error.message);
    res.status(500).send('Error fetching image description.');
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

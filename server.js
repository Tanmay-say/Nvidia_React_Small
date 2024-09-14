import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import axios from 'axios';
import path from 'path';
import cors from 'cors';  // Add this import
import { fileURLToPath } from 'url';

const app = express();
const port = 5000;

app.use(cors()); // Enable CORS for all routes

const upload = multer({ dest: 'uploads/' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const invokeUrl = "https://ai.api.nvidia.com/v1/vlm/nvidia/neva-22b";
const stream = true;

const headers = {
  "Authorization": "Bearer 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",
  "Accept": stream ? "text/event-stream" : "application/json"
};

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = path.join(__dirname, req.file.path);
    const data = await fs.readFile(filePath);
    const imageB64 = Buffer.from(data).toString('base64');

    if (imageB64.length > 180_000) {
      throw new Error("To upload larger images, use the assets API (see docs)");
    }

    const payload = {
      "messages": [
        {
          "role": "user",
          "content": `Describe what you see in this image. <img src="data:image/png;base64,${imageB64}" />`
        }
      ],
      "max_tokens": 1024,
      "temperature": 0.20,
      "top_p": 0.70,
      "seed": 0,
      "stream": stream
    };

    const response = await axios.post(invokeUrl, payload, { headers, responseType: 'json' });

    res.json(response.data);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  } finally {
    await fs.unlink(req.file.path);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

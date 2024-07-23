const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const cors = require('cors');

// Create a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: './src/Contexts/ohana-b97d9-137236e1825a.json'  // Make sure the path is correct
});

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

app.post('/vision', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const [result] = await client.textDetection({
      image: { content: imageBase64 }
    });
    const detections = result.textAnnotations;
    res.json(detections);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
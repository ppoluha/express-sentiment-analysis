import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

app.post('/analyze', async (req, res) => {
  const reviews = req.body.reviews;

  if (!Array.isArray(reviews)) {
    return res.status(400).json({ error: 'Please provide an array of reviews.' });
  }

  try {
    const sentiments = await Promise.all(reviews.map(async (review) => {
      const sentiment = await analyzeSentiment(review);
      return sentiment;
    }));
    res.json(sentiments);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

async function analyzeSentiment(review) {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = `Analyze the sentiment in the following text and determine whether it is positive, negative, or neutral. Answer with one word.\n\n"${review}"`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1,
        temperature: 0.0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const sentiment = response.data.choices[0].message.content.trim();
    return sentiment;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

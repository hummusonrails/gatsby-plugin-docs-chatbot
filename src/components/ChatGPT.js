import axios from 'axios';

const chatGPT = async (message) => {
  console.log('chatGPT invoked');

  const API_URL = 'https://api.openai.com/v1/chat/completions';
  const API_KEY = process.env.OPENAI_API_KEY;

  if (!API_KEY) {
    console.error('OPENAI_API_KEY not set in environment variables');
    return 'Error: OPENAI_API_KEY not set in environment variables';
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };

  const data = {
    messages: [{"role": "user", "content": message}],
    model: "gpt-3.5-turbo",
    max_tokens: 150,
    n: 1,
    stop: null,
    temperature: 0.8,
  };

  console.log('Sending request to ChatGPT API with data:', data);

  try {
    const response = await axios.post(API_URL, data, { headers });
    console.log('Received response from ChatGPT API:', response.data)
    const result = response.data.choices[0].message.content.trim();
    console.log('Received response from ChatGPT API:', result);
    return result;
  } catch (error) {
    console.error('Error connecting to ChatGPT API:', error);
    return 'Error connecting to ChatGPT API';
  }
};

export default chatGPT;

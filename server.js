const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { model, prompt, width, height } = req.body;
    
    const apiKeys = process.env.HF_API_KEYS.split(',');
    const randomApiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    
    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: {
                    Authorization: `Bearer ${randomApiKey}`,
                    "Content-Type": "application/json",
                    "x-use-cache": "false"
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: { width, height }
                })
            }
        );

        if (!response.ok) {
            throw new Error((await response.json())?.error);
        }

        const buffer = await response.arrayBuffer();
        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
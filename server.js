require('dotenv').config(); // This loads the key from .env
// Example Node.js snippet
const express = require('express');
const { OpenAI } = require('openai');
const app = express();
const path = require('path');

app.use(express.json());
const cors = require('cors');
app.use(cors()); // This allows the widget to talk to your server

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const fs = require('fs');
// Load the knowledge once when the server starts
const businessKnowledge = fs.readFileSync('business_knowledge.txt', 'utf8');

app.post('/chat', async (req, res) => {
  try {
    // 1. Deep Chat sends the message inside an array called 'messages'
    // The last message in the array is the current user input
    const userMessages = req.body.messages;
    const lastMessage = userMessages[userMessages.length - 1].text;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      
      messages: [
        { role: "system", 
          content: `You are a helpful business assistant walking in Turkish by default unless the user asks you to speak in another language or uses another language. Use the following business context to answer questions. If the answer isn't in the context, say you don't know and offer to connect them to a human.\n\nCONTEXT:\n${businessKnowledge}`        },
        { role: "user", content: lastMessage }
      ],
    });

    const aiReply = completion.choices[0].message.content;

    // 2. Deep Chat expects the response in this EXACT format: { "text": "..." }
    res.json({ text: aiReply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
// Tell Express to serve your index.html file
app.use(express.static(__dirname));
// Tell Express to serve your index.html file
app.use(express.static(__dirname));

// IMPORTANT: Use the port provided by the host (Render uses 10000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
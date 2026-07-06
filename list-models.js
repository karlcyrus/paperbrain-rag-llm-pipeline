const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=(.+)/);
const apiKey = match[1].trim();

async function testEmbed() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text: 'Hello world test' }] },
      }),
    }
  );
  const data = await res.json();
  if (data.error) {
    console.log('Error:', data.error);
  } else {
    console.log('Embedding dimensions:', data.embedding.values.length);
    console.log('First 5 values:', data.embedding.values.slice(0, 5));
  }
}
testEmbed();

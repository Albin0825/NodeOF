const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.get('/fetch-images/:creator/:index', async (req, res) => {
  const { creator, index } = req.params;
  const fetch = await import('node-fetch');
  const response = await fetch.default(`https://coomer.party/onlyfans/user/${creator}?o=${index}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  });
  const text = await response.text();
  res.send(text);
});

app.get('/fetch-attachment/:total/:index', async (req, res) => {
  const { total, index } = req.params;
  const url = req.query.url;
  const fetch = await import('node-fetch');
  const response = await fetch.default(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  });
  const text = await response.text();
  process.stdout.write('\r' + ' '.repeat(process.stdout.columns - 1) + '\r');
  process.stdout.write(`\r${index}/${total} | ${((index/total)*100).toFixed(2)}%`);
  res.send(text);
});

app.get('/writeLine/:text/:before/:after', async (req, res) => {
  const { text, before, after } = req.params;
  if(before == 'true') {
    process.stdout.write(`\n`);
  }
  process.stdout.write(`${text}`);
  if(after == 'true') {
    process.stdout.write(`\n`);
  }
  res.send('TRUE')
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:3000/`);
});
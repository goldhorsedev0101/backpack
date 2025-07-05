const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Debug server running on port 5000');
});
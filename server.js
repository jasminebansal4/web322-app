const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the "public" folder
app.use(express.static('public'));

// Redirect root to "/about"
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Serve about.html on "/about" route
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Express http server listening on port ${PORT}`);
});

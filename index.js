const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Read a list of blog posts
app.get('/api/posts', (req, res) => {
  const postsDir = path.join(__dirname, 'posts');
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const postList = files.map((file) => {
      const postId = path.basename(file, '.txt');
      const postPath = path.join(postsDir, file);
      const postContent = fs.readFileSync(postPath, 'utf-8');
      return { id: postId, content: postContent };
    });

    res.json(postList);
  });
});

// Create a new blog post
app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).send('Title and content are required');
    return;
  }

  const postId = Date.now().toString(); // Generate a unique ID
  const postFileName = `${postId}.txt`;
  const postFilePath = path.join(__dirname, 'posts', postFileName);

  fs.writeFile(postFilePath, content, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.status(201).json({ id: postId });
  });
});

// Delete a blog post by ID
app.delete('/api/posts/:postId', (req, res) => {
  const postId = req.params.postId;
  const postFilePath = path.join(__dirname, 'posts', `${postId}.txt`);

  fs.unlink(postFilePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    res.status(204).end(); // Send a success response with no content
  });
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

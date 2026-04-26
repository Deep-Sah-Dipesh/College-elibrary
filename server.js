const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'frontend', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend files missing.');
    }
});

const loadBooks = () => {
    const dataPath = path.join(__dirname, 'books.json');
    if (!fs.existsSync(dataPath)) return [];
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
};

app.get('/api/books', (req, res) => {
    try {
        res.json(loadBooks());
    } catch (err) {
        res.status(500).json({ error: "Failed to load database" });
    }
});

app.get('/api/books/:id', (req, res) => {
    try {
        const book = loadBooks().find(b => b.id === req.params.id);
        if (book) res.json(book);
        else res.status(404).json({ error: "Book not found" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" and "game images" directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game-images', express.static(path.join(__dirname, 'game images')));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL Server:', err);
        process.exit(1); // Exit the process with an error code
    }
    console.log('Connected to MySQL Server!');
});

app.get('/videogames/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM videogames WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.json({ message: 'Game not found' });
        }
        res.json(results[0]);
    });
});

app.get('/videogames', (req, res) => {
    const { title, developer, publisher, genre, platform } = req.query;

    // Construct the SQL query dynamically
    let query = 'SELECT * FROM videogames';
    const queryParams = [];
    if (title || developer || publisher || genre || platform) {
        query += ' WHERE ';
        const conditions = [];
        if (title) {
            conditions.push('title LIKE ?');
            queryParams.push(`%${title}%`);
        }
        if (developer) {
            conditions.push('developer LIKE ?');
            queryParams.push(`%${developer}%`);
        }
        if (publisher) {
            conditions.push('publisher LIKE ?');
            queryParams.push(`%${publisher}%`);
        }
        if (genre) {
            conditions.push('genre LIKE ?');
            queryParams.push(`%${genre}%`);
        }
        if (platform) {
            conditions.push('platform LIKE ?');
            queryParams.push(`%${platform}%`);
        }
        query += conditions.join(' AND ');
    }

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.get('/videogames/:id/artwork', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT artwork_url FROM videogames WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }
        const artworkUrl = results[0].artwork_url;
        res.json({ artworkUrl });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
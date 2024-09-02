// Load environment variables from .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Create an instance of express for our app
const app = express();

// Define the port to run the server on
const port = process.env.PORT || 3001;

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Middleware to enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Serve static files from the "public" and "game images" directories
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game-images', express.static(path.join(__dirname, 'game images')));

// Function to start the server and handle database connection
async function startServer() {
    try {
        // Create a connection to the MySQL database using configuration from environment variables
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to MySQL Server!');

        // Define a route to fetch data for a single video game by its ID
        app.get('/videogames/:id', async (req, res) => {
            const { id } = req.params;
            try {
                console.log(`Fetching game with ID: ${id}`);
                const [results] = await connection.query('SELECT * FROM videogames WHERE id = ?', [id]);
                if (results.length === 0) {
                    return res.json({ message: 'Game not found' });
                }
                res.json(results[0]);
            } catch (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Database error' });
            }
        });

        // Define a route to fetch all video games optionally filtered by query parameters
        // Define a route to fetch all video games optionally filtered by query parameters
    app.get('/videogames', async (req, res) => {
        const { title, developer, publisher, genre, platform } = req.query;

        console.log('Fetching video games with filters:', req.query);

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

        try {
            const [results] = await connection.query(query, queryParams);
            console.log('Fetched video games:', results);

            // Set the content type to application/json
            res.setHeader('Content-Type', 'application/json');
            res.json(results);
        } catch (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
        }
    });

        // Define a route to fetch artwork URL for a specific video game by its ID
        app.get('/videogames/:id/artwork', async (req, res) => {
            const { id } = req.params;
            try {
                console.log(`Fetching artwork for game with ID: ${id}`);
                const [results] = await connection.query('SELECT artwork_url FROM videogames WHERE id = ?', [id]);
                if (results.length === 0) {
                    return res.status(404).json({ message: 'Game not found' });
                }
                const artworkUrl = results[0].artwork_url;
                res.json({ artworkUrl });
            } catch (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Database error' });
            }
        });

        // Serve React frontend in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Serving React frontend');
            app.use(express.static(path.join(__dirname, '../frontend/build')));

            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
            });
        }

        // Start the server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (err) {
        console.error('Error connecting to MySQL Server:', err);
        process.exit(1); // Exit the process with an error code
    }
}

// Run the server
startServer();
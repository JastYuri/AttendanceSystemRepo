const express = require("express");
const path = require("path");
const mysql = require("mysql2"); // or mysql if you stick with it
const dotenv = require("dotenv");
const session = require('express-session');
const util = require('util');

// Load environment variables from .env file
dotenv.config({ path: './.env' });
const server = express();

// Create a MySQL database connection using credentials from environment variables
const db = mysql.createConnection({
    host: process.env.DATABASE_host,
    user: process.env.DATABASE_user,
    password: process.env.DATABASE_password,
    database: process.env.DATABASE,
    port: process.env.DATABASE_port
});

// Promisify the db.query method (use async/await or promisify)
db.query = util.promisify(db.query);

// Middleware to handle session management
server.use(session({
    secret: '072203', // Secret key for session encryption, should be changed to a more secure key
    resave: false, // Don't save session if it hasn't been modified
    saveUninitialized: true, // Save a session even if it's new
    cookie: { secure: false } // Set to true if using HTTPS to secure cookies
}));

// Serve static files from the "public" directory
const publicDirectory = path.join(__dirname, './public');
server.use(express.static(publicDirectory));
server.use(express.json()); // Allow the server to parse JSON data
server.set('view engine', 'hbs'); // Set Handlebars (hbs) as the template engine

// Connect to MySQL database and log the connection status
const connectDb = async () => {
    try {
        await db.connect();
        console.log("Connected to MySQL database.");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};
connectDb();

// Set up routing after the middleware
server.use('/node_modules', express.static('node_modules')); // Serve node_modules as static files
server.use('/', require('./route/pages')); // Use routes defined in pages.js
server.use('/uploads', require('./route/uploadroutes')); // Ensure the uploadroutes.js path is correct

// Start the server on a dynamic port (required for deployment platforms like Render)
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
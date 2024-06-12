const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3001; // Changed from 3000 to 3001

// Set up storage engine for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Aditya@09', // Replace with your MySQL password
    database: 'profile_data'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Middleware to handle JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/submit', upload.fields([
    { name: 'resume' }, 
    { name: 'profilePicture' }, 
    { name: 'class10Marksheet' },
    { name: 'class12Marksheet' },
    { name: 'graduationMarksheet' },
    { name: 'certificate1' },
    { name: 'certificate2' },
    { name: 'certificate3' }
]), (req, res) => {
    const { linkedinLink, githubLink } = req.body;

    const data = {
        resume: req.files['resume'] ? req.files['resume'][0].filename : null,
        profile_picture: req.files['profilePicture'] ? req.files['profilePicture'][0].filename : null,
        class10_marksheet: req.files['class10Marksheet'] ? req.files['class10Marksheet'][0].filename : null,
        class12_marksheet: req.files['class12Marksheet'] ? req.files['class12Marksheet'][0].filename : null,
        graduation_marksheet: req.files['graduationMarksheet'] ? req.files['graduationMarksheet'][0].filename : null,
        certificate1: req.files['certificate1'] ? req.files['certificate1'][0].filename : null,
        certificate2: req.files['certificate2'] ? req.files['certificate2'][0].filename : null,
        certificate3: req.files['certificate3'] ? req.files['certificate3'][0].filename : null,
        linkedin_link: linkedinLink,
        github_link: githubLink
    };

    // Insert data into the database
    const sql = 'INSERT INTO profiles SET ?';
    db.query(sql, data, (err, result) => {
        if (err) throw err;
        console.log('Data inserted:', result);
        res.redirect('/thankyou.html');
    });
});

// Serve the thank you page
app.get('/thankyou.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'thankyou.html'));
});

// Serve the data retrieval page
app.get('/retrieve-data', (req, res) => {
    res.sendFile(path.join(__dirname, 'retrieve-data.html'));
});

// Retrieve data from the database
app.get('/api/retrieve-data', (req, res) => {
    const sql = 'SELECT * FROM profiles';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

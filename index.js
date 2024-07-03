const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));  // To serve the HTML file and other static files


const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


mongoose.connect(process.env.MONGODB_URI, {})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;

    try {
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        res.json({ story: text });
    } catch (error) {
        console.error('Error generating story:', error);
        res.status(500).json({ error: 'Sorry , try again !' });
    }
});


app.post('/user-register', async (req, res) => {
    const { username, mobileNo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, mobileNo, password: hashedPassword });
        await user.save();
        res.redirect('/user-login'); // Redirect to login page after successful registration
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/user-login', async (req, res) => {
    const { mobileNo, password } = req.body;

    try {
        const user = await User.findOne({ mobileNo });
        if (!user) {
            return res.status(400).json({ error: 'Invalid mobile number or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid mobile number or password' });
        }

        res.redirect('/chat'); // Redirect to chat page after successful login
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Redirect routes for register and login
app.get('/user-register', (req, res) => {
    res.sendFile(__dirname + '/public/user-register.html');
});

app.get('/user-login', (req, res) => {
    res.sendFile(__dirname + '/public/user-login.html');
});

// Chat page route
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

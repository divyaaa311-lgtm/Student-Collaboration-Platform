const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 

const User = require('./models/User'); 
const Project = require('./models/Project'); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST", "DELETE"]
    }
});

app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('🎉 Successfully connected to MongoDB!'))
    .catch((err) => console.error('❌ Database connection error:', err));

// --- LIVE SOCKET CONNECTION ---
io.on('connection', (socket) => {
    console.log(`🔌 A student connected live! ID: ${socket.id}`);
});

// --- API ROUTES ---

app.get('/', (req, res) => {
    res.send('The Student Platform Server is Running Successfully!');
});

// Registration Route
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Email already registered!" });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered securely!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error occurred" });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password!" });

        const token = jwt.sign({ userId: user._id }, 'mySecretKey123', { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error occurred" });
    }
});

// Create Project Route
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, skillsRequired, creatorId, deadline } = req.body;

        const newProject = new Project({
            title,
            description,
            skillsRequired,
            creator: creatorId,
            deadline: deadline || null
        });

        await newProject.save();
        const populatedProject = await Project.findById(newProject._id).populate('creator', 'name email');
        io.emit('projectCreated', populatedProject);

        res.status(201).json({ message: "Project posted successfully!", project: populatedProject });
    } catch (error) {
        res.status(500).json({ message: "Failed to create project" });
    }
});

// Get All Projects Route
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().populate('creator', 'name email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch projects" });
    }
});

// Submit Application Route
app.post('/api/projects/:id/apply', async (req, res) => {
    try {
        const { studentName, studentEmail, linkedinUrl, introduction } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found!" });

        project.applicants.push({ studentName, studentEmail, linkedinUrl, introduction });
        await project.save();

        const updatedProject = await Project.findById(project._id).populate('creator', 'name email');
        io.emit('projectUpdated', updatedProject);

        res.status(200).json({ message: "Application submitted!", project: updatedProject });
    } catch (error) {
        res.status(500).json({ message: "Application failed" });
    }
});

// --- 🗑️ DELETION ENDPOINT ---
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) return res.status(404).json({ message: "Project not found!" });

        io.emit('projectDeleted', req.params.id);
        res.status(200).json({ message: "Opportunity removed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Deletion failed" });
    }
});

server.listen(5000, () => {
    console.log(`Server is happily running on port 5000`);
});

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http'); // 1. Import built-in HTTP tool
const { Server } = require('socket.io'); // 2. Import Socket.IO

const User = require('./models/User'); 
const Project = require('./models/Project'); 

const app = express();

// 3. Create the HTTP server wrapping our express app
const server = http.createServer(app);

// 4. Initialize Socket.IO and allow your React frontend to connect
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your React App URL
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB!'))
    .catch((err) => console.error('Database connection error:', err));

// --- LIVE SOCKET CONNECTION ---
io.on('connection', (socket) => {
    console.log(`🔌 A student connected live! ID: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log('❌ A student disconnected.');
    });
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

// Create Project Route (With Live Broadcast!)
app.post('/api/projects', async (req, res) => {
    try {
        const { title, description, skillsRequired, creatorId } = req.body;

        const newProject = new Project({
            title,
            description,
            skillsRequired,
            creator: creatorId
        });

        await newProject.save();
        
        const populatedProject = await Project.findById(newProject._id).populate('creator', 'name email');

        // 5. SHOUT OUT LIVE: Tell every single connected frontend that a new project was born!
        io.emit('projectCreated', newProject);

        res.status(201).json({ message: "Project posted successfully!", project: newProject });
    } catch (error) {
        console.error(error);
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
// --- NEW ROUTE: SUBMIT AN APPLICATION TO A PROJECT ---
 app.post('/api/projects/:id/apply', async (req, res) => {
    try {
        const projectId = req.params.id;
        const { studentName, studentEmail, linkedinUrl, introduction } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project opportunity not found!" });
        }

        // Check if the deadline has already passed
        if (new Date() > new Date(project.deadline)) {
            return res.status(400).json({ message: "❌ This opportunity has expired!" });
        }

        // Push the new applicant object into the array list
        project.applicants.push({
            studentName,
            studentEmail,
            linkedinUrl,
            introduction
        });

        await project.save();
        
        // Re-populate creator data before sending back so sockets don't break
        const updatedProject = await Project.findById(projectId).populate('creator', 'name email');
        
        // Broadcast the update live to all active feeds
        io.emit('projectUpdated', updatedProject);

        res.status(200).json({ message: "🎉 Application submitted successfully!", project: updatedProject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to submit application" });
    }
});


// 6. VERY IMPORTANT: Change app.listen to server.listen
server.listen(PORT=5000, () => {
    console.log(`Server is happily running on port ${PORT}`);
});

// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const User = require('./models/User'); 
// const Project = require('./models/Project'); // 1. Import Project blueprint
// const app = express();
// const PORT = 5000;

// app.use(express.json());
// app.use(cors());

// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch((err) => console.error('Database connection error:', err));

// // --- API ROUTES ---

// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// // Registration Route
// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const userExists = await User.findOne({ email });
//         if (userExists) return res.status(400).json({ message: "Email already registered!" });
        
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({ name, email, password: hashedPassword });
//         await newUser.save();
//         res.status(201).json({ message: "User registered securely!", user: newUser });
//     } catch (error) {
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// // Login Route
// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: "Invalid email or password!" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid email or password!" });

//         const token = jwt.sign({ userId: user._id }, 'mySecretKey123', { expiresIn: '1h' });
//         res.status(200).json({ message: "Login successful!", token, user: { id: user._id, name: user.name, email: user.email } });
//     } catch (error) {
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// // 2. NEW ROUTE: CREATE A PROJECT
// app.post('/api/projects', async (req, res) => {
//     try {
//         const { title, description, skillsRequired, creatorId } = req.body;

//         const newProject = new Project({
//             title,
//             description,
//             skillsRequired,
//             creator: creatorId // Connects to the logged-in student's id
//         });

//         await newProject.save();
//         res.status(201).json({ message: "Project posted successfully!", project: newProject });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Failed to create project" });
//     }
// });

// // 3. NEW ROUTE: GET ALL PROJECTS
// app.get('/api/projects', async (req, res) => {
//     try {
//         // Fetch all projects out of the database and attach the creator's Name and Email automatically
//         const projects = await Project.find().populate('creator', 'name email');
//         res.status(200).json(projects);
//     } catch (error) {
//         res.status(500).json({ message: "Failed to fetch projects" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // 1. Import JWT package
// const cors = require('cors');
// const User = require('./models/User'); 
// const app = express();
// const PORT = 5000;

// app.use(express.json());
// app.use(cors());

// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch((err) => console.error('Database connection error:', err));

// // --- API ROUTES ---

// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// // Registration Route (Kept from before)
// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: "Email already registered!" });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword
//         });

//         await newUser.save();
//         res.status(201).json({ message: "User registered securely!", user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// // 2. NEW USER LOGIN ROUTE
// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "Invalid email or password!" });
//         }

//         // Compare incoming plain password with the stored scrambled password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password!" });
//         }

//         // Generate a digital token containing the user's ID
//         // 'mySecretKey123' is a temporary key used to sign the token
//         const token = jwt.sign({ userId: user._id }, 'mySecretKey123', { expiresIn: '1h' });

//         res.status(200).json({
//             message: "Login successful!",
//             token, // Send this token back to the user
//             user: { id: user._id, name: user.name, email: user.email }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });

// const express = require('express');
// const mongoose = require('mongoose'); // 1. Import Mongoose
// const app = express();
// const PORT = 5000;

// app.use(express.json());

// // 2. Replace the text below with your actual connection string from Step 3!
// // Make sure to replace <username> and <password> with your database credentials.
// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

// // 3. Connect to MongoDB
// mongoose.connect(MONGO_URI)
//     .then(() => console.log('🎉 Successfully connected to MongoDB!'))
//     .catch((err) => console.error('❌ Database connection error:', err));

// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });
// const express = require('express');
// const mongoose = require('mongoose');
// const User = require('./models/User'); // Import the User model blueprint
// const app = express();
// const PORT = 5000;

// app.use(express.json());

// // Replace this with your actual MongoDB Atlas connection string!
// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";


// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch((err) => console.error('Database connection error:', err));

// // --- API ROUTES ---

// // 1. Home test route
// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// // 2. User Registration Route
// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check if user already exists
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: "Email already registered!" });
//         }

//         // Create a new user instance
//         const newUser = new User({
//             name,
//             email,
//             password // Note: In the next step, we will encrypt/hash this for security!
//         });

//         // Save the user to MongoDB
//         await newUser.save();

//         res.status(201).json({ message: "User registered successfully!", user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // 1. Import bcryptjs package
// const User = require('./models/User'); 
// const app = express();
// const PORT = 5000;

// app.use(express.json());

// // Make sure this matches your real MongoDB Atlas connection string!
// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";
// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch((err) => console.error('Database connection error:', err));

// // --- API ROUTES ---

// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// // Updated Registration Route with Encryption
// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: "Email already registered!" });
//         }

//         // 2. Generate a 'salt' (random security data added to the hash)
//         const salt = await bcrypt.genSalt(10);
//         // 3. Hash the plain-text password using the salt
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword // 4. Save the secure, scrambled password instead!
//         });

//         await newUser.save();
//         res.status(201).json({ message: "User registered securely!", user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // 1. Import JWT package
// const User = require('./models/User'); 
// const app = express();
// const PORT = 5000;

// app.use(express.json());

// const MONGO_URI = "mongodb+srv://divyaaa311_db_user:oXwQeVZsNFtMj9KA@cluster0.g5ykr3o.mongodb.net/?appName=Cluster0";

// mongoose.connect(MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB!'))
//     .catch((err) => console.error('Database connection error:', err));

// // --- API ROUTES ---

// app.get('/', (req, res) => {
//     res.send('The Student Platform Server is Running Successfully!');
// });

// // Registration Route (Kept from before)
// app.post('/api/register', async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({ message: "Email already registered!" });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword
//         });

//         await newUser.save();
//         res.status(201).json({ message: "User registered securely!", user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// // 2. NEW USER LOGIN ROUTE
// app.post('/api/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "Invalid email or password!" });
//         }

//         // Compare incoming plain password with the stored scrambled password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid email or password!" });
//         }

//         // Generate a digital token containing the user's ID
//         // 'mySecretKey123' is a temporary key used to sign the token
//         const token = jwt.sign({ userId: user._id }, 'mySecretKey123', { expiresIn: '1h' });

//         res.status(200).json({
//             message: "Login successful!",
//             token, // Send this token back to the user
//             user: { id: user._id, name: user.name, email: user.email }
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error occurred" });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is happily running on port ${PORT}`);
// });

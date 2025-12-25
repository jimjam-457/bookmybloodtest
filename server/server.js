require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// In-memory data stores
let users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@lab.com',
    password: bcrypt.hashSync('Admin@123', 8),
    role: 'admin',
    createdAt: new Date()
  }
];

let tests = [
  {
    id: 1,
    name: 'Complete Blood Count (CBC)',
    description: 'Measures various components of blood including red blood cells, white blood cells, and platelets.',
    price: 25.99,
    category: 'Hematology',
    fastingRequired: false,
    sampleType: 'Blood',
    processingTime: '24-48 hours'
  },
  {
    id: 2,
    name: 'Lipid Profile',
    description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.',
    price: 35.50,
    category: 'Cardiac',
    fastingRequired: true,
    sampleType: 'Blood',
    processingTime: '24-48 hours'
  },
  // Add more test data as needed
];

let bookings = [];
let nextUserId = 2;
let nextTestId = 3;
let nextBookingId = 1;

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user and token (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user and token (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Test routes
app.get('/api/tests', (req, res) => {
  res.json(tests);
});

app.get('/api/tests/:id', (req, res) => {
  const test = tests.find(t => t.id === parseInt(req.params.id));
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(test);
});

// Protected routes (require authentication)
app.use(authenticateToken);

// Booking routes
app.get('/api/bookings', (req, res) => {
  if (req.user.role === 'admin') {
    res.json(bookings);
  } else {
    const userBookings = bookings.filter(b => b.userId === req.user.id);
    res.json(userBookings);
  }
});

app.post('/api/bookings', (req, res) => {
  const { testIds, patientInfo, collectionType, date, timeSlot } = req.body;
  
  // Validate input
  if (!testIds || !testIds.length || !patientInfo || !collectionType || !date || !timeSlot) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Get test details
  const selectedTests = tests.filter(test => testIds.includes(test.id));
  if (selectedTests.length !== testIds.length) {
    return res.status(400).json({ message: 'One or more tests not found' });
  }
  
  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);
  
  // Create booking
  const booking = {
    id: nextBookingId++,
    userId: req.user.id,
    tests: selectedTests,
    patientInfo,
    collectionType,
    date,
    timeSlot,
    status: 'Pending',
    totalPrice,
    createdAt: new Date()
  };
  
  bookings.push(booking);
  
  res.status(201).json(booking);
});

// Admin routes
app.use(isAdmin);

app.post('/api/tests', (req, res) => {
  const { name, description, price, category, fastingRequired, sampleType, processingTime } = req.body;
  
  if (!name || !description || price === undefined || !category || fastingRequired === undefined || !sampleType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const test = {
    id: nextTestId++,
    name,
    description,
    price: parseFloat(price),
    category,
    fastingRequired: Boolean(fastingRequired),
    sampleType,
    processingTime: processingTime || '24-48 hours'
  };
  
  tests.push(test);
  res.status(201).json(test);
});

app.put('/api/tests/:id', (req, res) => {
  const testIndex = tests.findIndex(t => t.id === parseInt(req.params.id));
  if (testIndex === -1) {
    return res.status(404).json({ message: 'Test not found' });
  }
  
  const { name, description, price, category, fastingRequired, sampleType, processingTime } = req.body;
  
  tests[testIndex] = {
    ...tests[testIndex],
    name: name || tests[testIndex].name,
    description: description || tests[testIndex].description,
    price: price !== undefined ? parseFloat(price) : tests[testIndex].price,
    category: category || tests[testIndex].category,
    fastingRequired: fastingRequired !== undefined ? Boolean(fastingRequired) : tests[testIndex].fastingRequired,
    sampleType: sampleType || tests[testIndex].sampleType,
    processingTime: processingTime || tests[testIndex].processingTime
  };
  
  res.json(tests[testIndex]);
});

app.delete('/api/tests/:id', (req, res) => {
  const testIndex = tests.findIndex(t => t.id === parseInt(req.params.id));
  if (testIndex === -1) {
    return res.status(404).json({ message: 'Test not found' });
  }
  
  tests = tests.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  const bookingIndex = bookings.findIndex(b => b.id === parseInt(req.params.id));
  
  if (bookingIndex === -1) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  
  const validStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  bookings[bookingIndex].status = status;
  res.json(bookings[bookingIndex]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

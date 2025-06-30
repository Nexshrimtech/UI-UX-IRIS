const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Routes

// Dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    const dashboardData = await db.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Bills
app.post('/api/bills', [
  body('billName').notEmpty().trim().escape(),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('category').notEmpty().trim().escape(),
], handleValidationErrors, async (req, res) => {
  try {
    const billId = await db.createBill(req.body);
    res.status(201).json({ success: true, id: billId });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ success: false, message: 'Failed to create bill' });
  }
});

app.get('/api/bills', async (req, res) => {
  try {
    const bills = await db.getBills();
    res.json(bills);
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
});

// EMIs
app.post('/api/emis', [
  body('loanName').notEmpty().trim().escape(),
  body('principalAmount').isNumeric().isFloat({ min: 0 }),
  body('emiAmount').isNumeric().isFloat({ min: 0 }),
  body('tenure').isInt({ min: 1 }),
  body('paymentDate').isISO8601(),
  body('bankDetails').notEmpty().trim().escape(),
], handleValidationErrors, async (req, res) => {
  try {
    const emiId = await db.createEMI(req.body);
    res.status(201).json({ success: true, id: emiId });
  } catch (error) {
    console.error('Create EMI error:', error);
    res.status(500).json({ success: false, message: 'Failed to create EMI' });
  }
});

app.get('/api/emis', async (req, res) => {
  try {
    const emis = await db.getEMIs();
    res.json(emis);
  } catch (error) {
    console.error('Get EMIs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch EMIs' });
  }
});

app.post('/api/emis/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    await db.payEMI(id);
    res.json({ success: true, message: 'EMI payment processed successfully' });
  } catch (error) {
    console.error('Pay EMI error:', error);
    res.status(500).json({ success: false, message: 'Failed to process EMI payment' });
  }
});

// Subscriptions
app.post('/api/subscriptions', [
  body('subscriptionName').notEmpty().trim().escape(),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('billingCycle').isIn(['monthly', 'yearly', 'custom']),
  body('startDate').isISO8601(),
  body('category').notEmpty().trim().escape(),
], handleValidationErrors, async (req, res) => {
  try {
    const subscriptionId = await db.createSubscription(req.body);
    res.status(201).json({ success: true, id: subscriptionId });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to create subscription' });
  }
});

app.get('/api/subscriptions', async (req, res) => {
  try {
    const subscriptions = await db.getSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.cancelSubscription(id);
    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
});

// Utilities
app.post('/api/utilities', [
  body('utilityType').notEmpty().trim().escape(),
  body('providerName').notEmpty().trim().escape(),
  body('accountNumber').notEmpty().trim().escape(),
  body('billingAmount').isNumeric().isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('frequency').isIn(['monthly', 'quarterly', 'yearly']),
], handleValidationErrors, async (req, res) => {
  try {
    const utilityId = await db.createUtility(req.body);
    res.status(201).json({ success: true, id: utilityId });
  } catch (error) {
    console.error('Create utility error:', error);
    res.status(500).json({ success: false, message: 'Failed to create utility' });
  }
});

app.get('/api/utilities', async (req, res) => {
  try {
    const utilities = await db.getUtilities();
    res.json(utilities);
  } catch (error) {
    console.error('Get utilities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch utilities' });
  }
});

app.post('/api/utilities/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    await db.payUtility(id);
    res.json({ success: true, message: 'Utility payment processed successfully' });
  } catch (error) {
    console.error('Pay utility error:', error);
    res.status(500).json({ success: false, message: 'Failed to process utility payment' });
  }
});

// Loan Application
app.post('/api/loans/apply', [
  body('loanType').notEmpty().trim().escape(),
  body('loanAmount').isNumeric().isFloat({ min: 0 }),
  body('loanTenure').isInt({ min: 1 }),
  body('personalDetails.firstName').notEmpty().trim().escape(),
  body('personalDetails.lastName').notEmpty().trim().escape(),
  body('personalDetails.email').isEmail().normalizeEmail(),
  body('personalDetails.mobile').isMobilePhone(),
], handleValidationErrors, async (req, res) => {
  try {
    const applicationId = await db.submitLoanApplication(req.body);
    res.status(201).json({ 
      success: true, 
      applicationId,
      message: 'Loan application submitted successfully' 
    });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit loan application' });
  }
});

// Mobile Recharge
app.post('/api/recharge', [
  body('mobileNumber').isMobilePhone(),
  body('operator').notEmpty().trim().escape(),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('paymentMethod').notEmpty().trim().escape(),
], handleValidationErrors, async (req, res) => {
  try {
    const transactionId = await db.processRecharge(req.body);
    res.json({ 
      success: true, 
      transactionId,
      message: 'Recharge processed successfully' 
    });
  } catch (error) {
    console.error('Recharge error:', error);
    res.status(500).json({ success: false, message: 'Failed to process recharge' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Finance Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Finance Management API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
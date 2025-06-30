const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'finance.db'), (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        bill_name TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        category TEXT NOT NULL,
        payment_frequency TEXT DEFAULT 'one-time',
        repeat_frequency TEXT,
        end_date TEXT,
        reminder_enabled INTEGER DEFAULT 1,
        reminder_time TEXT DEFAULT '1-day',
        reminder_message TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS emis (
        id TEXT PRIMARY KEY,
        loan_name TEXT NOT NULL,
        principal_amount REAL NOT NULL,
        interest_rate REAL,
        tenure INTEGER NOT NULL,
        emi_amount REAL NOT NULL,
        payment_date TEXT NOT NULL,
        bank_details TEXT NOT NULL,
        remaining_tenure INTEGER,
        next_due_date TEXT,
        reminder_enabled INTEGER DEFAULT 1,
        reminder_days TEXT DEFAULT '3',
        notification_methods TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        subscription_name TEXT NOT NULL,
        provider TEXT,
        amount REAL NOT NULL,
        billing_cycle TEXT NOT NULL,
        custom_cycle TEXT,
        start_date TEXT NOT NULL,
        next_renewal_date TEXT,
        category TEXT NOT NULL,
        payment_method TEXT,
        reminder_enabled INTEGER DEFAULT 1,
        reminder_days INTEGER DEFAULT 3,
        notification_types TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS utilities (
        id TEXT PRIMARY KEY,
        utility_type TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        account_number TEXT NOT NULL,
        billing_amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        frequency TEXT NOT NULL,
        reminder_enabled INTEGER DEFAULT 1,
        reminder_days TEXT DEFAULT '3',
        notification_methods TEXT,
        autopay_enabled INTEGER DEFAULT 0,
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS loan_applications (
        id TEXT PRIMARY KEY,
        loan_type TEXT NOT NULL,
        loan_amount REAL NOT NULL,
        loan_tenure INTEGER NOT NULL,
        personal_details TEXT NOT NULL,
        employment_details TEXT NOT NULL,
        bank_details TEXT NOT NULL,
        emi REAL NOT NULL,
        total_amount REAL NOT NULL,
        total_interest REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        application_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS recharge_history (
        id TEXT PRIMARY KEY,
        mobile_number TEXT NOT NULL,
        operator TEXT NOT NULL,
        recharge_type TEXT NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_id TEXT UNIQUE,
        status TEXT DEFAULT 'completed',
        recharge_date DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    tables.forEach((table) => {
      this.db.run(table, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        }
      });
    });

    // Insert sample data
    this.insertSampleData();
  }

  insertSampleData() {
    // Check if data already exists
    this.db.get("SELECT COUNT(*) as count FROM emis", (err, row) => {
      if (err) {
        console.error('Error checking existing data:', err);
        return;
      }

      if (row.count === 0) {
        // Insert sample EMIs
        const sampleEMIs = [
          {
            id: uuidv4(),
            loan_name: 'Home Loan',
            principal_amount: 2500000,
            interest_rate: 8.5,
            tenure: 240,
            emi_amount: 45000,
            payment_date: '2025-07-15',
            bank_details: 'HDFC Bank',
            remaining_tenure: 180,
            next_due_date: '2025-07-15',
            notification_methods: JSON.stringify({ email: true, sms: true, push: true })
          },
          {
            id: uuidv4(),
            loan_name: 'Car Loan',
            principal_amount: 800000,
            interest_rate: 9.2,
            tenure: 60,
            emi_amount: 18500,
            payment_date: '2025-07-10',
            bank_details: 'SBI',
            remaining_tenure: 36,
            next_due_date: '2025-07-10',
            notification_methods: JSON.stringify({ email: true, sms: false, push: true })
          }
        ];

        sampleEMIs.forEach((emi) => {
          this.db.run(`INSERT INTO emis (
            id, loan_name, principal_amount, interest_rate, tenure, emi_amount, 
            payment_date, bank_details, remaining_tenure, next_due_date, notification_methods
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            emi.id, emi.loan_name, emi.principal_amount, emi.interest_rate, emi.tenure,
            emi.emi_amount, emi.payment_date, emi.bank_details, emi.remaining_tenure,
            emi.next_due_date, emi.notification_methods
          ]);
        });

        // Insert sample subscriptions
        const sampleSubscriptions = [
          {
            id: uuidv4(),
            subscription_name: 'Netflix Premium',
            provider: 'netflix',
            amount: 649,
            billing_cycle: 'monthly',
            start_date: '2025-01-20',
            next_renewal_date: '2025-07-20',
            category: 'Entertainment',
            payment_method: 'HDFC Credit Card',
            notification_types: JSON.stringify({ push: true, email: false, sms: false })
          },
          {
            id: uuidv4(),
            subscription_name: 'Spotify Premium',
            provider: 'spotify',
            amount: 119,
            billing_cycle: 'monthly',
            start_date: '2025-02-25',
            next_renewal_date: '2025-07-25',
            category: 'Entertainment',
            payment_method: 'SBI Debit Card',
            notification_types: JSON.stringify({ push: true, email: true, sms: false })
          },
          {
            id: uuidv4(),
            subscription_name: 'Microsoft 365',
            provider: 'microsoft',
            amount: 4199,
            billing_cycle: 'yearly',
            start_date: '2024-12-15',
            next_renewal_date: '2025-12-15',
            category: 'Software',
            payment_method: 'ICICI Credit Card',
            notification_types: JSON.stringify({ push: true, email: true, sms: false })
          }
        ];

        sampleSubscriptions.forEach((sub) => {
          this.db.run(`INSERT INTO subscriptions (
            id, subscription_name, provider, amount, billing_cycle, start_date,
            next_renewal_date, category, payment_method, notification_types
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            sub.id, sub.subscription_name, sub.provider, sub.amount, sub.billing_cycle,
            sub.start_date, sub.next_renewal_date, sub.category, sub.payment_method,
            sub.notification_types
          ]);
        });

        // Insert sample utilities
        const sampleUtilities = [
          {
            id: uuidv4(),
            utility_type: 'electricity',
            provider_name: 'BESCOM',
            account_number: 'BES123456789',
            billing_amount: 2500,
            due_date: '2025-07-18',
            frequency: 'monthly',
            autopay_enabled: 1,
            notification_methods: JSON.stringify({ app: true, email: true, sms: false })
          },
          {
            id: uuidv4(),
            utility_type: 'water',
            provider_name: 'BWSSB',
            account_number: 'BWS987654321',
            billing_amount: 800,
            due_date: '2025-07-22',
            frequency: 'monthly',
            autopay_enabled: 0,
            notification_methods: JSON.stringify({ app: true, email: true, sms: false })
          },
          {
            id: uuidv4(),
            utility_type: 'internet',
            provider_name: 'Airtel Fiber',
            account_number: 'AF456789123',
            billing_amount: 1199,
            due_date: '2025-07-12',
            frequency: 'monthly',
            autopay_enabled: 1,
            notification_methods: JSON.stringify({ app: true, email: false, sms: false })
          }
        ];

        sampleUtilities.forEach((utility) => {
          this.db.run(`INSERT INTO utilities (
            id, utility_type, provider_name, account_number, billing_amount,
            due_date, frequency, autopay_enabled, notification_methods
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            utility.id, utility.utility_type, utility.provider_name, utility.account_number,
            utility.billing_amount, utility.due_date, utility.frequency, utility.autopay_enabled,
            utility.notification_methods
          ]);
        });

        console.log('Sample data inserted successfully');
      }
    });
  }

  // Dashboard methods
  async getDashboardData() {
    return new Promise((resolve, reject) => {
      const dashboardData = {
        totalDues: 0,
        upcomingPayments: [],
        categories: {
          creditCards: 0,
          emis: 0,
          subscriptions: 0,
          insurance: 0,
          utilities: 0,
        }
      };

      // Get EMI count and total
      this.db.get("SELECT COUNT(*) as count, SUM(emi_amount) as total FROM emis WHERE status = 'active'", (err, emiData) => {
        if (err) {
          reject(err);
          return;
        }

        dashboardData.categories.emis = emiData.count || 0;
        dashboardData.totalDues += emiData.total || 0;

        // Get subscription count and total
        this.db.get("SELECT COUNT(*) as count, SUM(amount) as total FROM subscriptions WHERE status = 'active'", (err, subData) => {
          if (err) {
            reject(err);
            return;
          }

          dashboardData.categories.subscriptions = subData.count || 0;
          dashboardData.totalDues += subData.total || 0;

          // Get utility count and total
          this.db.get("SELECT COUNT(*) as count, SUM(billing_amount) as total FROM utilities WHERE status = 'active'", (err, utilityData) => {
            if (err) {
              reject(err);
              return;
            }

            dashboardData.categories.utilities = utilityData.count || 0;
            dashboardData.totalDues += utilityData.total || 0;

            // Get upcoming payments
            this.db.all(`
              SELECT 'EMI' as type, loan_name as title, emi_amount as amount, next_due_date as due_date
              FROM emis WHERE status = 'active'
              UNION ALL
              SELECT 'Subscription' as type, subscription_name as title, amount, next_renewal_date as due_date
              FROM subscriptions WHERE status = 'active'
              UNION ALL
              SELECT 'Utility' as type, provider_name as title, billing_amount as amount, due_date
              FROM utilities WHERE status = 'active'
              ORDER BY due_date ASC
              LIMIT 5
            `, (err, payments) => {
              if (err) {
                reject(err);
                return;
              }

              dashboardData.upcomingPayments = payments.map(payment => ({
                id: Math.random(),
                title: payment.title,
                amount: payment.amount,
                daysLeft: this.calculateDaysLeft(payment.due_date),
                icon: this.getPaymentIcon(payment.type),
                color: this.getPaymentColor(payment.type),
              }));

              resolve(dashboardData);
            });
          });
        });
      });
    });
  }

  calculateDaysLeft(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  getPaymentIcon(type) {
    const icons = {
      'EMI': 'cash',
      'Subscription': 'refresh',
      'Utility': 'bulb',
    };
    return icons[type] || 'card';
  }

  getPaymentColor(type) {
    const colors = {
      'EMI': '#3b82f6',
      'Subscription': '#10b981',
      'Utility': '#8b5cf6',
    };
    return colors[type] || '#6b7280';
  }

  // Bill methods
  async createBill(billData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      this.db.run(`INSERT INTO bills (
        id, bill_name, amount, due_date, category, payment_frequency,
        repeat_frequency, end_date, reminder_enabled, reminder_time,
        reminder_message, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, billData.billName, billData.amount, billData.dueDate, billData.category,
        billData.paymentFrequency, billData.repeatFrequency, billData.endDate,
        billData.reminderEnabled ? 1 : 0, billData.reminderTime,
        billData.reminderMessage, billData.notes
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      });
    });
  }

  async getBills() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM bills ORDER BY due_date ASC", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // EMI methods
  async createEMI(emiData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const nextDueDate = emiData.paymentDate;
      const remainingTenure = emiData.tenure;
      
      this.db.run(`INSERT INTO emis (
        id, loan_name, principal_amount, interest_rate, tenure, emi_amount,
        payment_date, bank_details, remaining_tenure, next_due_date,
        reminder_enabled, reminder_days, notification_methods
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, emiData.loanName, emiData.principalAmount, emiData.interestRate,
        emiData.tenure, emiData.emiAmount, emiData.paymentDate, emiData.bankDetails,
        remainingTenure, nextDueDate, emiData.reminderEnabled ? 1 : 0,
        emiData.reminderDays, JSON.stringify(emiData.notificationMethods)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      });
    });
  }

  async getEMIs() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT 
        id, loan_name as loanName, principal_amount as principalAmount,
        interest_rate as interestRate, emi_amount as amount, bank_details as bankName,
        remaining_tenure as remainingTenure, next_due_date as nextDueDate
        FROM emis WHERE status = 'active' ORDER BY next_due_date ASC`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async payEMI(emiId) {
    return new Promise((resolve, reject) => {
      // In a real app, this would update the next due date and remaining tenure
      this.db.run("UPDATE emis SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [emiId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Subscription methods
  async createSubscription(subscriptionData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      let nextRenewalDate = new Date(subscriptionData.startDate);
      
      if (subscriptionData.billingCycle === 'monthly') {
        nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
      } else if (subscriptionData.billingCycle === 'yearly') {
        nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
      }

      this.db.run(`INSERT INTO subscriptions (
        id, subscription_name, provider, amount, billing_cycle, start_date,
        next_renewal_date, category, payment_method, reminder_enabled,
        reminder_days, notification_types
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, subscriptionData.subscriptionName, subscriptionData.provider,
        subscriptionData.amount, subscriptionData.billingCycle, subscriptionData.startDate,
        nextRenewalDate.toISOString().split('T')[0], subscriptionData.category,
        subscriptionData.paymentMethod, subscriptionData.reminderEnabled ? 1 : 0,
        subscriptionData.reminderDays, JSON.stringify(subscriptionData.notificationTypes)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      });
    });
  }

  async getSubscriptions() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT 
        id, subscription_name as name, provider, amount, billing_cycle as billingCycle,
        next_renewal_date as nextRenewalDate, category, status
        FROM subscriptions ORDER BY next_renewal_date ASC`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async cancelSubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
      this.db.run("UPDATE subscriptions SET status = 'cancelled' WHERE id = ?", [subscriptionId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Utility methods
  async createUtility(utilityData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      
      this.db.run(`INSERT INTO utilities (
        id, utility_type, provider_name, account_number, billing_amount,
        due_date, frequency, reminder_enabled, reminder_days,
        notification_methods, autopay_enabled, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, utilityData.utilityType, utilityData.providerName, utilityData.accountNumber,
        utilityData.billingAmount, utilityData.dueDate, utilityData.frequency,
        utilityData.reminderEnabled ? 1 : 0, utilityData.reminderDays,
        JSON.stringify(utilityData.notificationMethods), utilityData.autopayEnabled ? 1 : 0,
        utilityData.notes
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(id);
        }
      });
    });
  }

  async getUtilities() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT 
        id, utility_type as type, provider_name as providerName,
        account_number as accountNumber, billing_amount as amount,
        due_date as dueDate, frequency, autopay_enabled as autopayEnabled,
        reminder_enabled as reminderEnabled
        FROM utilities WHERE status = 'active' ORDER BY due_date ASC`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            autopayEnabled: Boolean(row.autopayEnabled),
            reminderEnabled: Boolean(row.reminderEnabled)
          })));
        }
      });
    });
  }

  async payUtility(utilityId) {
    return new Promise((resolve, reject) => {
      this.db.run("UPDATE utilities SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [utilityId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Loan application methods
  async submitLoanApplication(applicationData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const applicationId = `LOAN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;
      
      this.db.run(`INSERT INTO loan_applications (
        id, loan_type, loan_amount, loan_tenure, personal_details,
        employment_details, bank_details, emi, total_amount, total_interest
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        id, applicationData.loanType, applicationData.loanAmount, applicationData.loanTenure,
        JSON.stringify(applicationData.personalDetails), JSON.stringify(applicationData.employmentDetails),
        JSON.stringify(applicationData.bankDetails), applicationData.emi,
        applicationData.totalAmount, applicationData.totalInterest
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(applicationId);
        }
      });
    });
  }

  // Recharge methods
  async processRecharge(rechargeData) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const transactionId = `IRIS${Date.now()}`;
      
      this.db.run(`INSERT INTO recharge_history (
        id, mobile_number, operator, recharge_type, amount, payment_method, transaction_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        id, rechargeData.mobileNumber, rechargeData.operator, rechargeData.rechargeType,
        rechargeData.amount, rechargeData.paymentMethod, transactionId
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(transactionId);
        }
      });
    });
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = Database;
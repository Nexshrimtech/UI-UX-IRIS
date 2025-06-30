import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock data for development
const mockData = {
  dashboard: {
    totalDues: 12458.90,
    upcomingPayments: [
      {
        id: 1,
        title: 'HDFC Credit Card',
        amount: 4250,
        daysLeft: 3,
        icon: 'card',
        color: '#3b82f6',
      },
      {
        id: 2,
        title: 'Netflix Subscription',
        amount: 649,
        daysLeft: 5,
        icon: 'tv',
        color: '#10b981',
      },
      {
        id: 3,
        title: 'Airtel Broadband',
        amount: 1199,
        daysLeft: 7,
        icon: 'wifi',
        color: '#8b5cf6',
      },
    ],
    categories: {
      creditCards: 3,
      emis: 2,
      subscriptions: 5,
      insurance: 2,
      utilities: 4,
    },
  },
  emis: [
    {
      id: 1,
      loanName: 'Home Loan',
      bankName: 'HDFC Bank',
      amount: 45000,
      principalAmount: 2500000,
      interestRate: 8.5,
      remainingTenure: 180,
      nextDueDate: '2025-07-15',
    },
    {
      id: 2,
      loanName: 'Car Loan',
      bankName: 'SBI',
      amount: 18500,
      principalAmount: 800000,
      interestRate: 9.2,
      remainingTenure: 36,
      nextDueDate: '2025-07-10',
    },
  ],
  subscriptions: [
    {
      id: 1,
      name: 'Netflix Premium',
      provider: 'netflix',
      amount: 649,
      billingCycle: 'monthly',
      nextRenewalDate: '2025-07-20',
      category: 'Entertainment',
      status: 'active',
    },
    {
      id: 2,
      name: 'Spotify Premium',
      provider: 'spotify',
      amount: 119,
      billingCycle: 'monthly',
      nextRenewalDate: '2025-07-25',
      category: 'Entertainment',
      status: 'active',
    },
    {
      id: 3,
      name: 'Microsoft 365',
      provider: 'microsoft',
      amount: 4199,
      billingCycle: 'yearly',
      nextRenewalDate: '2025-12-15',
      category: 'Software',
      status: 'active',
    },
  ],
  utilities: [
    {
      id: 1,
      type: 'electricity',
      providerName: 'BESCOM',
      accountNumber: 'BES123456789',
      amount: 2500,
      dueDate: '2025-07-18',
      frequency: 'monthly',
      autopayEnabled: true,
      reminderEnabled: true,
    },
    {
      id: 2,
      type: 'water',
      providerName: 'BWSSB',
      accountNumber: 'BWS987654321',
      amount: 800,
      dueDate: '2025-07-22',
      frequency: 'monthly',
      autopayEnabled: false,
      reminderEnabled: true,
    },
    {
      id: 3,
      type: 'internet',
      providerName: 'Airtel Fiber',
      accountNumber: 'AF456789123',
      amount: 1199,
      dueDate: '2025-07-12',
      frequency: 'monthly',
      autopayEnabled: true,
      reminderEnabled: true,
    },
  ],
};

export const apiService = {
  // Dashboard
  getDashboardData: async () => {
    try {
      // In production, this would be: const response = await api.get('/dashboard');
      // For now, return mock data
      return mockData.dashboard;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return mockData.dashboard; // Fallback to mock data
    }
  },

  // Bills
  createBill: async (billData) => {
    try {
      const response = await api.post('/bills', billData);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      // Simulate success for demo
      return { success: true, id: Date.now() };
    }
  },

  getBills: async () => {
    try {
      const response = await api.get('/bills');
      return response.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  },

  // EMIs
  createEMI: async (emiData) => {
    try {
      const response = await api.post('/emis', emiData);
      return response.data;
    } catch (error) {
      console.error('Error creating EMI:', error);
      return { success: true, id: Date.now() };
    }
  },

  getEMIs: async () => {
    try {
      const response = await api.get('/emis');
      return response.data;
    } catch (error) {
      console.error('Error fetching EMIs:', error);
      return mockData.emis;
    }
  },

  payEMI: async (emiId) => {
    try {
      const response = await api.post(`/emis/${emiId}/pay`);
      return response.data;
    } catch (error) {
      console.error('Error paying EMI:', error);
      return { success: true };
    }
  },

  // Subscriptions
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: true, id: Date.now() };
    }
  },

  getSubscriptions: async () => {
    try {
      const response = await api.get('/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return mockData.subscriptions;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: true };
    }
  },

  // Utilities
  createUtility: async (utilityData) => {
    try {
      const response = await api.post('/utilities', utilityData);
      return response.data;
    } catch (error) {
      console.error('Error creating utility:', error);
      return { success: true, id: Date.now() };
    }
  },

  getUtilities: async () => {
    try {
      const response = await api.get('/utilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching utilities:', error);
      return mockData.utilities;
    }
  },

  payUtility: async (utilityId) => {
    try {
      const response = await api.post(`/utilities/${utilityId}/pay`);
      return response.data;
    } catch (error) {
      console.error('Error paying utility:', error);
      return { success: true };
    }
  },

  // Loan Application
  submitLoanApplication: async (applicationData) => {
    try {
      const response = await api.post('/loans/apply', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error submitting loan application:', error);
      return { success: true, applicationId: 'LOAN-29062025-7854' };
    }
  },

  // Mobile Recharge
  processRecharge: async (rechargeData) => {
    try {
      const response = await api.post('/recharge', rechargeData);
      return response.data;
    } catch (error) {
      console.error('Error processing recharge:', error);
      return { success: true, transactionId: 'IRIS123456789' };
    }
  },
};
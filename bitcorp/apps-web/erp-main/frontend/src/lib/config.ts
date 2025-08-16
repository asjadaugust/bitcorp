export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  ENDPOINTS: {
    AUTH: '/api/v1/auth',
    IOT: '/api/v1/iot',
    EQUIPMENT: '/api/v1/equipment',
    USERS: '/api/v1/users',
    ANALYTICS: '/api/v1/analytics',
  },
} as const;

export const IOT_CONFIG = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  ALERT_REFRESH_INTERVAL: 10000, // 10 seconds
  HEALTH_THRESHOLDS: {
    EXCELLENT: 90,
    GOOD: 75,
    FAIR: 60,
    POOR: 40,
  },
  RISK_LEVELS: {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  },
} as const;

export const SUBSCRIPTION_CONFIG = {
  BASIC: {
    name: 'Basic Plan',
    price: 9900, // ₹99/month
    features: ['Basic Equipment Management', 'User Management', 'Reports'],
  },
  PREMIUM: {
    name: 'Premium IoT Plan',
    price: 29900, // ₹299/month
    features: [
      'All Basic Features',
      'IoT Equipment Monitoring',
      'Predictive Maintenance',
      'Real-time Alerts',
      'Advanced Analytics',
      'Cost Savings Tracking',
    ],
  },
} as const;

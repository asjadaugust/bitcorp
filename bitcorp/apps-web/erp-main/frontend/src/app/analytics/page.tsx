/**
 * Analytics Dashboard Page - Basic version
 * Displays token-gated analytics and premium features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TokenBalance {
  tier: string;
  token_balance: number;
  is_active: boolean;
  expires_at: string | null;
  days_remaining: number | null;
}

interface UtilizationData {
  equipment_id: number;
  equipment_name: string;
  total_hours: number;
  utilization_percentage: number;
  revenue_generated: string;
  efficiency_score: number;
}

interface AIInsight {
  insight_type: string;
  title: string;
  description: string;
  impact_score: number;
  recommended_actions: string[];
  data_points: Record<string, string | number>;
}

export default function AnalyticsDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [utilizationData, setUtilizationData] = useState<UtilizationData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');

  // Redirect to marketing page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to marketing site
      window.location.href = '/marketing-site/index.html';
    }
  }, [isAuthenticated, isLoading]);

  // Mock token balance
  useEffect(() => {
    if (isAuthenticated) {
      setTokenBalance({
        tier: 'professional',
        token_balance: 342,
        is_active: true,
        expires_at: '2024-02-15T00:00:00Z',
        days_remaining: 22,
      });
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔄</div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔐</div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleGenerateReport = async (
    reportType: string,
    tokenCost: number
  ) => {
    if (!tokenBalance || tokenBalance.token_balance < tokenCost) {
      setMessage(
        `Insufficient tokens! Need ${tokenCost} tokens. Current balance: ${
          tokenBalance?.token_balance || 0
        }`
      );
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update token balance
      setTokenBalance((prev) =>
        prev
          ? {
              ...prev,
              token_balance: prev.token_balance - tokenCost,
            }
          : null
      );

      // Generate mock data based on report type
      if (reportType === 'utilization') {
        setUtilizationData([
          {
            equipment_id: 1,
            equipment_name: 'CAT 320 Excavator',
            total_hours: 156.5,
            utilization_percentage: 87.2,
            revenue_generated: '7825.00',
            efficiency_score: 8.7,
          },
          {
            equipment_id: 2,
            equipment_name: 'John Deere 850K',
            total_hours: 143.2,
            utilization_percentage: 79.8,
            revenue_generated: '7160.00',
            efficiency_score: 8.0,
          },
          {
            equipment_id: 3,
            equipment_name: 'Komatsu PC290',
            total_hours: 134.8,
            utilization_percentage: 75.1,
            revenue_generated: '6740.00',
            efficiency_score: 7.5,
          },
        ]);
        setActiveTab('utilization');
      } else if (reportType === 'ai-insights') {
        setAiInsights([
          {
            insight_type: 'utilization_optimization',
            title: 'Equipment Utilization Opportunities',
            description:
              'Analysis shows potential for 20% improvement in equipment utilization through better scheduling.',
            impact_score: 8,
            recommended_actions: [
              'Implement dynamic scheduling system',
              'Cross-train operators on multiple equipment types',
              'Consider equipment sharing between projects',
            ],
            data_points: {
              current_utilization: '65%',
              potential_utilization: '85%',
              estimated_revenue_increase: '$45,000',
            },
          },
          {
            insight_type: 'maintenance_optimization',
            title: 'Predictive Maintenance Opportunity',
            description:
              'Machine learning models predict 15% cost reduction through optimized maintenance scheduling.',
            impact_score: 7,
            recommended_actions: [
              'Implement IoT sensors for real-time monitoring',
              'Adopt predictive maintenance software',
              'Train maintenance team on data analysis',
            ],
            data_points: {
              potential_savings: '$23,500',
              downtime_reduction: '25%',
              maintenance_efficiency: '85%',
            },
          },
        ]);
        setActiveTab('insights');
      }

      setMessage(
        `${reportType} report completed! ${tokenCost} tokens consumed.`
      );
    } catch {
      setMessage('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced equipment insights and reporting
            </p>
          </div>

          {/* Token Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6 w-64">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪙</span>
              <h3 className="text-lg font-semibold">Token Balance</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {tokenBalance?.token_balance || 0}
            </div>
            <div className="text-sm text-gray-500">
              {tokenBalance?.tier} plan
            </div>
            {tokenBalance?.expires_at && (
              <div className="text-xs text-gray-400 mt-1">
                Expires in {tokenBalance.days_remaining} days
              </div>
            )}
            <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Buy More Tokens
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">{message}</p>
            <button
              onClick={() => setMessage('')}
              className="text-blue-600 text-sm mt-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <h3 className="text-lg font-semibold">Utilization Report</h3>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                🪙 5 tokens
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Analyze equipment efficiency and revenue generation
            </p>
            <button
              onClick={() => handleGenerateReport('utilization', 5)}
              disabled={loading || (tokenBalance?.token_balance || 0) < 5}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🤖</span>
                <h3 className="text-lg font-semibold">AI Insights</h3>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                🪙 10 tokens
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Machine learning powered business recommendations
            </p>
            <button
              onClick={() => handleGenerateReport('ai-insights', 10)}
              disabled={loading || (tokenBalance?.token_balance || 0) < 10}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Get AI Insights'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <h3 className="text-lg font-semibold">Custom Dashboard</h3>
              </div>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                🪙 8 tokens
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Build personalized analytics dashboard
            </p>
            <button
              onClick={() => handleGenerateReport('dashboard', 8)}
              disabled={loading || (tokenBalance?.token_balance || 0) < 8}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Building...' : 'Customize Dashboard'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['overview', 'utilization', 'insights'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    📊 Welcome to the Analytics Dashboard! Use your tokens to
                    unlock powerful insights about your equipment fleet. Each
                    feature provides valuable data to optimize your operations
                    and increase profitability.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Equipment
                    </h4>
                    <div className="text-2xl font-bold text-gray-900">24</div>
                    <p className="text-xs text-gray-500">+2 from last month</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Average Utilization
                    </h4>
                    <div className="text-2xl font-bold text-gray-900">
                      78.5%
                    </div>
                    <p className="text-xs text-gray-500">
                      +5.2% from last month
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Monthly Revenue
                    </h4>
                    <div className="text-2xl font-bold text-gray-900">
                      $45,780
                    </div>
                    <p className="text-xs text-gray-500">
                      +12.3% from last month
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Efficiency Score
                    </h4>
                    <div className="text-2xl font-bold text-gray-900">
                      8.2/10
                    </div>
                    <p className="text-xs text-gray-500">
                      +0.3 from last month
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Utilization Tab */}
            {activeTab === 'utilization' && (
              <div className="space-y-4">
                {utilizationData.length > 0 ? (
                  <>
                    <h3 className="text-xl font-semibold">
                      Equipment Utilization Report
                    </h3>
                    {utilizationData.map((item) => (
                      <div
                        key={item.equipment_id}
                        className="bg-gray-50 rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {item.equipment_name}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {item.total_hours} hours |{' '}
                              {item.utilization_percentage.toFixed(1)}%
                              utilization
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-green-600">
                              ${item.revenue_generated}
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              Score: {item.efficiency_score}/10
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${item.utilization_percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      ⚠️ No utilization data available. Generate a utilization
                      report to see detailed equipment analytics.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                {aiInsights.length > 0 ? (
                  <>
                    <h3 className="text-xl font-semibold">
                      AI-Powered Insights
                    </h3>
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-semibold">
                            {insight.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              insight.impact_score >= 8
                                ? 'bg-red-100 text-red-800'
                                : insight.impact_score >= 6
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            Impact: {insight.impact_score}/10
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">
                          {insight.description}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">
                              Recommended Actions:
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {insight.recommended_actions.map(
                                (action, idx) => (
                                  <li key={idx}>{action}</li>
                                )
                              )}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-medium mb-2">
                              Key Data Points:
                            </h5>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {Object.entries(insight.data_points).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-white rounded p-2"
                                  >
                                    <span className="text-gray-500">
                                      {key.replace(/_/g, ' ')}:{' '}
                                    </span>
                                    <span className="font-medium">{value}</span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      ⚠️ No AI insights available. Generate AI insights to see
                      machine learning powered recommendations for your
                      business.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

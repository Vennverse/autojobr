import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Calendar,
  Award,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { applicationService } from '../services/applicationService';

interface AnalyticsProps {
  user: UserProfile;
}

const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    reviewing: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, [user.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const applicationStats = await applicationService.getApplicationStats(user.id);
      setStats(applicationStats);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (in production, this would come from the database)
  const applicationData = [
    { month: 'Jan', applications: 12, responses: 3 },
    { month: 'Feb', applications: 18, responses: 5 },
    { month: 'Mar', applications: 25, responses: 8 },
    { month: 'Apr', applications: 15, responses: 4 },
    { month: 'May', applications: 22, responses: 7 },
    { month: 'Jun', applications: 30, responses: 12 }
  ];

  const statusData = [
    { name: 'Applied', value: stats.applied, color: '#3B82F6' },
    { name: 'Reviewing', value: stats.reviewing, color: '#F59E0B' },
    { name: 'Interview', value: stats.interview, color: '#8B5CF6' },
    { name: 'Offer', value: stats.offer, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' }
  ];

  const responseTimeData = [
    { week: 'Week 1', avgTime: 5.2 },
    { week: 'Week 2', avgTime: 4.8 },
    { week: 'Week 3', avgTime: 6.1 },
    { week: 'Week 4', avgTime: 4.5 },
    { week: 'Week 5', avgTime: 5.8 },
    { week: 'Week 6', avgTime: 4.2 }
  ];

  const responseRate = stats.total > 0 ? Math.round(((stats.interview + stats.offer) / stats.total) * 100) : 0;
  const successRate = stats.total > 0 ? Math.round((stats.offer / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analytics</h3>
            <p className="text-gray-600">Analyzing your job search performance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Analytics</h1>
        <p className="text-gray-600">
          Welcome back, {user.personalDetails.firstName}! Track your job search performance and optimize your strategy.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{responseRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+5% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">4.8 days</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">-0.3 days improvement</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Applications vs Responses */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications vs Responses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
              <Bar dataKey="responses" fill="#10B981" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData.filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Trend */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Response Time Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="avgTime" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Avg Response Time (days)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI-Powered Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Your response rate has improved by 5% this month. Keep up the personalized applications!
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Tuesday applications get 23% higher response rates based on your data.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Consider targeting mid-size companies (50-200 employees) for better success rates.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Your interview conversion rate is above average. Focus on getting more interviews!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
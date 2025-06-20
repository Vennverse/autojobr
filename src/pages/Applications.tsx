import React, { useState, useEffect } from 'react';
import { Filter, Calendar, BarChart3, Plus, Loader2 } from 'lucide-react';
import ApplicationCard from '../components/Applications/ApplicationCard';
import { Application, UserProfile } from '../types';
import { applicationService } from '../services/applicationService';

interface ApplicationsProps {
  user: UserProfile;
}

const Applications: React.FC<ApplicationsProps> = ({ user }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    reviewing: 0,
    interview: 0,
    offer: 0,
    rejected: 0
  });

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [user.id]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const userApplications = await applicationService.getUserApplications(user.id);
      setApplications(userApplications);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const applicationStats = await applicationService.getApplicationStats(user.id);
      setStats(applicationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const filteredApplications = applications.filter((application) => {
    return !statusFilter || application.status === statusFilter;
  });

  const handleEdit = (applicationId: string) => {
    console.log('Editing application:', applicationId);
    // Handle edit logic
  };

  const handleDelete = async (applicationId: string) => {
    try {
      await applicationService.deleteApplication(applicationId, user.id);
      await loadApplications();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Applications</h3>
            <p className="text-gray-600">Fetching your application history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
          <p className="text-gray-600">
            Welcome back, {user.personalDetails.firstName}! Track and manage all your job applications.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.applied}
          </div>
          <div className="text-sm text-gray-600">Applied</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {stats.reviewing}
          </div>
          <div className="text-sm text-gray-600">Reviewing</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {stats.interview}
          </div>
          <div className="text-sm text-gray-600">Interview</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.offer}
          </div>
          <div className="text-sm text-gray-600">Offers</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {stats.rejected}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            {statusFilter && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter('')}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="applied">Applied</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter
              ? `No applications with status "${statusFilter}"`
              : "You haven't submitted any applications yet."}
          </p>
          <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add First Application</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Applications;
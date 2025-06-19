import React, { useState } from 'react';
import { Filter, Calendar, BarChart3, Plus } from 'lucide-react';
import ApplicationCard from '../components/Applications/ApplicationCard';
import { mockApplications } from '../utils/mockData';
import { Application } from '../types';

const Applications: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredApplications = mockApplications.filter((application) => {
    return !statusFilter || application.status === statusFilter;
  });

  const statusCounts = mockApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleEdit = (applicationId: string) => {
    console.log('Editing application:', applicationId);
    // Handle edit logic
  };

  const handleDelete = (applicationId: string) => {
    console.log('Deleting application:', applicationId);
    // Handle delete logic
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Tracker</h1>
          <p className="text-gray-600">Manage and track all your job applications</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          <span>New Application</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {mockApplications.length}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {statusCounts.applied || 0}
          </div>
          <div className="text-sm text-gray-600">Applied</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {statusCounts.reviewing || 0}
          </div>
          <div className="text-sm text-gray-600">Reviewing</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {statusCounts.interview || 0}
          </div>
          <div className="text-sm text-gray-600">Interview</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {statusCounts.offer || 0}
          </div>
          <div className="text-sm text-gray-600">Offers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
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
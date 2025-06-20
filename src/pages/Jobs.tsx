import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, DollarSign, Loader2 } from 'lucide-react';
import JobCard from '../components/Jobs/JobCard';
import { Job, UserProfile } from '../types';
import { jobService } from '../services/jobService';

interface JobsProps {
  user: UserProfile;
}

const Jobs: React.FC<JobsProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('');
  const [salaryFilter, setSalaryFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const fetchedJobs = await jobService.fetchJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !locationFilter || 
                           job.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
                           (locationFilter.toLowerCase() === 'remote' && job.remote);
    
    const matchesJobType = !jobTypeFilter || job.type === jobTypeFilter;
    
    const matchesSalary = !salaryFilter || 
                         (job.salary && job.salary.min >= parseInt(salaryFilter));

    return matchesSearch && matchesLocation && matchesJobType && matchesSalary;
  });

  const handleApply = (jobId: string) => {
    console.log('Applying to job:', jobId);
    // Handle application logic
  };

  const handleSave = (jobId: string) => {
    console.log('Saving job:', jobId);
    // Handle save logic
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Jobs</h3>
            <p className="text-gray-600">Finding the best opportunities for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
        <p className="text-gray-600">
          Welcome back, {user.personalDetails.firstName}! Discover jobs that match your skills and preferences.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search jobs, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Location or Remote"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <select
                  value={salaryFilter}
                  onChange={(e) => setSalaryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Salary</option>
                  <option value="50000">$50,000+</option>
                  <option value="75000">$75,000+</option>
                  <option value="100000">$100,000+</option>
                  <option value="150000">$150,000+</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setLocationFilter('');
                    setJobTypeFilter('');
                    setSalaryFilter('');
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Showing {filteredJobs.length} jobs
          {searchTerm && ` for "${searchTerm}"`}
        </p>
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option>Most Recent</option>
          <option>Best Match</option>
          <option>Salary: High to Low</option>
          <option>Salary: Low to High</option>
        </select>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onApply={handleApply}
            onSave={handleSave}
          />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or clearing filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
};

export default Jobs;
import React from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  ExternalLink,
  Clock,
  Bookmark
} from 'lucide-react';
import { Job } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  applied?: boolean;
  saved?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onApply, 
  onSave, 
  applied = false, 
  saved = false 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">{job.company}</p>
          </div>
        </div>
        <button
          onClick={() => onSave?.(job.id)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            saved 
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          )}
        >
          <Bookmark className={clsx('w-5 h-5', saved && 'fill-current')} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
          {job.remote && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full ml-2">
              Remote
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDistanceToNow(job.postedDate, { addSuffix: true })}</span>
        </div>
        {job.salary && (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4" />
            <span>
              ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 3 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
            +{job.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className={clsx(
          'px-3 py-1 text-sm rounded-full',
          job.type === 'full-time' && 'bg-blue-100 text-blue-700',
          job.type === 'part-time' && 'bg-green-100 text-green-700',
          job.type === 'contract' && 'bg-yellow-100 text-yellow-700',
          job.type === 'internship' && 'bg-purple-100 text-purple-700'
        )}>
          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
        </span>
        
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            onClick={() => onApply?.(job.id)}
            disabled={applied}
            className={clsx(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              applied
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>{applied ? 'Applied' : 'Quick Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
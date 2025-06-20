import React from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  ExternalLink,
  Edit3,
  Trash2
} from 'lucide-react';
import { Application } from '../../types';
import { formatDistanceToNow, format } from 'date-fns';
import { clsx } from 'clsx';

interface ApplicationCardProps {
  application: Application;
  onEdit?: (applicationId: string) => void;
  onDelete?: (applicationId: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'offer':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.job.title}
          </h3>
          <p className="text-gray-600 font-medium">{application.job.company}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'px-3 py-1 text-sm rounded-full font-medium',
            getStatusColor(application.status)
          )}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit?.(application.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(application.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>{application.job.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Applied {formatDistanceToNow(application.appliedDate, { addSuffix: true })}</span>
        </div>
        {application.job.salary && (
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>
              ${application.job.salary.min.toLocaleString()} - ${application.job.salary.max.toLocaleString()}
            </span>
          </div>
        )}
        {application.interviewDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-purple-600 font-medium">
              Interview: {format(application.interviewDate, 'MMM d, yyyy')}
            </span>
          </div>
        )}
      </div>

      {application.notes && (
        <div className="mb-4">
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
            {application.notes}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {application.documents.resume && (
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Resume</span>
            </div>
          )}
          {application.documents.coverLetter && (
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Cover Letter</span>
            </div>
          )}
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <ExternalLink className="w-4 h-4" />
          <span>View Job</span>
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
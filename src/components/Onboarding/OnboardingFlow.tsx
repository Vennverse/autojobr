import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase, 
  MapPin,
  DollarSign,
  Shield,
  Settings
} from 'lucide-react';
import { parseResume } from '../../services/resumeParser';
import { ResumeParseResult } from '../../services/groqService';
import { UserProfile } from '../../types';

interface OnboardingFlowProps {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeParseResult, setResumeParseResult] = useState<ResumeParseResult | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsParsingResume(true);
    try {
      const result = await parseResume(file);
      setResumeParseResult(result);
      
      // Pre-fill form with parsed data
      if (result.personalDetails.firstName) setValue('firstName', result.personalDetails.firstName);
      if (result.personalDetails.lastName) setValue('lastName', result.personalDetails.lastName);
      if (result.personalDetails.email) setValue('email', result.personalDetails.email);
      if (result.personalDetails.phone) setValue('phone', result.personalDetails.phone);
      if (result.personalDetails.linkedinUrl) setValue('linkedinUrl', result.personalDetails.linkedinUrl);
      if (result.personalDetails.portfolioUrl) setValue('portfolioUrl', result.personalDetails.portfolioUrl);
      
      // Professional details
      if (result.professionalDetails.currentCompany) setValue('currentCompany', result.professionalDetails.currentCompany);
      if (result.professionalDetails.currentJobTitle) setValue('currentJobTitle', result.professionalDetails.currentJobTitle);
      if (result.professionalDetails.experienceYears) setValue('experienceYears', result.professionalDetails.experienceYears);
      
      setCurrentStep(1);
    } catch (error) {
      console.error('Resume parsing failed:', error);
      alert('Failed to parse resume. Please fill the form manually.');
      setCurrentStep(1);
    } finally {
      setIsParsingResume(false);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const steps = [
    {
      id: 'resume',
      title: 'Upload Resume',
      description: 'Upload your resume to auto-fill your profile',
      icon: Upload
    },
    {
      id: 'personal',
      title: 'Personal Details',
      description: 'Verify and complete your personal information',
      icon: User
    },
    {
      id: 'professional',
      title: 'Professional Info',
      description: 'Add your work experience and skills',
      icon: Briefcase
    },
    {
      id: 'authorization',
      title: 'Work Authorization',
      description: 'Provide work eligibility information',
      icon: Shield
    },
    {
      id: 'preferences',
      title: 'Job Preferences',
      description: 'Set your job search preferences',
      icon: Settings
    }
  ];

  const handleStepSubmit = (data: any) => {
    setUserProfile(prev => ({ ...prev, ...data }));
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      const completeProfile: Partial<UserProfile> = {
        ...userProfile,
        ...data,
        isOnboarded: true,
        documents: {
          resumeText: resumeParseResult?.extractedText
        }
      };
      onComplete(completeProfile);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 transition-colors cursor-pointer ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {isParsingResume ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-lg font-medium text-gray-900">Parsing your resume...</p>
                    <p className="text-gray-600">This may take a few seconds</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                    </p>
                    <p className="text-gray-600 mb-4">
                      Drag and drop or click to select (PDF, DOCX, TXT)
                    </p>
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {resumeParseResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Resume parsed successfully! ({resumeParseResult.confidence}% confidence)
                  </span>
                </div>
                {resumeParseResult.missingFields.length > 0 && (
                  <p className="text-sm text-green-700 mt-2">
                    We'll ask you about: {resumeParseResult.missingFields.join(', ')}
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={() => setCurrentStep(1)}
              className="mt-6 px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Skip and fill manually
            </button>
          </div>
        );

      case 1:
        return (
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message as string}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message as string}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  {...register('city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  {...register('state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  {...register('country')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                {...register('linkedinUrl')}
                placeholder="https://linkedin.com/in/yourprofile"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio/Website URL
              </label>
              <input
                type="url"
                {...register('portfolioUrl')}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Company
              </label>
              <input
                {...register('currentCompany')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Job Title
              </label>
              <input
                {...register('currentJobTitle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <select
                {...register('experienceYears', { required: 'Experience is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select experience</option>
                <option value="0">0-1 years</option>
                <option value="2">2-3 years</option>
                <option value="4">4-5 years</option>
                <option value="6">6-8 years</option>
                <option value="9">9-12 years</option>
                <option value="13">13+ years</option>
              </select>
              {errors.experienceYears && (
                <p className="text-red-600 text-sm mt-1">{errors.experienceYears.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma-separated)
              </label>
              <textarea
                {...register('skills')}
                placeholder="React, JavaScript, Python, AWS, etc."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Industry
              </label>
              <select
                {...register('currentIndustry')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="consulting">Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country where you want to work *
              </label>
              <select
                {...register('countryOfWork', { required: 'Country is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="IN">India</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="other">Other</option>
              </select>
              {errors.countryOfWork && (
                <p className="text-red-600 text-sm mt-1">{errors.countryOfWork.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Are you legally authorized to work in this country? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('legallyAuthorized', { required: 'This field is required' })}
                    value="yes"
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('legallyAuthorized', { required: 'This field is required' })}
                    value="no"
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {errors.legallyAuthorized && (
                <p className="text-red-600 text-sm mt-1">{errors.legallyAuthorized.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Will you now or in the future require visa sponsorship? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('requiresSponsorship', { required: 'This field is required' })}
                    value="yes"
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('requiresSponsorship', { required: 'This field is required' })}
                    value="no"
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {errors.requiresSponsorship && (
                <p className="text-red-600 text-sm mt-1">{errors.requiresSponsorship.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Work Authorization Status
              </label>
              <select
                {...register('currentStatus')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="h1b">H1B</option>
                <option value="f1">F1 Student</option>
                <option value="opt">OPT</option>
                <option value="cpt">CPT</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        );

      case 4:
        return (
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Period / Earliest Start Date *
              </label>
              <select
                {...register('noticePeriod', { required: 'Notice period is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select notice period</option>
                <option value="immediate">Immediate</option>
                <option value="2_weeks">2 weeks</option>
                <option value="1_month">1 month</option>
                <option value="2_months">2 months</option>
                <option value="3_months">3 months</option>
              </select>
              {errors.noticePeriod && (
                <p className="text-red-600 text-sm mt-1">{errors.noticePeriod.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Willing to relocate? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('willingToRelocate', { required: 'This field is required' })}
                    value="yes"
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('willingToRelocate', { required: 'This field is required' })}
                    value="no"
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              {errors.willingToRelocate && (
                <p className="text-red-600 text-sm mt-1">{errors.willingToRelocate.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Salary (Min)
                </label>
                <input
                  type="number"
                  {...register('salaryMin')}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Salary (Max)
                </label>
                <input
                  type="number"
                  {...register('salaryMax')}
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type Preferences (select all that apply)
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('employmentTypes')}
                    value="full-time"
                    className="mr-2"
                  />
                  Full-time
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('employmentTypes')}
                    value="part-time"
                    className="mr-2"
                  />
                  Part-time
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('employmentTypes')}
                    value="contract"
                    className="mr-2"
                  />
                  Contract
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('employmentTypes')}
                    value="internship"
                    className="mr-2"
                  />
                  Internship
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remote Work Preference
              </label>
              <select
                {...register('remotePreference')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="flexible">Flexible</option>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site Only</option>
              </select>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
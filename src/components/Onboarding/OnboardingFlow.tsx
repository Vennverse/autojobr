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
  Settings,
  Loader2
} from 'lucide-react';
import { parseResume } from '../../services/resumeParser';
import { ResumeParseResult } from '../../services/groqService';
import { UserProfile } from '../../types';

interface OnboardingFlowProps {
  onComplete: (profile: Partial<UserProfile>) => void;
  initialData?: UserProfile;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeParseResult, setResumeParseResult] = useState<ResumeParseResult | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>(initialData || {});

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: initialData?.personalDetails?.firstName || '',
      lastName: initialData?.personalDetails?.lastName || '',
      email: initialData?.personalDetails?.email || initialData?.email || '',
      phone: initialData?.personalDetails?.phone || '',
      city: initialData?.personalDetails?.currentAddress?.city || '',
      state: initialData?.personalDetails?.currentAddress?.state || '',
      country: initialData?.personalDetails?.currentAddress?.country || '',
      zipCode: initialData?.personalDetails?.currentAddress?.zipCode || '',
      linkedinUrl: initialData?.personalDetails?.linkedinUrl || '',
      portfolioUrl: initialData?.personalDetails?.portfolioUrl || '',
      currentCompany: initialData?.professionalDetails?.currentCompany || '',
      currentJobTitle: initialData?.professionalDetails?.currentJobTitle || '',
      experienceYears: initialData?.professionalDetails?.experienceYears || 0,
      skills: initialData?.professionalDetails?.skills?.join(', ') || '',
      currentIndustry: initialData?.professionalDetails?.currentIndustry || '',
      countryOfWork: initialData?.workAuthorization?.countryOfWork || '',
      legallyAuthorized: initialData?.workAuthorization?.legallyAuthorized ? 'yes' : 'no',
      requiresSponsorship: initialData?.workAuthorization?.requiresSponsorship ? 'yes' : 'no',
      currentStatus: initialData?.workAuthorization?.currentStatus || 'citizen',
      noticePeriod: initialData?.employmentPreferences?.noticePeriod || '',
      willingToRelocate: initialData?.employmentPreferences?.willingToRelocate ? 'yes' : 'no',
      salaryMin: initialData?.employmentPreferences?.desiredSalary?.min || 0,
      salaryMax: initialData?.employmentPreferences?.desiredSalary?.max || 0,
      employmentTypes: initialData?.employmentPreferences?.employmentTypes || [],
      remotePreference: initialData?.employmentPreferences?.remotePreference || 'flexible'
    }
  });

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
      if (result.professionalDetails.skills) setValue('skills', result.professionalDetails.skills.join(', '));
      
      // Address
      if (result.personalDetails.address?.city) setValue('city', result.personalDetails.address.city);
      if (result.personalDetails.address?.state) setValue('state', result.personalDetails.address.state);
      if (result.personalDetails.address?.country) setValue('country', result.personalDetails.address.country);
      
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
      description: 'Upload your resume to auto-fill your profile with AI',
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
    const stepData = { ...userProfile };
    
    if (currentStep === 1) {
      // Personal details
      stepData.personalDetails = {
        ...stepData.personalDetails,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        currentAddress: {
          city: data.city,
          state: data.state,
          country: data.country,
          zipCode: data.zipCode
        },
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl
      };
    } else if (currentStep === 2) {
      // Professional details
      stepData.professionalDetails = {
        ...stepData.professionalDetails,
        currentCompany: data.currentCompany,
        currentJobTitle: data.currentJobTitle,
        currentIndustry: data.currentIndustry,
        experienceYears: parseInt(data.experienceYears),
        skills: data.skills ? data.skills.split(',').map((s: string) => s.trim()) : [],
        education: stepData.professionalDetails?.education || [],
        certifications: stepData.professionalDetails?.certifications || [],
        languages: stepData.professionalDetails?.languages || []
      };
    } else if (currentStep === 3) {
      // Work authorization
      stepData.workAuthorization = {
        countryOfWork: data.countryOfWork,
        legallyAuthorized: data.legallyAuthorized === 'yes',
        requiresSponsorship: data.requiresSponsorship === 'yes',
        currentStatus: data.currentStatus,
        statusDetails: data.statusDetails || ''
      };
    } else if (currentStep === 4) {
      // Employment preferences
      stepData.employmentPreferences = {
        noticePeriod: data.noticePeriod,
        earliestStartDate: new Date(),
        willingToRelocate: data.willingToRelocate === 'yes',
        desiredSalary: {
          min: parseInt(data.salaryMin) || 0,
          max: parseInt(data.salaryMax) || 0,
          currency: 'USD',
          period: 'yearly'
        },
        employmentTypes: Array.isArray(data.employmentTypes) ? data.employmentTypes : [],
        preferredLocations: [],
        remotePreference: data.remotePreference
      };
      
      // Background info defaults
      stepData.backgroundInfo = {
        workedAtCompanyBefore: false,
        familyInCompany: false,
        conflictOfInterest: false,
        criminalRecord: false
      };
      
      // Documents
      stepData.documents = {
        resumeText: resumeParseResult?.extractedText
      };
      
      // Settings defaults
      stepData.settings = {
        autoApplyEnabled: false,
        dailyApplicationLimit: 10,
        applicationFilters: {
          keywords: stepData.professionalDetails?.skills || [],
          excludeKeywords: [],
          experienceLevel: [],
          companyTypes: [],
          jobTypes: []
        },
        notifications: {
          email: true,
          browser: true,
          applicationUpdates: true,
          jobAlerts: true
        }
      };
    }
    
    setUserProfile(stepData);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete(stepData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center">
                {isParsingResume ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Parsing your resume...</h3>
                    <p className="text-gray-600">Our AI is extracting information from your resume</p>
                    <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Our AI will extract all your information automatically
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        PDF
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        DOCX
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        TXT
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      Choose File
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {resumeParseResult && (
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold text-lg">
                    Resume parsed successfully! ({resumeParseResult.confidence}% confidence)
                  </span>
                </div>
                {resumeParseResult.missingFields.length > 0 && (
                  <p className="text-sm text-green-700">
                    We'll ask you about: {resumeParseResult.missingFields.join(', ')}
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={() => setCurrentStep(1)}
              className="mt-8 px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email address"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  {...register('state')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  {...register('country')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your country"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your current company"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Job Title
              </label>
              <input
                {...register('currentJobTitle')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Your current role"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <select
                {...register('experienceYears', { required: 'Experience is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Industry
              </label>
              <select
                {...register('currentIndustry')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('legallyAuthorized', { required: 'This field is required' })}
                    value="yes"
                    className="mr-3 text-blue-600"
                  />
                  <span>Yes, I am authorized to work</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('legallyAuthorized', { required: 'This field is required' })}
                    value="no"
                    className="mr-3 text-blue-600"
                  />
                  <span>No, I am not authorized</span>
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
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('requiresSponsorship', { required: 'This field is required' })}
                    value="yes"
                    className="mr-3 text-blue-600"
                  />
                  <span>Yes, I will require sponsorship</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('requiresSponsorship', { required: 'This field is required' })}
                    value="no"
                    className="mr-3 text-blue-600"
                  />
                  <span>No, I will not require sponsorship</span>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('willingToRelocate', { required: 'This field is required' })}
                    value="yes"
                    className="mr-3 text-blue-600"
                  />
                  <span>Yes, I'm willing to relocate</span>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    {...register('willingToRelocate', { required: 'This field is required' })}
                    value="no"
                    className="mr-3 text-blue-600"
                  />
                  <span>No, I prefer to stay in my current location</span>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Employment Type Preferences (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <label key={type} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('employmentTypes')}
                      value={type}
                      className="mr-3 text-blue-600"
                    />
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remote Work Preference
              </label>
              <select
                {...register('remotePreference')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="flexible">Flexible</option>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site Only</option>
              </select>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white shadow-lg'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 ml-4 rounded-full transition-all ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6">
            <h2 className="text-3xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600 text-lg">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
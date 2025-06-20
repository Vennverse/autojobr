export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: Date;
  applicationDeadline?: Date;
  remote: boolean;
  logo?: string;
  tags: string[];
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'naukri' | 'workday' | 'other';
  applicationUrl: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
  appliedDate: Date;
  lastUpdated: Date;
  notes?: string;
  interviewDate?: Date;
  salaryNegotiation?: number;
  documents: {
    resume?: string;
    coverLetter?: string;
    portfolio?: string;
  };
  source: string;
  applicationMethod: 'manual' | 'extension' | 'api';
}

export interface UserProfile {
  id: string;
  email: string;
  isOnboarded: boolean;
  
  // Personal Details
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentAddress: {
      city: string;
      state: string;
      country: string;
      zipCode?: string;
    };
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
  };

  // Professional Details
  professionalDetails: {
    currentCompany?: string;
    currentJobTitle?: string;
    currentIndustry?: string;
    experienceYears: number;
    skills: string[];
    education: Array<{
      degree: string;
      institution: string;
      graduationYear: number;
      gpa?: string;
    }>;
    certifications: string[];
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
    }>;
  };

  // Work Authorization & Eligibility
  workAuthorization: {
    countryOfWork: string;
    legallyAuthorized: boolean;
    requiresSponsorship: boolean;
    currentStatus: 'citizen' | 'permanent_resident' | 'h1b' | 'f1' | 'opt' | 'cpt' | 'other';
    statusDetails?: string;
  };

  // Employment Preferences
  employmentPreferences: {
    noticePeriod: string; // "immediate", "2_weeks", "1_month", etc.
    earliestStartDate: Date;
    willingToRelocate: boolean;
    desiredSalary: {
      min: number;
      max: number;
      currency: string;
      period: 'yearly' | 'monthly' | 'hourly';
    };
    employmentTypes: ('full-time' | 'part-time' | 'contract' | 'internship')[];
    preferredLocations: string[];
    remotePreference: 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
  };

  // Diversity & Inclusion (Optional)
  diversityInfo?: {
    genderIdentity?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';
    raceEthnicity?: string[];
    disabilityStatus?: 'yes' | 'no' | 'prefer_not_to_say';
    veteranStatus?: 'yes' | 'no' | 'prefer_not_to_say';
  };

  // Background Questions
  backgroundInfo: {
    workedAtCompanyBefore: boolean;
    familyInCompany: boolean;
    conflictOfInterest: boolean;
    conflictDetails?: string;
    criminalRecord: boolean;
    criminalRecordDetails?: string;
  };

  // Resume & Documents
  documents: {
    resumeUrl?: string;
    resumeText?: string;
    coverLetterTemplate?: string;
    portfolioFiles?: string[];
  };

  // Settings
  settings: {
    autoApplyEnabled: boolean;
    dailyApplicationLimit: number;
    applicationFilters: {
      keywords: string[];
      excludeKeywords: string[];
      salaryMin?: number;
      experienceLevel: string[];
      companyTypes: string[];
      jobTypes: string[];
    };
    notifications: {
      email: boolean;
      browser: boolean;
      applicationUpdates: boolean;
      jobAlerts: boolean;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface ResumeParseResult {
  personalDetails: Partial<UserProfile['personalDetails']>;
  professionalDetails: Partial<UserProfile['professionalDetails']>;
  extractedText: string;
  confidence: number;
  missingFields: string[];
}

export interface ChromeExtensionMessage {
  type: 'FILL_FORM' | 'GET_USER_DATA' | 'SAVE_APPLICATION' | 'UPDATE_STATUS';
  data: any;
  tabId?: number;
}

export interface JobSiteFormConfig {
  site: string;
  selectors: {
    [fieldName: string]: string;
  };
  submitButton: string;
  nextButton?: string;
  skipOptional?: boolean;
}
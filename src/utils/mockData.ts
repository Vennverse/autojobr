import { Job, Application, User } from '../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: { min: 120000, max: 180000, currency: 'USD' },
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
    requirements: ['React', 'TypeScript', '5+ years experience', 'Next.js'],
    benefits: ['Health Insurance', '401k', 'Remote Work', 'Unlimited PTO'],
    postedDate: new Date('2025-01-10'),
    remote: true,
    tags: ['React', 'TypeScript', 'Remote']
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'full-time',
    salary: { min: 100000, max: 150000, currency: 'USD' },
    description: 'Join our fast-growing startup as a Full Stack Engineer...',
    requirements: ['Node.js', 'React', 'PostgreSQL', '3+ years experience'],
    benefits: ['Equity', 'Health Insurance', 'Flexible Hours'],
    postedDate: new Date('2025-01-09'),
    remote: false,
    tags: ['Node.js', 'React', 'PostgreSQL']
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    type: 'full-time',
    salary: { min: 130000, max: 200000, currency: 'USD' },
    description: 'We need a DevOps Engineer to manage our cloud infrastructure...',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    benefits: ['Stock Options', 'Remote Work', 'Learning Budget'],
    postedDate: new Date('2025-01-08'),
    remote: true,
    tags: ['AWS', 'Docker', 'Kubernetes']
  }
];

export const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    job: mockJobs[0],
    status: 'interview',
    appliedDate: new Date('2025-01-11'),
    lastUpdated: new Date('2025-01-12'),
    interviewDate: new Date('2025-01-15'),
    notes: 'Great company culture, excited about the role',
    documents: {
      resume: 'resume_v2.pdf',
      coverLetter: 'cover_letter_techcorp.pdf'
    }
  },
  {
    id: '2',
    jobId: '2',
    job: mockJobs[1],
    status: 'applied',
    appliedDate: new Date('2025-01-10'),
    lastUpdated: new Date('2025-01-10'),
    documents: {
      resume: 'resume_v2.pdf'
    }
  }
];

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  profile: {
    title: 'Senior Frontend Developer',
    location: 'San Francisco, CA',
    experience: 5,
    skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
    education: ['BS Computer Science - Stanford University'],
    resume: 'john_doe_resume.pdf'
  },
  preferences: {
    jobTypes: ['full-time'],
    locations: ['San Francisco, CA', 'Remote'],
    salaryMin: 120000,
    remote: true
  }
};
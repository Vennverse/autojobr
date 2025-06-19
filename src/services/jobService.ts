import { supabase } from './supabaseClient';
import { Job } from '../types';

export interface JobFilters {
  query?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  remote?: boolean;
  tags?: string[];
  source?: string;
}

export class JobService {
  async fetchJobs(filters?: JobFilters): Promise<Job[]> {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      // Apply filters
      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,company.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      if (filters?.location) {
        if (filters.location.toLowerCase() === 'remote') {
          query = query.eq('is_remote', true);
        } else {
          query = query.ilike('location', `%${filters.location}%`);
        }
      }

      if (filters?.jobType) {
        query = query.eq('job_type', filters.jobType);
      }

      if (filters?.salaryMin) {
        query = query.gte('salary_min', filters.salaryMin);
      }

      if (filters?.remote !== undefined) {
        query = query.eq('is_remote', filters.remote);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform database jobs to Job type
      return data.map(this.transformDbJobToJob);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformDbJobToJob(data);
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      return null;
    }
  }

  async getRecommendedJobs(userId: string): Promise<Job[]> {
    try {
      // Get user profile for recommendations
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('skills, preferred_locations, employment_types, desired_salary_min, remote_preference')
        .eq('user_id', userId)
        .single();

      // For now, return recent jobs with basic filtering
      // In production, this would use ML/AI for better recommendations
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false })
        .limit(20);

      // Apply basic filtering based on user preferences
      if (profile?.employment_types && profile.employment_types.length > 0) {
        query = query.in('job_type', profile.employment_types);
      }

      if (profile?.desired_salary_min) {
        query = query.gte('salary_min', profile.desired_salary_min);
      }

      if (profile?.remote_preference === 'remote_only') {
        query = query.eq('is_remote', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.transformDbJobToJob);
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      return [];
    }
  }

  async saveJob(jobData: Partial<Job>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title!,
          company: jobData.company!,
          location: jobData.location!,
          job_type: jobData.type!,
          salary_min: jobData.salary?.min,
          salary_max: jobData.salary?.max,
          salary_currency: jobData.salary?.currency || 'USD',
          description: jobData.description,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          posted_date: jobData.postedDate?.toISOString(),
          application_deadline: jobData.applicationDeadline?.toISOString(),
          is_remote: jobData.remote || false,
          company_logo_url: jobData.logo,
          tags: jobData.tags,
          source: jobData.source,
          application_url: jobData.applicationUrl,
        })
        .select('id')
        .single();

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  private transformDbJobToJob(dbJob: any): Job {
    return {
      id: dbJob.id,
      title: dbJob.title,
      company: dbJob.company,
      location: dbJob.location,
      type: dbJob.job_type as Job['type'],
      salary: dbJob.salary_min && dbJob.salary_max ? {
        min: dbJob.salary_min,
        max: dbJob.salary_max,
        currency: dbJob.salary_currency,
      } : undefined,
      description: dbJob.description || '',
      requirements: dbJob.requirements || [],
      benefits: dbJob.benefits || [],
      postedDate: new Date(dbJob.posted_date || dbJob.created_at),
      applicationDeadline: dbJob.application_deadline ? new Date(dbJob.application_deadline) : undefined,
      remote: dbJob.is_remote,
      logo: dbJob.company_logo_url,
      tags: dbJob.tags || [],
      source: dbJob.source as Job['source'],
      applicationUrl: dbJob.application_url || '',
    };
  }
}

export const jobService = new JobService();
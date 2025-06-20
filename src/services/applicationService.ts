import { supabase } from './supabaseClient';
import { Application, Job } from '../types';
import { jobService } from './jobService';

export class ApplicationService {
  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (*)
        `)
        .eq('user_id', userId)
        .order('applied_date', { ascending: false });

      if (error) throw error;

      // Transform to Application type
      return data.map(app => ({
        id: app.id,
        jobId: app.job_id,
        job: this.transformDbJobToJob(app.jobs),
        status: app.status as Application['status'],
        appliedDate: new Date(app.applied_date),
        lastUpdated: new Date(app.last_updated),
        notes: app.notes || undefined,
        interviewDate: app.interview_date ? new Date(app.interview_date) : undefined,
        salaryNegotiation: app.salary_negotiation || undefined,
        documents: {
          resume: app.resume_id || undefined,
          coverLetter: app.cover_letter_id || undefined,
          portfolio: app.portfolio_id || undefined,
        },
        source: app.source,
        applicationMethod: app.application_method as Application['applicationMethod'],
      }));
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }
  }

  async createApplication(userId: string, jobId: string, applicationData: Partial<Application>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          user_id: userId,
          job_id: jobId,
          status: applicationData.status || 'applied',
          notes: applicationData.notes,
          interview_date: applicationData.interviewDate?.toISOString(),
          salary_negotiation: applicationData.salaryNegotiation,
          resume_id: applicationData.documents?.resume,
          cover_letter_id: applicationData.documents?.coverLetter,
          portfolio_id: applicationData.documents?.portfolio,
          source: applicationData.source || 'manual',
          application_method: applicationData.applicationMethod || 'manual',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Log the application creation
      await this.logApplicationAction(data.id, userId, 'applied', null, applicationData.status || 'applied');

      return data.id;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  async updateApplication(applicationId: string, userId: string, updates: Partial<Application>): Promise<void> {
    try {
      // Get current application for logging
      const { data: currentApp } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .eq('user_id', userId)
        .single();

      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.interviewDate) updateData.interview_date = updates.interviewDate.toISOString();
      if (updates.salaryNegotiation !== undefined) updateData.salary_negotiation = updates.salaryNegotiation;
      if (updates.documents?.resume) updateData.resume_id = updates.documents.resume;
      if (updates.documents?.coverLetter) updateData.cover_letter_id = updates.documents.coverLetter;
      if (updates.documents?.portfolio) updateData.portfolio_id = updates.documents.portfolio;

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .eq('user_id', userId);

      if (error) throw error;

      // Log status change if status was updated
      if (updates.status && currentApp && currentApp.status !== updates.status) {
        await this.logApplicationAction(applicationId, userId, 'status_changed', currentApp.status, updates.status);
      }
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  async deleteApplication(applicationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }

  async getApplicationStats(userId: string): Promise<{
    total: number;
    applied: number;
    reviewing: number;
    interview: number;
    offer: number;
    rejected: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        applied: 0,
        reviewing: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
      };

      data.forEach(app => {
        if (app.status in stats) {
          (stats as any)[app.status]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching application stats:', error);
      return { total: 0, applied: 0, reviewing: 0, interview: 0, offer: 0, rejected: 0 };
    }
  }

  private async logApplicationAction(
    applicationId: string, 
    userId: string, 
    action: string, 
    oldValue: string | null, 
    newValue: string
  ): Promise<void> {
    try {
      await supabase
        .from('application_logs')
        .insert({
          application_id: applicationId,
          user_id: userId,
          action,
          old_value: oldValue,
          new_value: newValue,
        });
    } catch (error) {
      console.error('Error logging application action:', error);
      // Don't throw error for logging failures
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

export const applicationService = new ApplicationService();
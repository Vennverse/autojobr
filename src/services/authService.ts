import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export class AuthService {
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create user record in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create initial user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          is_onboarded: false,
        });

      if (profileError) throw profileError;

      // Create initial extension settings
      const { error: settingsError } = await supabase
        .from('extension_settings')
        .insert({
          user_id: authData.user.id,
        });

      if (settingsError) throw settingsError;

      return {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to sign in');

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      return {
        id: data.user.id,
        email: data.user.email!,
        created_at: data.user.created_at,
      };
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
    };
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (!profile) return null;

      // Get extension settings
      const { data: settings } = await supabase
        .from('extension_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Transform database profile to UserProfile type
      const userProfile: UserProfile = {
        id: profile.user_id,
        email: profile.first_name ? `${profile.first_name}@example.com` : 'user@example.com', // This should come from users table
        isOnboarded: profile.is_onboarded,
        personalDetails: {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.first_name ? `${profile.first_name}@example.com` : 'user@example.com',
          phone: profile.phone || '',
          currentAddress: {
            city: profile.current_city || '',
            state: profile.current_state || '',
            country: profile.current_country || '',
            zipCode: profile.current_zip_code || '',
          },
          linkedinUrl: profile.linkedin_url || '',
          portfolioUrl: profile.portfolio_url || '',
          githubUrl: profile.github_url || '',
        },
        professionalDetails: {
          currentCompany: profile.current_company || '',
          currentJobTitle: profile.current_job_title || '',
          currentIndustry: profile.current_industry || '',
          experienceYears: profile.experience_years,
          skills: profile.skills || [],
          education: profile.education || [],
          certifications: profile.certifications || [],
          languages: profile.languages || [],
        },
        workAuthorization: {
          countryOfWork: profile.country_of_work || '',
          legallyAuthorized: profile.legally_authorized,
          requiresSponsorship: profile.requires_sponsorship,
          currentStatus: profile.current_status as any,
          statusDetails: profile.status_details || '',
        },
        employmentPreferences: {
          noticePeriod: profile.notice_period || '',
          earliestStartDate: profile.earliest_start_date ? new Date(profile.earliest_start_date) : new Date(),
          willingToRelocate: profile.willing_to_relocate,
          desiredSalary: {
            min: profile.desired_salary_min || 0,
            max: profile.desired_salary_max || 0,
            currency: profile.desired_salary_currency,
            period: profile.desired_salary_period as any,
          },
          employmentTypes: profile.employment_types as any[] || [],
          preferredLocations: profile.preferred_locations || [],
          remotePreference: profile.remote_preference as any,
        },
        diversityInfo: {
          genderIdentity: profile.gender_identity as any,
          raceEthnicity: profile.race_ethnicity || [],
          disabilityStatus: profile.disability_status as any,
          veteranStatus: profile.veteran_status as any,
        },
        backgroundInfo: {
          workedAtCompanyBefore: profile.worked_at_company_before,
          familyInCompany: profile.family_in_company,
          conflictOfInterest: profile.conflict_of_interest,
          conflictDetails: profile.conflict_details || '',
          criminalRecord: profile.criminal_record,
          criminalRecordDetails: profile.criminal_record_details || '',
        },
        documents: {},
        settings: {
          autoApplyEnabled: settings?.auto_apply_enabled || false,
          dailyApplicationLimit: settings?.daily_application_limit || 10,
          applicationFilters: {
            keywords: settings?.include_keywords || [],
            excludeKeywords: settings?.exclude_keywords || [],
            salaryMin: settings?.salary_min,
            experienceLevel: settings?.experience_levels || [],
            companyTypes: settings?.company_types || [],
            jobTypes: settings?.job_types || [],
          },
          notifications: {
            email: settings?.email_notifications || true,
            browser: settings?.browser_notifications || true,
            applicationUpdates: settings?.application_updates || true,
            jobAlerts: settings?.job_alerts || true,
          },
        },
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at),
      };

      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      // Update user_profiles table
      const profileUpdate: any = {};
      
      if (profileData.personalDetails) {
        const pd = profileData.personalDetails;
        if (pd.firstName) profileUpdate.first_name = pd.firstName;
        if (pd.lastName) profileUpdate.last_name = pd.lastName;
        if (pd.phone) profileUpdate.phone = pd.phone;
        if (pd.currentAddress) {
          profileUpdate.current_city = pd.currentAddress.city;
          profileUpdate.current_state = pd.currentAddress.state;
          profileUpdate.current_country = pd.currentAddress.country;
          profileUpdate.current_zip_code = pd.currentAddress.zipCode;
        }
        if (pd.linkedinUrl) profileUpdate.linkedin_url = pd.linkedinUrl;
        if (pd.portfolioUrl) profileUpdate.portfolio_url = pd.portfolioUrl;
        if (pd.githubUrl) profileUpdate.github_url = pd.githubUrl;
      }

      if (profileData.professionalDetails) {
        const prof = profileData.professionalDetails;
        if (prof.currentCompany) profileUpdate.current_company = prof.currentCompany;
        if (prof.currentJobTitle) profileUpdate.current_job_title = prof.currentJobTitle;
        if (prof.currentIndustry) profileUpdate.current_industry = prof.currentIndustry;
        if (prof.experienceYears !== undefined) profileUpdate.experience_years = prof.experienceYears;
        if (prof.skills) profileUpdate.skills = prof.skills;
        if (prof.education) profileUpdate.education = prof.education;
        if (prof.certifications) profileUpdate.certifications = prof.certifications;
        if (prof.languages) profileUpdate.languages = prof.languages;
      }

      if (profileData.workAuthorization) {
        const wa = profileData.workAuthorization;
        if (wa.countryOfWork) profileUpdate.country_of_work = wa.countryOfWork;
        if (wa.legallyAuthorized !== undefined) profileUpdate.legally_authorized = wa.legallyAuthorized;
        if (wa.requiresSponsorship !== undefined) profileUpdate.requires_sponsorship = wa.requiresSponsorship;
        if (wa.currentStatus) profileUpdate.current_status = wa.currentStatus;
        if (wa.statusDetails) profileUpdate.status_details = wa.statusDetails;
      }

      if (profileData.employmentPreferences) {
        const ep = profileData.employmentPreferences;
        if (ep.noticePeriod) profileUpdate.notice_period = ep.noticePeriod;
        if (ep.earliestStartDate) profileUpdate.earliest_start_date = ep.earliestStartDate.toISOString().split('T')[0];
        if (ep.willingToRelocate !== undefined) profileUpdate.willing_to_relocate = ep.willingToRelocate;
        if (ep.desiredSalary) {
          profileUpdate.desired_salary_min = ep.desiredSalary.min;
          profileUpdate.desired_salary_max = ep.desiredSalary.max;
          profileUpdate.desired_salary_currency = ep.desiredSalary.currency;
          profileUpdate.desired_salary_period = ep.desiredSalary.period;
        }
        if (ep.employmentTypes) profileUpdate.employment_types = ep.employmentTypes;
        if (ep.preferredLocations) profileUpdate.preferred_locations = ep.preferredLocations;
        if (ep.remotePreference) profileUpdate.remote_preference = ep.remotePreference;
      }

      if (profileData.diversityInfo) {
        const di = profileData.diversityInfo;
        if (di.genderIdentity) profileUpdate.gender_identity = di.genderIdentity;
        if (di.raceEthnicity) profileUpdate.race_ethnicity = di.raceEthnicity;
        if (di.disabilityStatus) profileUpdate.disability_status = di.disabilityStatus;
        if (di.veteranStatus) profileUpdate.veteran_status = di.veteranStatus;
      }

      if (profileData.backgroundInfo) {
        const bi = profileData.backgroundInfo;
        if (bi.workedAtCompanyBefore !== undefined) profileUpdate.worked_at_company_before = bi.workedAtCompanyBefore;
        if (bi.familyInCompany !== undefined) profileUpdate.family_in_company = bi.familyInCompany;
        if (bi.conflictOfInterest !== undefined) profileUpdate.conflict_of_interest = bi.conflictOfInterest;
        if (bi.conflictDetails) profileUpdate.conflict_details = bi.conflictDetails;
        if (bi.criminalRecord !== undefined) profileUpdate.criminal_record = bi.criminalRecord;
        if (bi.criminalRecordDetails) profileUpdate.criminal_record_details = bi.criminalRecordDetails;
      }

      if (profileData.isOnboarded !== undefined) {
        profileUpdate.is_onboarded = profileData.isOnboarded;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update(profileUpdate)
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Update extension settings if provided
      if (profileData.settings) {
        const settingsUpdate: any = {};
        const settings = profileData.settings;
        
        if (settings.autoApplyEnabled !== undefined) settingsUpdate.auto_apply_enabled = settings.autoApplyEnabled;
        if (settings.dailyApplicationLimit !== undefined) settingsUpdate.daily_application_limit = settings.dailyApplicationLimit;
        if (settings.applicationFilters) {
          const filters = settings.applicationFilters;
          if (filters.keywords) settingsUpdate.include_keywords = filters.keywords;
          if (filters.excludeKeywords) settingsUpdate.exclude_keywords = filters.excludeKeywords;
          if (filters.salaryMin !== undefined) settingsUpdate.salary_min = filters.salaryMin;
          if (filters.experienceLevel) settingsUpdate.experience_levels = filters.experienceLevel;
          if (filters.companyTypes) settingsUpdate.company_types = filters.companyTypes;
          if (filters.jobTypes) settingsUpdate.job_types = filters.jobTypes;
        }
        if (settings.notifications) {
          const notifs = settings.notifications;
          if (notifs.email !== undefined) settingsUpdate.email_notifications = notifs.email;
          if (notifs.browser !== undefined) settingsUpdate.browser_notifications = notifs.browser;
          if (notifs.applicationUpdates !== undefined) settingsUpdate.application_updates = notifs.applicationUpdates;
          if (notifs.jobAlerts !== undefined) settingsUpdate.job_alerts = notifs.jobAlerts;
        }

        if (Object.keys(settingsUpdate).length > 0) {
          const { error: settingsError } = await supabase
            .from('extension_settings')
            .update(settingsUpdate)
            .eq('user_id', userId);

          if (settingsError) throw settingsError;
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
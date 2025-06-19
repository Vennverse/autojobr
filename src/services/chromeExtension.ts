// Chrome Extension Communication Service
export interface ExtensionMessage {
  type: 'FILL_FORM' | 'GET_USER_DATA' | 'SAVE_APPLICATION' | 'UPDATE_STATUS' | 'GET_JOB_DATA';
  data?: any;
  tabId?: number;
}

export interface JobSiteConfig {
  site: string;
  domain: string;
  selectors: {
    // Personal Information
    firstName: string[];
    lastName: string[];
    email: string[];
    phone: string[];
    address: string[];
    city: string[];
    state: string[];
    country: string[];
    zipCode: string[];
    linkedinUrl: string[];
    portfolioUrl: string[];
    
    // Professional Information
    currentCompany: string[];
    currentTitle: string[];
    experience: string[];
    skills: string[];
    
    // Work Authorization
    workAuthorization: string[];
    sponsorship: string[];
    
    // Employment Preferences
    noticePeriod: string[];
    startDate: string[];
    salary: string[];
    relocation: string[];
    
    // Resume Upload
    resumeUpload: string[];
    coverLetterUpload: string[];
    
    // Form Navigation
    nextButton: string[];
    submitButton: string[];
    skipButton: string[];
  };
  formSteps: string[];
  skipOptionalFields: boolean;
}

export const JOB_SITE_CONFIGS: JobSiteConfig[] = [
  {
    site: 'LinkedIn',
    domain: 'linkedin.com',
    selectors: {
      firstName: ['input[name="firstName"]', '#firstName', 'input[aria-label*="First name"]'],
      lastName: ['input[name="lastName"]', '#lastName', 'input[aria-label*="Last name"]'],
      email: ['input[name="email"]', '#email', 'input[type="email"]'],
      phone: ['input[name="phone"]', '#phone', 'input[type="tel"]'],
      address: ['input[name="address"]', '#address'],
      city: ['input[name="city"]', '#city'],
      state: ['input[name="state"]', '#state', 'select[name="state"]'],
      country: ['select[name="country"]', '#country'],
      zipCode: ['input[name="zipCode"]', '#zipCode', 'input[name="postalCode"]'],
      linkedinUrl: ['input[name="linkedinUrl"]', '#linkedinUrl'],
      portfolioUrl: ['input[name="website"]', '#website', 'input[name="portfolioUrl"]'],
      currentCompany: ['input[name="currentCompany"]', '#currentCompany'],
      currentTitle: ['input[name="currentTitle"]', '#currentTitle'],
      experience: ['select[name="experience"]', '#experience'],
      skills: ['textarea[name="skills"]', '#skills'],
      workAuthorization: ['select[name="workAuthorization"]', 'input[name="workAuth"]'],
      sponsorship: ['select[name="sponsorship"]', 'input[name="visa"]'],
      noticePeriod: ['select[name="noticePeriod"]', '#noticePeriod'],
      startDate: ['input[name="startDate"]', '#startDate', 'input[type="date"]'],
      salary: ['input[name="salary"]', '#salary', 'input[name="expectedSalary"]'],
      relocation: ['select[name="relocation"]', 'input[name="relocate"]'],
      resumeUpload: ['input[type="file"][name*="resume"]', '#resume-upload'],
      coverLetterUpload: ['input[type="file"][name*="cover"]', '#cover-letter-upload'],
      nextButton: ['button[aria-label="Continue"]', 'button:contains("Next")', '.next-button'],
      submitButton: ['button[type="submit"]', 'button:contains("Submit")', '.submit-button'],
      skipButton: ['button:contains("Skip")', '.skip-button']
    },
    formSteps: ['.application-step', '.form-step'],
    skipOptionalFields: true
  },
  {
    site: 'Indeed',
    domain: 'indeed.com',
    selectors: {
      firstName: ['input[name="applicant.name.first"]', '#applicant-name-first'],
      lastName: ['input[name="applicant.name.last"]', '#applicant-name-last'],
      email: ['input[name="applicant.emailAddress"]', '#applicant-email-address'],
      phone: ['input[name="applicant.phoneNumber"]', '#applicant-phone-number'],
      address: ['input[name="applicant.address.addressLine1"]'],
      city: ['input[name="applicant.address.city"]'],
      state: ['select[name="applicant.address.countrySubdivision"]'],
      country: ['select[name="applicant.address.country"]'],
      zipCode: ['input[name="applicant.address.postalCode"]'],
      linkedinUrl: ['input[name="applicant.customQuestions.linkedinUrl"]'],
      portfolioUrl: ['input[name="applicant.customQuestions.portfolioUrl"]'],
      currentCompany: ['input[name="applicant.work.current.employer"]'],
      currentTitle: ['input[name="applicant.work.current.jobTitle"]'],
      experience: ['select[name="applicant.experience"]'],
      skills: ['textarea[name="applicant.skills"]'],
      workAuthorization: ['select[name="applicant.workAuthorization"]'],
      sponsorship: ['select[name="applicant.sponsorship"]'],
      noticePeriod: ['select[name="applicant.availability"]'],
      startDate: ['input[name="applicant.startDate"]'],
      salary: ['input[name="applicant.desiredSalary"]'],
      relocation: ['select[name="applicant.relocation"]'],
      resumeUpload: ['input[name="resume"]', '#resume'],
      coverLetterUpload: ['input[name="coverLetter"]', '#cover-letter'],
      nextButton: ['button[data-testid="ContinueButton"]', '.ia-continueButton'],
      submitButton: ['button[data-testid="SubmitButton"]', '.ia-submitButton'],
      skipButton: ['button[data-testid="SkipButton"]']
    },
    formSteps: ['.ia-BasePage-content'],
    skipOptionalFields: true
  },
  {
    site: 'Workday',
    domain: 'myworkdayjobs.com',
    selectors: {
      firstName: ['input[data-automation-id="legalNameSection_firstName"]'],
      lastName: ['input[data-automation-id="legalNameSection_lastName"]'],
      email: ['input[data-automation-id="email"]'],
      phone: ['input[data-automation-id="phone"]'],
      address: ['input[data-automation-id="addressSection_addressLine1"]'],
      city: ['input[data-automation-id="addressSection_city"]'],
      state: ['input[data-automation-id="addressSection_countryRegion"]'],
      country: ['input[data-automation-id="addressSection_country"]'],
      zipCode: ['input[data-automation-id="addressSection_postalCode"]'],
      linkedinUrl: ['input[data-automation-id="linkedinUrl"]'],
      portfolioUrl: ['input[data-automation-id="website"]'],
      currentCompany: ['input[data-automation-id="currentEmployer"]'],
      currentTitle: ['input[data-automation-id="currentJobTitle"]'],
      experience: ['input[data-automation-id="experience"]'],
      skills: ['textarea[data-automation-id="skills"]'],
      workAuthorization: ['input[data-automation-id="workAuthorization"]'],
      sponsorship: ['input[data-automation-id="sponsorship"]'],
      noticePeriod: ['input[data-automation-id="noticePeriod"]'],
      startDate: ['input[data-automation-id="startDate"]'],
      salary: ['input[data-automation-id="salary"]'],
      relocation: ['input[data-automation-id="relocation"]'],
      resumeUpload: ['input[data-automation-id="file"]'],
      coverLetterUpload: ['input[data-automation-id="coverLetter"]'],
      nextButton: ['button[data-automation-id="bottom-navigation-next-button"]'],
      submitButton: ['button[data-automation-id="bottom-navigation-submit-button"]'],
      skipButton: ['button[data-automation-id="bottom-navigation-skip-button"]']
    },
    formSteps: ['[data-automation-id="step"]'],
    skipOptionalFields: false
  },
  {
    site: 'Naukri',
    domain: 'naukri.com',
    selectors: {
      firstName: ['input[name="fname"]', '#fname'],
      lastName: ['input[name="lname"]', '#lname'],
      email: ['input[name="email"]', '#email'],
      phone: ['input[name="mobile"]', '#mobile'],
      address: ['input[name="address"]', '#address'],
      city: ['select[name="city"]', '#city'],
      state: ['select[name="state"]', '#state'],
      country: ['select[name="country"]', '#country'],
      zipCode: ['input[name="pincode"]', '#pincode'],
      linkedinUrl: ['input[name="linkedin"]', '#linkedin'],
      portfolioUrl: ['input[name="portfolio"]', '#portfolio'],
      currentCompany: ['input[name="currentCompany"]', '#currentCompany'],
      currentTitle: ['input[name="designation"]', '#designation'],
      experience: ['select[name="experience"]', '#experience'],
      skills: ['textarea[name="keySkills"]', '#keySkills'],
      workAuthorization: ['select[name="workPermit"]'],
      sponsorship: ['select[name="visa"]'],
      noticePeriod: ['select[name="noticePeriod"]', '#noticePeriod'],
      startDate: ['input[name="availableFrom"]'],
      salary: ['input[name="currentSalary"]', '#currentSalary'],
      relocation: ['select[name="prefLocation"]'],
      resumeUpload: ['input[name="resume"]', '#resume'],
      coverLetterUpload: ['input[name="coverLetter"]'],
      nextButton: ['input[value="Next"]', '.next-btn'],
      submitButton: ['input[value="Submit"]', '.submit-btn'],
      skipButton: ['input[value="Skip"]', '.skip-btn']
    },
    formSteps: ['.form-step'],
    skipOptionalFields: true
  }
];

export class ChromeExtensionService {
  private static instance: ChromeExtensionService;
  private isExtensionInstalled = false;

  static getInstance(): ChromeExtensionService {
    if (!ChromeExtensionService.instance) {
      ChromeExtensionService.instance = new ChromeExtensionService();
    }
    return ChromeExtensionService.instance;
  }

  async checkExtensionInstalled(): Promise<boolean> {
    try {
      // Check if extension is installed by trying to communicate with it
      const response = await this.sendMessage({ type: 'GET_USER_DATA' });
      this.isExtensionInstalled = !!response;
      return this.isExtensionInstalled;
    } catch (error) {
      this.isExtensionInstalled = false;
      return false;
    }
  }

  async sendMessage(message: ExtensionMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } else {
        reject(new Error('Chrome extension not available'));
      }
    });
  }

  async fillJobApplicationForm(userProfile: any, jobSite: string): Promise<boolean> {
    try {
      const config = JOB_SITE_CONFIGS.find(c => c.site.toLowerCase() === jobSite.toLowerCase());
      if (!config) {
        throw new Error(`Unsupported job site: ${jobSite}`);
      }

      const message: ExtensionMessage = {
        type: 'FILL_FORM',
        data: {
          userProfile,
          config
        }
      };

      const response = await this.sendMessage(message);
      return response.success;
    } catch (error) {
      console.error('Failed to fill form:', error);
      return false;
    }
  }

  async saveApplication(applicationData: any): Promise<boolean> {
    try {
      const message: ExtensionMessage = {
        type: 'SAVE_APPLICATION',
        data: applicationData
      };

      const response = await this.sendMessage(message);
      return response.success;
    } catch (error) {
      console.error('Failed to save application:', error);
      return false;
    }
  }

  getJobSiteConfig(domain: string): JobSiteConfig | null {
    return JOB_SITE_CONFIGS.find(config => 
      domain.includes(config.domain)
    ) || null;
  }

  isExtensionReady(): boolean {
    return this.isExtensionInstalled;
  }
}

export const chromeExtensionService = ChromeExtensionService.getInstance();
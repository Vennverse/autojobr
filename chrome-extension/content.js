// Content script for AutoJobr Chrome Extension
class AutoJobrContent {
  constructor() {
    this.isJobApplicationPage = false;
    this.jobSiteConfig = null;
    this.userProfile = null;
    this.settings = null;
    
    this.init();
  }

  async init() {
    // Get user profile and settings
    const response = await chrome.runtime.sendMessage({ type: 'GET_USER_DATA' });
    if (response.success) {
      this.userProfile = response.data;
    }

    const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    if (settingsResponse.success) {
      this.settings = settingsResponse.data;
    }

    // Detect job site and application pages
    this.detectJobSite();
    this.detectApplicationPage();

    // Add AutoJobr UI elements
    this.addAutoJobrUI();

    // Set up observers for dynamic content
    this.setupObservers();
  }

  detectJobSite() {
    const hostname = window.location.hostname;
    const jobSites = {
      'linkedin.com': 'LinkedIn',
      'indeed.com': 'Indeed',
      'glassdoor.com': 'Glassdoor',
      'naukri.com': 'Naukri',
      'myworkdayjobs.com': 'Workday',
      'angel.co': 'AngelList',
      'monster.com': 'Monster',
      'ziprecruiter.com': 'ZipRecruiter'
    };

    for (const [domain, siteName] of Object.entries(jobSites)) {
      if (hostname.includes(domain)) {
        this.jobSite = siteName;
        this.getJobSiteConfig(siteName);
        break;
      }
    }
  }

  async getJobSiteConfig(siteName) {
    // This would typically fetch from the background script
    // For now, using simplified configs
    const configs = {
      'LinkedIn': {
        applicationSelectors: [
          '.jobs-apply-button',
          '[data-control-name="jobdetails_topcard_inapply"]',
          '.jobs-s-apply button'
        ],
        formSelectors: {
          firstName: ['input[name="firstName"]', '#firstName'],
          lastName: ['input[name="lastName"]', '#lastName'],
          email: ['input[name="email"]', '#email'],
          phone: ['input[name="phone"]', '#phone']
        }
      },
      'Indeed': {
        applicationSelectors: [
          '[data-jk] .ia-IndeedApplyButton',
          '.jobsearch-IndeedApplyButton',
          '.ia-continueButton'
        ],
        formSelectors: {
          firstName: ['input[name="applicant.name.first"]'],
          lastName: ['input[name="applicant.name.last"]'],
          email: ['input[name="applicant.emailAddress"]'],
          phone: ['input[name="applicant.phoneNumber"]']
        }
      }
    };

    this.jobSiteConfig = configs[siteName];
  }

  detectApplicationPage() {
    if (!this.jobSiteConfig) return;

    // Check if current page has application forms
    const hasApplicationForm = this.jobSiteConfig.applicationSelectors?.some(selector => 
      document.querySelector(selector)
    );

    if (hasApplicationForm) {
      this.isJobApplicationPage = true;
    }

    // Check for form fields
    const hasFormFields = Object.values(this.jobSiteConfig.formSelectors || {}).some(selectors =>
      selectors.some(selector => document.querySelector(selector))
    );

    if (hasFormFields) {
      this.isJobApplicationPage = true;
    }
  }

  addAutoJobrUI() {
    if (!this.isJobApplicationPage || !this.userProfile) return;

    // Create AutoJobr floating button
    const floatingButton = document.createElement('div');
    floatingButton.id = 'autojobr-floating-btn';
    floatingButton.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        user-select: none;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
        </svg>
        AutoJobr
      </div>
    `;

    floatingButton.addEventListener('click', () => {
      this.showAutoJobrPanel();
    });

    document.body.appendChild(floatingButton);

    // Add quick fill buttons to form fields
    this.addQuickFillButtons();
  }

  addQuickFillButtons() {
    if (!this.jobSiteConfig?.formSelectors) return;

    Object.entries(this.jobSiteConfig.formSelectors).forEach(([fieldType, selectors]) => {
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.dataset.autojobrEnhanced) return;
          element.dataset.autojobrEnhanced = 'true';

          const quickFillBtn = document.createElement('button');
          quickFillBtn.innerHTML = '⚡';
          quickFillBtn.style.cssText = `
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 12px;
            z-index: 1000;
          `;

          quickFillBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.fillSingleField(element, fieldType);
          });

          // Position the button relative to the input
          element.style.position = 'relative';
          element.parentElement.style.position = 'relative';
          element.parentElement.appendChild(quickFillBtn);
        });
      });
    });
  }

  fillSingleField(element, fieldType) {
    if (!this.userProfile) return;

    const fieldMappings = {
      firstName: this.userProfile.personalDetails?.firstName,
      lastName: this.userProfile.personalDetails?.lastName,
      email: this.userProfile.personalDetails?.email,
      phone: this.userProfile.personalDetails?.phone,
      currentCompany: this.userProfile.professionalDetails?.currentCompany,
      currentTitle: this.userProfile.professionalDetails?.currentJobTitle
    };

    const value = fieldMappings[fieldType];
    if (value) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Visual feedback
      element.style.backgroundColor = '#e6ffed';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
  }

  showAutoJobrPanel() {
    // Remove existing panel
    const existingPanel = document.getElementById('autojobr-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'autojobr-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10001;
        width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="padding: 24px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">AutoJobr Assistant</h3>
            <button onclick="document.getElementById('autojobr-panel').remove()" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #6b7280;
              padding: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
            " onmouseover="this.style.backgroundColor='#f3f4f6'" onmouseout="this.style.backgroundColor='transparent'">×</button>
          </div>
        </div>
        
        <div style="padding: 24px;">
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">Quick Actions</h4>
            <button id="autojobr-fill-all" style="
              width: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              margin-bottom: 8px;
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
              🚀 Fill All Fields
            </button>
            
            <button id="autojobr-save-job" style="
              width: 100%;
              background: #10b981;
              color: white;
              border: none;
              padding: 12px 16px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
              💾 Save Job to Tracker
            </button>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">Application Status</h4>
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; font-size: 14px; color: #6b7280;">
              Applications today: <strong>${this.settings?.applicationsToday || 0}/${this.settings?.dailyApplicationLimit || 10}</strong>
            </div>
          </div>
          
          <div>
            <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">Profile Status</h4>
            <div style="font-size: 14px; color: #6b7280;">
              ${this.userProfile ? '✅ Profile loaded' : '❌ Profile not found'}
              <br>
              ${this.isJobApplicationPage ? '✅ Application page detected' : '❌ No application form found'}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Backdrop -->
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
      " onclick="document.getElementById('autojobr-panel').remove()"></div>
    `;

    document.body.appendChild(panel);

    // Add event listeners
    document.getElementById('autojobr-fill-all')?.addEventListener('click', () => {
      this.fillAllFields();
    });

    document.getElementById('autojobr-save-job')?.addEventListener('click', () => {
      this.saveCurrentJob();
    });
  }

  async fillAllFields() {
    if (!this.userProfile || !this.jobSiteConfig) return;

    try {
      await chrome.runtime.sendMessage({
        type: 'FILL_FORM',
        data: {
          userProfile: this.userProfile,
          config: this.jobSiteConfig
        }
      });

      this.showNotification('Form filled successfully!', 'success');
    } catch (error) {
      console.error('Failed to fill form:', error);
      this.showNotification('Failed to fill form', 'error');
    }
  }

  async saveCurrentJob() {
    try {
      const jobData = this.extractJobData();
      
      await chrome.runtime.sendMessage({
        type: 'SAVE_APPLICATION',
        data: jobData
      });

      this.showNotification('Job saved to tracker!', 'success');
    } catch (error) {
      console.error('Failed to save job:', error);
      this.showNotification('Failed to save job', 'error');
    }
  }

  extractJobData() {
    // Extract job information from the current page
    const jobData = {
      title: this.extractJobTitle(),
      company: this.extractCompanyName(),
      location: this.extractLocation(),
      description: this.extractJobDescription(),
      url: window.location.href,
      source: this.jobSite,
      extractedAt: new Date().toISOString()
    };

    return jobData;
  }

  extractJobTitle() {
    const selectors = [
      'h1[data-automation-id="jobPostingHeader"]', // Workday
      '.jobs-unified-top-card__job-title', // LinkedIn
      '[data-testid="jobsearch-JobInfoHeader-title"]', // Indeed
      '.jobsearch-JobInfoHeader-title', // Indeed
      'h1.jobTitle', // Glassdoor
      '.jd-header-title', // Naukri
      'h1', 'h2' // Generic fallback
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return document.title || 'Unknown Job Title';
  }

  extractCompanyName() {
    const selectors = [
      '[data-automation-id="jobPostingCompanyName"]', // Workday
      '.jobs-unified-top-card__company-name', // LinkedIn
      '[data-testid="inlineHeader-companyName"]', // Indeed
      '.jobsearch-InlineCompanyRating', // Indeed
      '[data-test="employer-name"]', // Glassdoor
      '.jd-header-comp-name', // Naukri
      '.company-name', '.employer-name' // Generic
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return 'Unknown Company';
  }

  extractLocation() {
    const selectors = [
      '[data-automation-id="jobPostingLocation"]', // Workday
      '.jobs-unified-top-card__bullet', // LinkedIn
      '[data-testid="job-location"]', // Indeed
      '.jobsearch-JobInfoHeader-subtitle', // Indeed
      '[data-test="job-location"]', // Glassdoor
      '.jd-header-comp-loc', // Naukri
      '.location', '.job-location' // Generic
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return 'Location not specified';
  }

  extractJobDescription() {
    const selectors = [
      '[data-automation-id="jobPostingDescription"]', // Workday
      '.jobs-description-content__text', // LinkedIn
      '#jobDescriptionText', // Indeed
      '.jobsearch-jobDescriptionText', // Indeed
      '.jobDescriptionContent', // Glassdoor
      '.jd-desc', // Naukri
      '.job-description', '.description' // Generic
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim().substring(0, 1000); // Limit length
      }
    }

    return 'Job description not available';
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 10002;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        ${message}
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          margin-left: 12px;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.8;
        " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">×</button>
      </div>
    `;

    // Add animation styles
    if (!document.getElementById('autojobr-styles')) {
      const styles = document.createElement('style');
      styles.id = 'autojobr-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  setupObservers() {
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldRecheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldRecheck = true;
        }
      });

      if (shouldRecheck) {
        setTimeout(() => {
          this.detectApplicationPage();
          if (this.isJobApplicationPage && !document.getElementById('autojobr-floating-btn')) {
            this.addAutoJobrUI();
          }
        }, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AutoJobrContent();
  });
} else {
  new AutoJobrContent();
}
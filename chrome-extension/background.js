// Background script for AutoJobr Chrome Extension
class AutoJobrBackground {
  constructor() {
    this.userProfile = null;
    this.settings = {
      autoApplyEnabled: false,
      dailyApplicationLimit: 10,
      applicationsToday: 0,
      lastResetDate: new Date().toDateString()
    };
    
    this.init();
  }

  async init() {
    // Load user profile and settings from storage
    const data = await chrome.storage.sync.get(['userProfile', 'settings']);
    if (data.userProfile) {
      this.userProfile = data.userProfile;
    }
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }

    // Reset daily counter if it's a new day
    this.resetDailyCounterIfNeeded();

    // Set up message listeners
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Set up tab update listeners
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
  }

  resetDailyCounterIfNeeded() {
    const today = new Date().toDateString();
    if (this.settings.lastResetDate !== today) {
      this.settings.applicationsToday = 0;
      this.settings.lastResetDate = today;
      this.saveSettings();
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_USER_DATA':
          sendResponse({ success: true, data: this.userProfile });
          break;

        case 'UPDATE_USER_DATA':
          this.userProfile = message.data;
          await chrome.storage.sync.set({ userProfile: this.userProfile });
          sendResponse({ success: true });
          break;

        case 'GET_SETTINGS':
          sendResponse({ success: true, data: this.settings });
          break;

        case 'UPDATE_SETTINGS':
          this.settings = { ...this.settings, ...message.data };
          await this.saveSettings();
          sendResponse({ success: true });
          break;

        case 'FILL_FORM':
          await this.fillJobApplicationForm(message.data, sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'SAVE_APPLICATION':
          await this.saveApplication(message.data);
          sendResponse({ success: true });
          break;

        case 'CHECK_AUTO_APPLY':
          const canAutoApply = this.canAutoApply();
          sendResponse({ success: true, canAutoApply });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
      const isJobSite = this.isJobSite(tab.url);
      if (isJobSite && this.settings.autoApplyEnabled) {
        // Inject content script if it's a job site
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
        } catch (error) {
          console.error('Failed to inject content script:', error);
        }
      }
    }
  }

  isJobSite(url) {
    const jobSiteDomains = [
      'linkedin.com',
      'indeed.com',
      'glassdoor.com',
      'naukri.com',
      'myworkdayjobs.com',
      'angel.co',
      'monster.com',
      'ziprecruiter.com'
    ];

    return jobSiteDomains.some(domain => url.includes(domain));
  }

  canAutoApply() {
    this.resetDailyCounterIfNeeded();
    return this.settings.autoApplyEnabled && 
           this.settings.applicationsToday < this.settings.dailyApplicationLimit;
  }

  async fillJobApplicationForm(data, tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: this.injectFormFiller,
        args: [data]
      });
    } catch (error) {
      console.error('Failed to fill form:', error);
      throw error;
    }
  }

  // This function will be injected into the page
  injectFormFiller(data) {
    const { userProfile, config } = data;
    
    // Form filling logic
    const fillField = (selectors, value) => {
      if (!value) return false;
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element.type === 'select-one') {
            // Handle select dropdowns
            const options = Array.from(element.options);
            const matchingOption = options.find(option => 
              option.text.toLowerCase().includes(value.toLowerCase()) ||
              option.value.toLowerCase().includes(value.toLowerCase())
            );
            if (matchingOption) {
              element.value = matchingOption.value;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          } else if (element.type === 'checkbox' || element.type === 'radio') {
            // Handle checkboxes and radio buttons
            if (element.value.toLowerCase() === value.toLowerCase() ||
                element.nextElementSibling?.textContent?.toLowerCase().includes(value.toLowerCase())) {
              element.checked = true;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          } else {
            // Handle text inputs
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
      }
      return false;
    };

    // Fill personal details
    if (userProfile.personalDetails) {
      const pd = userProfile.personalDetails;
      fillField(config.selectors.firstName, pd.firstName);
      fillField(config.selectors.lastName, pd.lastName);
      fillField(config.selectors.email, pd.email);
      fillField(config.selectors.phone, pd.phone);
      fillField(config.selectors.linkedinUrl, pd.linkedinUrl);
      fillField(config.selectors.portfolioUrl, pd.portfolioUrl);
      
      if (pd.currentAddress) {
        fillField(config.selectors.city, pd.currentAddress.city);
        fillField(config.selectors.state, pd.currentAddress.state);
        fillField(config.selectors.country, pd.currentAddress.country);
        fillField(config.selectors.zipCode, pd.currentAddress.zipCode);
      }
    }

    // Fill professional details
    if (userProfile.professionalDetails) {
      const prof = userProfile.professionalDetails;
      fillField(config.selectors.currentCompany, prof.currentCompany);
      fillField(config.selectors.currentTitle, prof.currentJobTitle);
      fillField(config.selectors.experience, prof.experienceYears?.toString());
      fillField(config.selectors.skills, prof.skills?.join(', '));
    }

    // Fill work authorization
    if (userProfile.workAuthorization) {
      const wa = userProfile.workAuthorization;
      fillField(config.selectors.workAuthorization, wa.legallyAuthorized ? 'yes' : 'no');
      fillField(config.selectors.sponsorship, wa.requiresSponsorship ? 'yes' : 'no');
    }

    // Fill employment preferences
    if (userProfile.employmentPreferences) {
      const ep = userProfile.employmentPreferences;
      fillField(config.selectors.noticePeriod, ep.noticePeriod);
      fillField(config.selectors.salary, ep.desiredSalary?.min?.toString());
      fillField(config.selectors.relocation, ep.willingToRelocate ? 'yes' : 'no');
    }

    // Add visual feedback
    const filledElements = document.querySelectorAll('input[value], select[value], textarea[value]');
    filledElements.forEach(element => {
      if (element.value) {
        element.style.backgroundColor = '#e6ffed';
        element.style.border = '2px solid #28a745';
      }
    });

    // Show notification
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #28a745; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial, sans-serif;">
        <strong>AutoJobr:</strong> Form filled successfully!
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; margin-left: 10px; cursor: pointer;">×</button>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  async saveApplication(applicationData) {
    try {
      // Increment daily counter
      this.settings.applicationsToday++;
      await this.saveSettings();

      // Save to local storage for now (in production, sync with backend)
      const applications = await chrome.storage.local.get(['applications']);
      const allApplications = applications.applications || [];
      
      allApplications.push({
        ...applicationData,
        id: Date.now().toString(),
        appliedDate: new Date().toISOString(),
        status: 'applied',
        source: 'extension'
      });

      await chrome.storage.local.set({ applications: allApplications });
      
      // Notify web app if possible
      this.notifyWebApp('APPLICATION_SAVED', applicationData);
      
    } catch (error) {
      console.error('Failed to save application:', error);
      throw error;
    }
  }

  async saveSettings() {
    await chrome.storage.sync.set({ settings: this.settings });
  }

  notifyWebApp(type, data) {
    // Try to communicate with the web app
    try {
      chrome.tabs.query({ url: '*://localhost:*/*' }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { type, data }).catch(() => {
            // Ignore errors if web app is not listening
          });
        });
      });
    } catch (error) {
      // Ignore communication errors
    }
  }
}

// Initialize background script
new AutoJobrBackground();
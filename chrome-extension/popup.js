// Popup script for AutoJobr Chrome Extension
class AutoJobrPopup {
  constructor() {
    this.userProfile = null;
    this.settings = null;
    this.currentTab = null;
    
    this.init();
  }

  async init() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.currentTab = tabs[0];

    // Load user data and settings
    await this.loadUserData();
    
    // Setup UI
    this.setupUI();
    
    // Check if user is logged in
    if (this.userProfile) {
      this.showDashboard();
    } else {
      this.showLoginScreen();
    }
  }

  async loadUserData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_USER_DATA' });
      if (response.success) {
        this.userProfile = response.data;
      }

      const settingsResponse = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (settingsResponse.success) {
        this.settings = settingsResponse.data;
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  setupUI() {
    // Login button
    document.getElementById('login-btn')?.addEventListener('click', () => {
      this.openDashboard();
    });

    // Auto-apply toggle
    document.getElementById('auto-apply-toggle')?.addEventListener('click', () => {
      this.toggleAutoApply();
    });

    // Smart filter toggle
    document.getElementById('smart-filter-toggle')?.addEventListener('click', () => {
      this.toggleSmartFilter();
    });

    // Fill form button
    document.getElementById('fill-form-btn')?.addEventListener('click', () => {
      this.fillCurrentForm();
    });

    // Save job button
    document.getElementById('save-job-btn')?.addEventListener('click', () => {
      this.saveCurrentJob();
    });

    // Open dashboard button
    document.getElementById('open-dashboard-btn')?.addEventListener('click', () => {
      this.openDashboard();
    });
  }

  showLoginScreen() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update dashboard data
    this.updateDashboard();
  }

  updateDashboard() {
    if (this.settings) {
      document.getElementById('applications-today').textContent = this.settings.applicationsToday || 0;
      document.getElementById('daily-limit').textContent = this.settings.dailyApplicationLimit || 10;
      
      // Update toggle states
      const autoApplyToggle = document.getElementById('auto-apply-toggle');
      if (this.settings.autoApplyEnabled) {
        autoApplyToggle.classList.add('active');
      } else {
        autoApplyToggle.classList.remove('active');
      }
    }
  }

  async toggleAutoApply() {
    const toggle = document.getElementById('auto-apply-toggle');
    const isActive = toggle.classList.contains('active');
    
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        data: { autoApplyEnabled: !isActive }
      });
      
      if (isActive) {
        toggle.classList.remove('active');
      } else {
        toggle.classList.add('active');
      }
      
      this.showNotification(
        `Auto-apply ${!isActive ? 'enabled' : 'disabled'}`,
        'success'
      );
    } catch (error) {
      this.showNotification('Failed to update settings', 'error');
    }
  }

  async toggleSmartFilter() {
    const toggle = document.getElementById('smart-filter-toggle');
    const isActive = toggle.classList.contains('active');
    
    // Toggle visual state
    if (isActive) {
      toggle.classList.remove('active');
    } else {
      toggle.classList.add('active');
    }
    
    this.showNotification(
      `Smart filtering ${!isActive ? 'enabled' : 'disabled'}`,
      'success'
    );
  }

  async fillCurrentForm() {
    if (!this.userProfile) {
      this.showNotification('Please sign in first', 'error');
      return;
    }

    try {
      // Send message to content script
      await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'FILL_FORM',
        data: this.userProfile
      });
      
      this.showNotification('Form filled successfully!', 'success');
      
      // Close popup after a delay
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      console.error('Failed to fill form:', error);
      this.showNotification('Failed to fill form', 'error');
    }
  }

  async saveCurrentJob() {
    try {
      // Send message to content script to extract job data
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        type: 'EXTRACT_JOB_DATA'
      });
      
      if (response && response.success) {
        await chrome.runtime.sendMessage({
          type: 'SAVE_APPLICATION',
          data: response.jobData
        });
        
        this.showNotification('Job saved to tracker!', 'success');
      } else {
        this.showNotification('Could not extract job data', 'error');
      }
    } catch (error) {
      console.error('Failed to save job:', error);
      this.showNotification('Failed to save job', 'error');
    }
  }

  openDashboard() {
    chrome.tabs.create({
      url: 'http://localhost:5173'
    });
    window.close();
  }

  showNotification(message, type = 'info') {
    // Create a simple notification in the popup
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      text-align: center;
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new AutoJobrPopup();
});
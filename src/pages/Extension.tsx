import React, { useState, useEffect } from 'react';
import { 
  Chrome, 
  Download, 
  Settings, 
  Zap, 
  Shield, 
  Target,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  BarChart3,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { chromeExtensionService } from '../services/chromeExtension';

interface ExtensionProps {
  user: UserProfile;
}

const Extension: React.FC<ExtensionProps> = ({ user }) => {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(user.settings?.autoApplyEnabled || false);
  const [dailyLimit, setDailyLimit] = useState(user.settings?.dailyApplicationLimit || 10);
  const [applicationFilters, setApplicationFilters] = useState({
    keywords: user.settings?.applicationFilters?.keywords || [],
    excludeKeywords: user.settings?.applicationFilters?.excludeKeywords || [],
    salaryMin: user.settings?.applicationFilters?.salaryMin || 100000,
    experienceLevel: user.settings?.applicationFilters?.experienceLevel || []
  });

  useEffect(() => {
    checkExtensionStatus();
  }, []);

  const checkExtensionStatus = async () => {
    try {
      setLoading(true);
      const installed = await chromeExtensionService.checkExtensionInstalled();
      setIsExtensionInstalled(installed);
    } catch (error) {
      console.error('Failed to check extension status:', error);
      setIsExtensionInstalled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallExtension = () => {
    // In a real app, this would trigger the Chrome extension installation
    window.open('https://chrome.google.com/webstore/detail/autojobr/extension-id', '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Extension Status</h3>
            <p className="text-gray-600">Connecting to Chrome extension...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Chrome className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">AutoJobr Chrome Extension</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Welcome back, {user.personalDetails.firstName}! Automate your job applications with intelligent filters and one-click apply functionality.
        </p>
      </div>

      {/* Installation Section */}
      {!isExtensionInstalled ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8 border border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started in Seconds</h2>
            <p className="text-gray-600 mb-6">
              Install the AutoJobr Chrome extension and start automating your job applications today.
            </p>
            <button
              onClick={handleInstallExtension}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Add to Chrome - It's Free</span>
            </button>
            <p className="text-sm text-gray-500 mt-3">
              Works with Chrome, Edge, and other Chromium-based browsers
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">Extension Connected Successfully!</h3>
              <p className="text-green-700">Your Chrome extension is synced with your profile data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Apply</h3>
          <p className="text-gray-600">
            Apply to multiple jobs with a single click. Auto-fill forms with your saved information.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Filtering</h3>
          <p className="text-gray-600">
            Set intelligent filters to only apply to jobs that match your criteria and preferences.
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Safe & Secure</h3>
          <p className="text-gray-600">
            Your data is encrypted and stored securely. Full control over what gets shared.
          </p>
        </div>
      </div>

      {/* Extension Configuration */}
      {isExtensionInstalled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Settings Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Extension Settings</h3>
              <div className="flex items-center space-x-2">
                {autoApplyEnabled ? (
                  <span className="flex items-center text-green-600">
                    <Play className="w-4 h-4 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center text-gray-600">
                    <Pause className="w-4 h-4 mr-1" />
                    Paused
                  </span>
                )}
                <button
                  onClick={() => setAutoApplyEnabled(!autoApplyEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoApplyEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoApplyEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Application Limit
                </label>
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 10-15 applications per day for best results
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Keywords
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {applicationFilters.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add keywords (press Enter)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclude Keywords
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {applicationFilters.excludeKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add exclude keywords (press Enter)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary ($)
                </label>
                <input
                  type="number"
                  value={applicationFilters.salaryMin}
                  onChange={(e) => setApplicationFilters({
                    ...applicationFilters,
                    salaryMin: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Extension Statistics</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Today's Applications</p>
                  <p className="text-2xl font-bold text-blue-600">7</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-900">This Week</p>
                  <p className="text-2xl font-bold text-green-600">32</p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-900">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">18%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Applied to Frontend Developer at TechCorp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Applied to React Developer at StartupXYZ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">Skipped: Senior role at BigTech (excluded keyword)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Job Boards */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Supported Job Boards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            'LinkedIn', 'Indeed', 'Glassdoor', 'AngelList',
            'Monster', 'ZipRecruiter', 'Naukri', 'Workday'
          ].map((platform) => (
            <div key={platform} className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-semibold text-gray-600">{platform.charAt(0)}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">{platform}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Extension;
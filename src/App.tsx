import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Analytics from './pages/Analytics';
import Extension from './pages/Extension';
import LoginForm from './components/Auth/LoginForm';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import { UserProfile } from './types';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and onboarded
    const checkUserStatus = async () => {
      try {
        // In production, this would check authentication status
        const savedUser = localStorage.getItem('autojobr_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Simple demo authentication - in production, this would authenticate with backend
      const mockUser: Partial<UserProfile> = {
        id: '1',
        email: email,
        isOnboarded: false,
        personalDetails: {
          firstName: '',
          lastName: '',
          email: email,
          phone: '',
          currentAddress: {
            city: '',
            state: '',
            country: ''
          }
        },
        professionalDetails: {
          experienceYears: 0,
          skills: [],
          education: [],
          certifications: [],
          languages: []
        },
        workAuthorization: {
          countryOfWork: '',
          legallyAuthorized: false,
          requiresSponsorship: false,
          currentStatus: 'citizen'
        },
        employmentPreferences: {
          noticePeriod: '',
          earliestStartDate: new Date(),
          willingToRelocate: false,
          desiredSalary: {
            min: 0,
            max: 0,
            currency: 'USD',
            period: 'yearly'
          },
          employmentTypes: [],
          preferredLocations: [],
          remotePreference: 'flexible'
        },
        backgroundInfo: {
          workedAtCompanyBefore: false,
          familyInCompany: false,
          conflictOfInterest: false,
          criminalRecord: false
        },
        documents: {},
        settings: {
          autoApplyEnabled: false,
          dailyApplicationLimit: 10,
          applicationFilters: {
            keywords: [],
            excludeKeywords: [],
            experienceLevel: [],
            companyTypes: [],
            jobTypes: []
          },
          notifications: {
            email: true,
            browser: true,
            applicationUpdates: true,
            jobAlerts: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUser(mockUser as UserProfile);
      localStorage.setItem('autojobr_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      // Simple demo signup - in production, this would create account with backend
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const mockUser: Partial<UserProfile> = {
        id: Date.now().toString(),
        email: email,
        isOnboarded: false,
        personalDetails: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: '',
          currentAddress: {
            city: '',
            state: '',
            country: ''
          }
        },
        professionalDetails: {
          experienceYears: 0,
          skills: [],
          education: [],
          certifications: [],
          languages: []
        },
        workAuthorization: {
          countryOfWork: '',
          legallyAuthorized: false,
          requiresSponsorship: false,
          currentStatus: 'citizen'
        },
        employmentPreferences: {
          noticePeriod: '',
          earliestStartDate: new Date(),
          willingToRelocate: false,
          desiredSalary: {
            min: 0,
            max: 0,
            currency: 'USD',
            period: 'yearly'
          },
          employmentTypes: [],
          preferredLocations: [],
          remotePreference: 'flexible'
        },
        backgroundInfo: {
          workedAtCompanyBefore: false,
          familyInCompany: false,
          conflictOfInterest: false,
          criminalRecord: false
        },
        documents: {},
        settings: {
          autoApplyEnabled: false,
          dailyApplicationLimit: 10,
          applicationFilters: {
            keywords: [],
            excludeKeywords: [],
            experienceLevel: [],
            companyTypes: [],
            jobTypes: []
          },
          notifications: {
            email: true,
            browser: true,
            applicationUpdates: true,
            jobAlerts: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setUser(mockUser as UserProfile);
      localStorage.setItem('autojobr_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup failed:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleOnboardingComplete = (profileData: Partial<UserProfile>) => {
    const updatedUser = {
      ...user,
      ...profileData,
      isOnboarded: true,
      updatedAt: new Date()
    } as UserProfile;

    setUser(updatedUser);
    localStorage.setItem('autojobr_user', JSON.stringify(updatedUser));

    // Sync with Chrome extension if available
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_USER_DATA',
        data: updatedUser
      }).catch(() => {
        // Extension not available, ignore
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AutoJobr...</p>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return <LoginForm onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  // Show onboarding if user not onboarded
  if (!user.isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show main app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="extension" element={<Extension />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
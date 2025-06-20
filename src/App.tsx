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
import { authService } from './services/authService';
import { chromeExtensionService } from './services/chromeExtension';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      // Check if user is authenticated
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        setAuthUser(currentUser);
        
        // Get user profile
        const userProfile = await authService.getUserProfile(currentUser.id);
        if (userProfile) {
          setUser(userProfile);
          
          // Sync with Chrome extension if available
          syncWithExtension(userProfile);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithExtension = async (userProfile: UserProfile) => {
    try {
      const isExtensionInstalled = await chromeExtensionService.checkExtensionInstalled();
      if (isExtensionInstalled) {
        await chromeExtensionService.sendMessage({
          type: 'UPDATE_USER_DATA',
          data: userProfile
        });
        console.log('✅ User data synced with Chrome extension');
      }
    } catch (error) {
      console.log('Chrome extension not available or not installed');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const authUser = await authService.signIn(email, password);
      setAuthUser(authUser);
      
      const userProfile = await authService.getUserProfile(authUser.id);
      if (userProfile) {
        setUser(userProfile);
        syncWithExtension(userProfile);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const authUser = await authService.signUp(email, password, firstName, lastName);
      setAuthUser(authUser);
      
      const userProfile = await authService.getUserProfile(authUser.id);
      if (userProfile) {
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  const handleOnboardingComplete = async (profileData: Partial<UserProfile>) => {
    if (!authUser) return;
    
    try {
      await authService.updateUserProfile(authUser.id, {
        ...profileData,
        isOnboarded: true
      });
      
      const updatedProfile = await authService.getUserProfile(authUser.id);
      if (updatedProfile) {
        setUser(updatedProfile);
        syncWithExtension(updatedProfile);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading AutoJobr</h2>
          <p className="text-blue-100">Connecting to your workspace...</p>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!authUser || !user) {
    return <LoginForm onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  // Show onboarding if user not onboarded
  if (!user.isOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} initialData={user} />;
  }

  // Show main app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Home user={user} />} />
          <Route path="jobs" element={<Jobs user={user} />} />
          <Route path="applications" element={<Applications user={user} />} />
          <Route path="analytics" element={<Analytics user={user} />} />
          <Route path="extension" element={<Extension user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
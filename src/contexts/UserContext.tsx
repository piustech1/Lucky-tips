import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { ref, onValue, set, update, get } from 'firebase/database';
import { auth, rtdb } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebaseUtils';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  photoURL: string;
  subscriptionTier: 'free' | 'vip';
  subscriptionExpiry: string | null;
  lastActivated?: number;
  isAdmin: boolean;
  createdAt: number | string;
  sessionId?: string;
}

interface UserContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isVip: boolean;
  isAdmin: boolean;
  phoneNumber?: string;
  setPhoneNumber: (phone: string) => void;
  setIsVip: (value: boolean) => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
        if (firebaseUser) {
        // Store display name for logged out page if needed
        if (firebaseUser.displayName) {
          localStorage.setItem('last_logged_in_user', firebaseUser.displayName);
        }

        // Handle Session Management (Single Device Login)
        const currentSessionId = localStorage.getItem('lucky_tips_session_id');
        if (!currentSessionId) {
          const newSessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('lucky_tips_session_id', newSessionId);
          await update(ref(rtdb, `users/${firebaseUser.uid}`), { sessionId: newSessionId });
        }

        // Listen to profile changes in Realtime Database
        const profileRef = ref(rtdb, `users/${firebaseUser.uid}`);
        
        const unsubscribeProfile = onValue(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            const profileData = snapshot.val() as UserProfile;
            const storedSessionId = localStorage.getItem('lucky_tips_session_id');

            // If session IDs don't match, log out (Second device logged in)
            if (profileData.sessionId && storedSessionId && profileData.sessionId !== storedSessionId) {
              // Log the conflict for admin review
              const conflictRef = ref(rtdb, `device_conflicts/${firebaseUser.uid}`);
              set(conflictRef, {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Anonymous',
                timestamp: Date.now(),
                attemptedSessionId: profileData.sessionId,
                currentSessionId: storedSessionId,
                status: 'flagged'
              });

              auth.signOut();
              localStorage.removeItem('lucky_tips_session_id');
              window.location.href = '/logged-out';
              return;
            }

            setProfile(profileData);
            if (profileData.phoneNumber) {
              setLocalPhoneNumber(profileData.phoneNumber);
            }
          } else {
            console.log('No RTDB profile found for user');
          }
          setLoading(false);
        }, (error) => {
          console.error('RTDB Profile Error:', error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const profileRef = ref(rtdb, `users/${user.uid}`);
    try {
      await update(profileRef, { ...data, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('RTDB Update Error:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isVip: profile?.subscriptionTier === 'vip',
    isAdmin: profile?.isAdmin || false,
    phoneNumber: localPhoneNumber,
    setPhoneNumber: setLocalPhoneNumber,
    setIsVip: (value: boolean) => {
      if (user) {
        updateProfile({ subscriptionTier: value ? 'vip' : 'free' });
      }
    },
    updateProfile
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

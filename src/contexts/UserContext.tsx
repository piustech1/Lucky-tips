import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  isVip: boolean;
  setIsVip: (value: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  premiumExpiry: string | null;
  setPremiumExpiry: (value: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isVip, setIsVip] = useState(() => {
    return localStorage.getItem('lucky_tips_vip') === 'true';
  });
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem('lucky_tips_phone') || '';
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('lucky_tips_username') || 'Lucky User';
  });
  const [premiumExpiry, setPremiumExpiry] = useState<string | null>(() => {
    return localStorage.getItem('lucky_tips_expiry');
  });

  useEffect(() => {
    localStorage.setItem('lucky_tips_vip', isVip.toString());
  }, [isVip]);

  useEffect(() => {
    localStorage.setItem('lucky_tips_phone', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    localStorage.setItem('lucky_tips_username', username);
  }, [username]);

  useEffect(() => {
    if (premiumExpiry) {
      localStorage.setItem('lucky_tips_expiry', premiumExpiry);
    } else {
      localStorage.removeItem('lucky_tips_expiry');
    }
  }, [premiumExpiry]);

  return (
    <UserContext.Provider value={{ 
      isVip, setIsVip, 
      phoneNumber, setPhoneNumber,
      username, setUsername,
      premiumExpiry, setPremiumExpiry
    }}>
      {children}
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

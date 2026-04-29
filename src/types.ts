export interface Prediction {
  id: string;
  date: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  tip: string;
  odds: string;
  status: 'won' | 'lost' | 'pending';
  awayOdds?: string;
  homeFlag?: string;
  awayFlag?: string;
  homeLogo?: string;
  awayLogo?: string;
  leagueLogo?: string;
  score?: string;
  isVip?: boolean;
  category?: string;
  createdAt?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'alert';
}

export interface UserStats {
  totalPredictions: number;
  wins: number;
  losses: number;
  pending: number;
  accuracy: number;
}

export interface Feedback {
  name: string;
  email: string;
  type: 'suggestion' | 'bug' | 'complaint' | 'praise';
  message: string;
  createdAt: string;
}

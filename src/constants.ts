import { Trophy, Star, Home, FastForward, Flame, TrendingUp, TrendingDown, Crown, Shield } from 'lucide-react';

export const CATEGORIES = [
  { 
    id: 'all', 
    label: 'All tips', 
    icon: Trophy,
    heroImage: 'https://platform.liverpooloffside.sbnation.com/wp-content/uploads/sites/99/chorus/uploads/chorus_asset/file/26015898/2216992549.jpg?quality=90&strip=all&crop=0%2C0.029463759575727%2C100%2C99.941072480849&w=2400',
    description: 'Every high-value prediction released today'
  },
  { 
    id: 'free', 
    label: 'Free tips', 
    icon: Star,
    heroImage: 'https://img.freepik.com/premium-photo/4k-football-stadium-night_961875-99283.jpg',
    description: 'Expertly selected tips for everyone'
  },
  { 
    id: 'vip', 
    label: 'VIP tips', 
    icon: Crown,
    heroImage: 'https://assets.goal.com/images/v3/bltd58c4d60ecd9275e/GOAL_-_Blank_WEB_-_Facebook_-_2023-06-13T135350.847.png?auto=webp&format=pjpg&width=3840&quality=60',
    description: 'Precision analytics for premium members'
  },
  { 
    id: '1x', 
    label: 'Home Advantage', 
    icon: Home,
    heroImage: 'https://assets.bundesliga.com/contender/2025/4/fcb_m05_2425_olise.jpg', // Using correct score image as fallback or specific one
    description: 'Maximum stability on home ground'
  },
  { 
    id: 'x2', 
    label: 'Away Force', 
    icon: FastForward,
    heroImage: 'https://media.cnn.com/api/v1/images/stellar/prod/220523045550-02-zlatan-ibrahimovic-celebration-0522.jpg?c=16x9&q=h_833,w_1480,c_fill',
    description: 'Powerful predictions for visiting teams'
  },
  { 
    id: 'bts', 
    label: 'Both teams score', 
    icon: Flame,
    heroImage: 'https://i.guim.co.uk/img/media/ced917f337eab6470263656836d2cfdea8640a7d/232_152_5212_3128/master/5212.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=670b9236c43625bc5cdc9b8e03cce30f',
    description: 'High intensity matches with goals'
  },
  { 
    id: 'over25', 
    label: 'Over 2.5 Market', 
    icon: TrendingUp,
    heroImage: 'https://www.balkanweb.com/wp-content/uploads/2024/04/haland1-661x450.jpg',
    description: 'Fast-paced high-scoring encounters'
  },
  { 
    id: 'under25', 
    label: 'Under 2.5 Market', 
    icon: TrendingDown,
    heroImage: 'https://img.freepik.com/free-photo/soccer-stadium-night_23-2151952489.jpg?semt=ais_hybrid&w=740&q=80',
    description: 'Strategic and defensive matchups'
  }
];

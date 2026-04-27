import { Prediction } from '../types';
import { format } from 'date-fns';

const today = format(new Date(), 'yyyy-MM-dd');

export const MOCK_PREDICTIONS: Prediction[] = [
  // FREE TIPS
  {
    id: 'free-1',
    date: today,
    league: 'Premier League',
    homeTeam: 'Arsenal',
    awayTeam: 'Brighton',
    tip: 'Home Win',
    odds: '1.45',
    status: 'won',
    category: 'free',
    score: '2-1'
  },
  {
    id: 'free-2',
    date: today,
    league: 'La Liga',
    homeTeam: 'Getafe',
    awayTeam: 'Real Sociedad',
    tip: 'Under 2.5',
    odds: '1.60',
    status: 'lost',
    category: 'free',
    score: '3-0'
  },
  {
    id: 'free-3',
    date: today,
    league: 'Serie A',
    homeTeam: 'Lazio',
    awayTeam: 'Verona',
    tip: 'Home Win',
    odds: '1.72',
    status: 'pending',
    category: 'free',
    score: '---'
  },

  // VIP TIPS
  {
    id: 'vip-1',
    date: today,
    league: 'Champions League',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Real Madrid',
    tip: 'BTTS & Over 2.5',
    odds: '2.10',
    status: 'won',
    category: 'vip',
    isVip: true,
    score: '3-2'
  },
  {
    id: 'vip-2',
    date: today,
    league: 'Ligue 1',
    homeTeam: 'PSG',
    awayTeam: 'Monaco',
    tip: 'Home Win & Over 1.5',
    odds: '1.85',
    status: 'pending',
    category: 'vip',
    isVip: true,
    score: '---'
  },
  {
    id: 'vip-3',
    date: '2026-04-25',
    league: 'Bundesliga',
    homeTeam: 'Dortmund',
    awayTeam: 'Leipzig',
    tip: 'Over 3.5 Goals',
    odds: '2.45',
    status: 'pending',
    category: 'vip',
    isVip: true,
    score: '---'
  },

  // 1X CATEGORY
  {
    id: '1x-1',
    date: '2026-04-25',
    league: 'EFL Championship',
    homeTeam: 'Leicester',
    awayTeam: 'Sunderland',
    tip: '1X',
    odds: '1.25',
    status: 'won',
    category: '1x',
    score: '1-0'
  },
  {
    id: '1x-2',
    date: '2026-04-25',
    league: 'MLS',
    homeTeam: 'Inter Miami',
    awayTeam: 'NYC FC',
    tip: 'Home Win',
    odds: '1.65',
    status: 'pending',
    category: '1x',
    score: '---'
  },
  {
    id: '1x-3',
    date: '2026-04-25',
    league: 'Premier League',
    homeTeam: 'Liverpool',
    awayTeam: 'Everton',
    tip: '1X',
    odds: '1.18',
    status: 'pending',
    category: '1x',
    score: '---'
  },

  // X2 CATEGORY
  {
    id: 'x2-1',
    date: '2026-04-25',
    league: 'Serie A',
    homeTeam: 'Empoli',
    awayTeam: 'Inter Milan',
    tip: 'Away Win',
    odds: '1.55',
    status: 'lost',
    category: 'x2',
    score: '2-1'
  },
  {
    id: 'x2-2',
    date: '2026-04-25',
    league: 'La Liga',
    homeTeam: 'Cadiz',
    awayTeam: 'Barcelona',
    tip: 'X2',
    odds: '1.22',
    status: 'pending',
    category: 'x2',
    score: '---'
  },
  {
    id: 'x2-3',
    date: '2026-04-25',
    league: 'Bundesliga',
    homeTeam: 'Cologne',
    awayTeam: 'Leverkusen',
    tip: 'Away Win',
    odds: '1.40',
    status: 'pending',
    category: 'x2',
    score: '---'
  },

  // BTS CATEGORY
  {
    id: 'bts-1',
    date: '2026-04-25',
    league: 'Eredivisie',
    homeTeam: 'Ajax',
    awayTeam: 'PSV',
    tip: 'BTS - Yes',
    odds: '1.50',
    status: 'won',
    category: 'bts',
    score: '2-2'
  },
  {
    id: 'bts-2',
    date: '2026-04-25',
    league: 'Turkey Super Lig',
    homeTeam: 'Galatasaray',
    awayTeam: 'Fenerbahce',
    tip: 'BTS - Yes',
    odds: '1.58',
    status: 'pending',
    category: 'bts',
    score: '---'
  },
  {
    id: 'bts-3',
    date: '2026-04-25',
    league: 'Scotland Premiership',
    homeTeam: 'Celtic',
    awayTeam: 'Rangers',
    tip: 'BTS - Yes',
    odds: '1.52',
    status: 'pending',
    category: 'bts',
    score: '---'
  },

  // OVER 2.5 CATEGORY
  {
    id: 'ov-1',
    date: '2026-04-25',
    league: 'Norway Eliteserien',
    homeTeam: 'Bodo/Glimt',
    awayTeam: 'Molde',
    tip: 'Over 2.5',
    odds: '1.65',
    status: 'won',
    category: 'over25',
    score: '3-1'
  },
  {
    id: 'ov-2',
    date: '2026-04-25',
    league: 'Austria Bundesliga',
    homeTeam: 'Salzburg',
    awayTeam: 'LASK',
    tip: 'Over 2.5',
    odds: '1.70',
    status: 'pending',
    category: 'over25',
    score: '---'
  },
  {
    id: 'ov-3',
    date: '2026-04-25',
    league: 'Belgium Pro League',
    homeTeam: 'Gent',
    awayTeam: 'Anderlecht',
    tip: 'Over 2.5',
    odds: '1.80',
    status: 'pending',
    category: 'over25',
    score: '---'
  },

  // UNDER 2.5 CATEGORY
  {
    id: 'un-1',
    date: '2026-04-25',
    league: 'Greence Super League',
    homeTeam: 'Panathinaikos',
    awayTeam: 'Olympiacos',
    tip: 'Under 2.5',
    odds: '1.75',
    status: 'lost',
    category: 'under25',
    score: '2-1'
  },
  {
    id: 'un-2',
    date: '2026-04-25',
    league: 'Segunda Division',
    homeTeam: 'Eibar',
    awayTeam: 'Leganes',
    tip: 'Under 2.5',
    odds: '1.55',
    status: 'pending',
    category: 'under25',
    score: '---'
  },
  {
    id: 'un-3',
    date: '2026-04-25',
    league: 'Argentina Liga',
    homeTeam: 'Boca Juniors',
    awayTeam: 'River Plate',
    tip: 'Under 2.5',
    odds: '1.62',
    status: 'pending',
    category: 'under25',
    score: '---'
  },
];

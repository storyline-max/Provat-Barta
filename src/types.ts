export type Category = 
  | 'front-page'
  | 'national'
  | 'politics'
  | 'world'
  | 'international'
  | 'business'
  | 'opinion'
  | 'tech'
  | 'technology'
  | 'arts'
  | 'sports'
  | 'puzzles'
  | 'partner-program'
  | 'archive';

export interface Article {
  id: string;
  title: string;
  bengaliTitle?: string;
  subtitle?: string;
  category: Category;
  author: {
    name: string;
    role: string;
    avatar?: string;
    location: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  imageCaption: string;
  imageCredit: string;
  leadParagraph: string;
  bodyParagraphs: string[];
  pullQuote?: string;
  pullQuoteAuthor?: string;
  keyTakeaways?: string[];
  isBreaking?: boolean;
  isUrgent?: boolean;
  urgencyLevel?: 'breaking' | 'urgent' | 'standard';
  isLeadStory?: boolean;
  isOpinion?: boolean;
  sharesCount: number;
  viewsCount: number;
  adRevenueEstimate: number; // in BDT
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface ForecastDay {
  day: string; // e.g., 'Sat'
  date: string; // e.g., 'Sep 5'
  high: number;
  low: number;
  condition: string;
  precipitationChance: number;
  humidity: number;
}

export interface CityForecast {
  id: string;
  city: string;
  country: string;
  unit: '°F' | '°C';
  currentTemp: number;
  currentCondition: string;
  forecast: ForecastDay[];
}

export interface WeatherReport {
  city: string;
  temp: string;
  condition: string;
  highLow: string;
  forecast?: ForecastDay[];
}

export interface WeatherAlert {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  type: 'heat' | 'storm' | 'freeze' | 'monsoon' | 'wind';
  severity: 'warning' | 'watch' | 'advisory';
  headline: string;
  triggerCondition: string;
  metricValue: string;
  thresholdCrossed: string;
  effectiveDate: string;
  description: string;
  safetyAdvice: string[];
  issuedBy: string;
  urgency: 'Immediate' | 'Expected' | 'Future Watch';
}

export interface AffiliateUser {
  id: string;
  name: string;
  affiliateId: string;
  referralCode: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalClicks: number;
  totalShares: number;
  paymentMethod: 'bkash' | 'nagad' | 'bank' | 'crypto';
  paymentAccount: string;
}

export interface WithdrawalRecord {
  id: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'processing' | 'completed';
  timestamp: string;
  txId?: string;
}

export interface ArchiveEdition {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  displayDate: string; // e.g. 'Saturday, September 5, 2026'
  bengaliDate?: string; // e.g. '২০ ভাদ্র, ১৪৩৩ বঙ্গাব্দ'
  volumeNumber: string; // 'Vol. CXLII No. 48,219'
  editionName: string; // 'US National Late Edition'
  leadHeadline: string;
  leadBengaliHeadline?: string;
  leadSummary: string;
  leadImageUrl: string;
  leadImageCaption: string;
  pageCount: number;
  specialNotice?: string;
  weatherSnapshot: string;
  circulationEstimate: string;
  featuredStories: {
    id?: string;
    title: string;
    bengaliTitle?: string;
    category: string;
    author: string;
    snippet: string;
  }[];
  microfilmPages?: {
    pageNumber: string;
    section: string;
    title: string;
    summary: string;
  }[];
}

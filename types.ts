export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CROP_MANAGEMENT = 'CROP_MANAGEMENT',
  CROP_SCANNER = 'CROP_SCANNER',
  AI_ADVISOR = 'AI_ADVISOR',
  DAILY_ADVISORY = 'DAILY_ADVISORY',
  MARKET_HUB = 'MARKET_HUB',
  PRICE_ANALYTICS = 'PRICE_ANALYTICS',
  PRICE_FORECAST = 'PRICE_FORECAST',
  MARKET_INTELLIGENCE = 'MARKET_INTELLIGENCE',
  HARVEST_OPTIMIZER = 'HARVEST_OPTIMIZER',
  COMMUNITY = 'COMMUNITY',
  EXPERT_HUB = 'EXPERT_HUB',
  VOICE_ADVISOR = 'VOICE_ADVISOR',
  SUCCESS_STORIES = 'SUCCESS_STORIES',
  GOVT_SCHEMES = 'GOVT_SCHEMES',
  GRAPE_ADVISORY = 'GRAPE_ADVISORY',
  ONION_ADVISORY = 'ONION_ADVISORY',
  TOMATO_ADVISORY = 'TOMATO_ADVISORY',
  NUTRIENT_PLANNER = 'NUTRIENT_PLANNER',
  IPM_SCHEDULER = 'IPM_SCHEDULER',
  CLIMATE_INSIGHTS = 'CLIMATE_INSIGHTS',
  PREDICTION = 'PREDICTION',
  IRRIGATION = 'IRRIGATION',
  IMPACT = 'IMPACT',
  PROFILE = 'PROFILE',
  OFFLINE_SETTINGS = 'OFFLINE_SETTINGS',
  ADVISORY_SERVICE = 'ADVISORY_SERVICE',
  NOTIFICATION_SETTINGS = 'NOTIFICATION_SETTINGS',
  NOTIFICATION_DASHBOARD = 'NOTIFICATION_DASHBOARD',
  SYSTEM_JOBS = 'SYSTEM_JOBS',
  ADMIN_ANALYTICS = 'ADMIN_ANALYTICS',
  QA_DASHBOARD = 'QA_DASHBOARD'
}

export interface PipelineStage {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  durationMs: number;
  logs: string[];
}

export interface TestCoverage {
  unit: number;
  integration: number;
  e2e: number;
  total: number;
}

export interface UATFeedback {
  id: string;
  userId: string;
  userName: string;
  role: string;
  rating: number;
  comment: string;
  category: 'Usability' | 'Accuracy' | 'Performance' | 'Feature Request';
  timestamp: string;
}

export interface LoadTestMetric {
  concurrentUsers: number;
  avgLatency: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

// ... Existing interfaces for BusinessMetrics, FeatureUsage, etc.
export interface BusinessMetrics {
  dau: number;
  mau: number;
  retentionRate: number;
  avgSessionMinutes: number;
  totalUsers: number;
}

export interface FeatureUsage {
  feature: string;
  count: number;
  growth: number;
}

export interface ImpactMetrics {
  yieldIncreasePercent: number;
  waterSavedLiters: number;
  incomeGrowthPercent: number;
  advisoryCompliance: number;
}

export interface PerformanceStats {
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
}

export type JobStatus = 'IDLE' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface BackgroundJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: JobStatus;
  lastRun: string;
  nextRun: string;
  avgDurationMs: number;
  successRate: number;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  type: 'USER_ACTION' | 'SENSOR_TRIGGER' | 'CLIMATE_ALERT' | 'MARKET_SHIFT';
  message: string;
  source: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type NotificationChannel = 'PUSH' | 'SMS' | 'VOICE' | 'EMAIL' | 'IN_APP';
export type NotificationCategory = 'WEATHER' | 'MARKET' | 'COMMUNITY' | 'ADVISORY' | 'SYSTEM';

export interface NotificationAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

export interface Activity {
  id: string;
  type: 'Irrigated' | 'Fertilized' | 'Pest Spotted' | 'Pruned' | 'Harvested' | 'Other';
  date: string;
  notes: string;
  photoUrl?: string;
}

export interface CostRecord {
  id: string;
  category: 'Seeds' | 'Fertilizer' | 'Labor' | 'Irrigation' | 'Equipment';
  amount: number;
  date: string;
}

export interface Crop {
  cropId: string;
  userId: string;
  cropType: 'Grape' | 'Onion' | 'Tomato' | string;
  variety: string;
  plantingDate: string;
  currentStage: string;
  farmSize: number;
  plotLocation?: string;
  irrigationMethod: 'drip' | 'sprinkler' | 'flood';
  healthScore: number;
  soilData?: SoilTestData;
  milestones: CropMilestone[];
  yieldHistory?: { season: string; amount: number; unit: string }[];
  lastAnalysis?: string;
  images?: string[];
  activities: Activity[];
  costs: CostRecord[];
  targetYield: number;
}

export interface MarketAlert {
  id: string;
  cropType: string;
  thresholdPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: string;
}

export interface Market {
  id: string;
  name: string;
  address: string;
  contact: string;
  hours: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  photos: string[];
}

export interface GovtScheme {
  id: string;
  name: string;
  authority: 'Central' | 'State';
  category: 'Irrigation' | 'Equipment' | 'Insurance' | 'Subsidy' | 'Organic';
  description: string;
  subsidyPercent?: number;
  maxBenefit: string;
  eligibility: {
    maxLandSize?: number;
    cropTypes: string[];
    caste?: string[];
    incomeLimit?: number;
  };
  documents: string[];
  deadline?: string;
  officialUrl: string;
  impactScore: number;
}

export interface SchemeApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  status: 'Draft' | 'Submitted' | 'Verified' | 'Approved' | 'Rejected';
  appliedDate: string;
  trackingNumber?: string;
  nextStep?: string;
  lastUpdate: string;
}

export type StoryCategory = 'Irrigation' | 'Organic' | 'Pest Mgmt' | 'Market' | 'Tech Adoption';

export interface StoryMetric {
  label: string;
  value: string;
  improvement: string;
}

export interface StoryStep {
  title: string;
  description: string;
}

export interface SuccessStory {
  id: string;
  farmerName: string;
  location: string;
  cropType: string;
  category: StoryCategory;
  title: string;
  problem: string;
  solution: string;
  result: string;
  metrics: StoryMetric[];
  steps: StoryStep[];
  imageUrl: string;
  beforeImageUrl?: string;
  videoUrl?: string;
  likes: number;
  shares: number;
  createdAt: string;
}

export interface VoiceConversation {
  id: string;
  timestamp: string;
  queryText: string;
  responseText: string;
  audioBlobUrl?: string;
  cropContext?: string;
}

export interface ExpertProfile {
  id: string;
  name: string;
  role: 'Agronomist' | 'Pathologist' | 'Soil Scientist' | 'Extension Officer';
  specializations: string[];
  credentials: string[];
  rating: number;
  reviewCount: number;
  languages: string[];
  responseTime: string;
  availability: { day: string; slots: string[] }[];
  verified: boolean;
  avatar?: string;
  bio: string;
}

export interface ExpertQuestion {
  id: string;
  userId: string;
  expertId?: string;
  title: string;
  content: string;
  cropType: string;
  urgency: 'Standard' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Answered' | 'Closed';
  attachmentUrls?: string[];
  answer?: {
    expertId: string;
    content: string;
    timestamp: string;
    references: { title: string; url: string }[];
    isVerifiedSolution: boolean;
  };
  createdAt: string;
}

export interface ConsultationSession {
  id: string;
  userId: string;
  expertId: string;
  expertName: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  topic: string;
  meetingLink?: string;
}

export type ForumCategory = 'General' | 'Crop Management' | 'Pest Control' | 'Market Trends' | 'Climate Change' | 'Equipment';

export interface CommunityReply {
  replyId: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userBadge?: 'Expert' | 'Progressive Farmer';
  content: string;
  createdAt: string;
  upvotes: number;
  isExpertAnswer: boolean;
  isHelpful: boolean;
  replies?: CommunityReply[];
}

export interface CommunityPost {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userReputation?: number;
  title: string;
  content: string;
  snippet?: string;
  cropType: string;
  category: ForumCategory;
  location: { village: string; district: string };
  tags: string[];
  imageUrl?: string;
  imageGallery?: string[];
  upvotes: number;
  viewCount: number;
  replyCount: number;
  isExpertVerified: boolean;
  isFlagged: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  createdAt: string;
  replies: CommunityReply[];
}

export interface MaturityMetric {
  name: string;
  value: number | string;
  target: number | string;
  status: 'optimal' | 'pending' | 'warning';
  unit: string;
}

export interface HarvestScenario {
  date: string;
  label: string;
  estimatedPrice: number;
  estimatedWeight: number;
  storageCost: number;
  shrinkageLoss: number;
  grossReturn: number;
  netReturn: number;
  confidence: number;
}

export interface HarvestAdvisory {
  cropId: string;
  cropType: string;
  optimalWindow: { start: string; end: string };
  harvestIndex: number;
  maturityMetrics: MaturityMetric[];
  scenarios: HarvestScenario[];
  weatherSuitability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  weatherReason: string;
  laborChecklist: { item: string; completed: boolean }[];
  marketContext: string;
}

export interface MarketOpportunity {
  mandiId: string;
  mandiName: string;
  commodity: string;
  currentPrice: number;
  changePercent: number;
  distanceKm: number;
  isBestPrice: boolean;
  arrivalVolume: string;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  category: 'policy' | 'export' | 'production' | 'event';
  summary: string;
  impactScore: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  commodity: string;
  mandiName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalRealization: number;
}

export interface SellRecommendation {
  action: 'Sell Now' | 'Wait 3-5 Days' | 'Hold (Storage)';
  reasoning: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  projectedPriceChange: number;
  expectedProfit: number;
}

export interface FeatureImportance {
  feature: string;
  weight: number;
  impact: 'positive' | 'negative';
}

export interface PricePredictionPoint {
  date: string;
  predictedPrice: number;
  confidenceUpper: number;
  confidenceLower: number;
}

export interface PricePredictionOutcome {
  cropId: string;
  cropType: string;
  timeframe: '7d' | '15d';
  predictions: PricePredictionPoint[];
  metrics: {
    mape: number;
    baselineMape: number;
    lastRetrained: string;
  };
  explainability: FeatureImportance[];
}

export enum UserRole {
  FARMER = 'FARMER',
  EXPERT = 'EXPERT',
  ADMIN = 'ADMIN'
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export type SoilType = 'Black' | 'Sandy' | 'Loamy' | 'Red';

export interface User {
  userId: string;
  name: string;
  phone: string;
  language: 'en' | 'hi' | 'mr';
  role: UserRole;
  location: {
    village: string;
    ward: string;
    latitude?: number;
    longitude?: number;
  };
  farmDetails: {
    crops: string[];
    size: number;
    irrigation: 'drip' | 'sprinkler' | 'flood';
    soilType: SoilType;
  };
  preferences: {
    notifications: boolean;
    notificationChannels: {
      push: boolean;
      sms: boolean;
      voice: boolean;
    };
    alertThresholds: {
      critical: boolean;
      warning: boolean;
      advisory: boolean;
    };
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    categorySettings: {
      weather: boolean;
      market: boolean;
      community: boolean;
      advisory: boolean;
    };
    units: 'metric' | 'imperial';
  };
  createdAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  modalPrice: number;
  sma7?: number;
  sma30?: number;
  sma90?: number;
  isAnomaly?: boolean;
}

export interface YoYPricePoint {
  month: string;
  currentYear: number;
  previousYear: number;
  avg3Year: number;
}

export interface MarketArbitrage {
  mandiName: string;
  price: number;
  distanceKm: number;
  netPrice: number;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  grade: 'A' | 'B' | 'C';
  arrivalQuantity: number;
  unit: string;
  date: string;
  source: 'Agmarknet' | 'eNAM' | 'User';
}

export interface AuctionFeed {
  id: string;
  lotNumber: string;
  commodity: string;
  currentBid: number;
  biddersCount: number;
  endTime: string;
  status: 'Live' | 'Closed';
}

export interface UserPriceReport {
  userId: string;
  mandiName: string;
  commodity: string;
  price: number;
  variety: string;
  timestamp: string;
}

export interface PersonalizedAdvisory {
  id: string;
  date: string;
  title: string;
  greeting: string;
  weatherSummary: string;
  todayTasks: string[];
  irrigationAdvice: string;
  pestWatch: string;
  marketOutlook: string;
  precautions: string[];
  safetyTip: string;
  audioData?: string;
  confidenceScore: number;
  language: 'en' | 'hi' | 'mr';
}

export type AlertSeverity = 'critical' | 'warning' | 'advisory';

export interface WeatherAlert {
  id: string;
  type: 'hail' | 'frost' | 'heatwave' | 'heavy_rain' | 'strong_wind' | 'favorable';
  severity: AlertSeverity;
  message: string;
  startTime: string;
  endTime: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'weather' | 'system' | 'market' | 'social';
  category?: NotificationCategory;
  severity: AlertSeverity;
  priority?: NotificationPriority;
  isRead: boolean;
  channel: 'push' | 'sms' | 'voice' | 'in-app';
  createdAt: string;
  deliveredAt?: string;
  openedAt?: string;
}

export interface SoilTestData {
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  organicMatter?: number;
  testDate?: string;
}

export interface CropMilestone {
  stage: string;
  expectedDate: string;
  completedDate?: string;
  status: 'pending' | 'active' | 'completed';
}

export interface IrrigationRecommendation {
  id: string;
  cropId: string;
  cropName: string;
  action: 'IRRIGATE' | 'SKIP' | 'DELAY';
  durationMinutes: number;
  scheduledTime: string;
  reason: string;
  moistureLevel: number;
  evapotranspiration: number;
  isApplied: boolean;
}

export interface WaterUsageRecord {
  id: string;
  date: string;
  amountLiters: number;
  cropId: string;
}

export interface WeatherImpactAssessment {
  cropId: string;
  cropName: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  potentialYieldLoss: number;
  vulnerabilities: {
    factor: string;
    description: string;
    impact: 'Low' | 'Medium' | 'High';
  }[];
  protectiveMeasures: string[];
  recoverySteps: string[];
}

export interface DamageReport {
  id: string;
  cropId: string;
  incidentDate: string;
  weatherType: string;
  estimatedLoss: number;
  notes: string;
  status: 'Pending' | 'Verified' | 'Insured';
}

export interface HourlyForecast {
  time: string;
  temp: number;
  rainfall: number;
  humidity: number;
  condition: string;
}

export interface RainfallPrediction {
  timestamp: string;
  predictedRainfall: number;
  baselineRainfall: number;
  probability: number;
  confidenceInterval: [number, number];
}

export interface PredictionOutcome {
  timeframe: '24h' | '48h' | '7d';
  predictions: RainfallPrediction[];
  evaluation: {
    modelId: string;
    version: string;
    rmse: number;
    mae: number;
    accuracyScore: number;
    lastRetrained: string;
  };
  explanation: string;
}

export interface WeatherData {
  locationId: string;
  locationName: string;
  timestamp: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  alerts: WeatherAlert[];
  hourlyForecast: HourlyForecast[];
  forecast7Day: {
    date: string;
    temp: number;
    condition: string;
  }[];
}

export interface AIWeatherAdvisory {
  summary: string;
  recommendations: string[];
  confidenceScore: number;
}

export interface HistoricalYearData {
  year: number;
  avgTemp: number;
  totalRainfall: number;
  extremeEvents: number;
  monthlyRainfall: number[];
}

export interface ClimateAnalysis {
  yearlyTrends: HistoricalYearData[];
  indicators: {
    tempShift: number;
    rainfallChange: number;
    anomalyCount: number;
    forecastedRisk: 'low' | 'moderate' | 'high';
  };
}

export interface MarketPrice {
  marketId: string;
  cropType: string;
  price: number;
  date: string;
  mandiName: string;
  location: string;
  change: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Advisory {
  advisoryId: string;
  userId: string;
  cropId?: string;
  type: 'irrigation' | 'market' | 'weather' | 'pest';
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt: string;
}

export interface PestDetection {
  id: string;
  cropType: string;
  location: string;
  timestamp: string;
  imageUrl: string;
  isVerified: boolean;
  diagnosis_en: string;
  diagnosis_mr: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  symptoms: string[];
  organic_treatment: string;
  chemical_treatment: string;
  prevention: string;
}

export interface OutbreakZone {
  village: string;
  disease: string;
  count: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface GrapeAdvisory {
  currentStage: string;
  weeklyTasks: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
    category: string;
  }[];
  risks: {
    name: string;
    riskLevel: 'Low' | 'High';
    score: number;
    symptoms: string[];
    organicTreatment: string;
    chemicalTreatment: string;
  }[];
  marketRecommendation: string;
  nextSprayingWindow: string;
}

export interface OnionAdvisory {
  currentStage: string;
  weeklyTasks: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
    category: string;
  }[];
  risks: {
    name: string;
    riskLevel: 'High' | 'Moderate' | 'Low';
    score: number;
    symptoms: string[];
    organicTreatment: string;
    chemicalTreatment: string;
  }[];
  marketRecommendation: string;
  harvestWindow: string;
  curingTips: string[];
}

export interface TomatoAdvisory {
  currentStage: string;
  weeklyTasks: {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
    category: string;
  }[];
  risks: {
    name: string;
    riskLevel: 'High' | 'Moderate' | 'Low';
    score: number;
    symptoms: string[];
    organicTreatment: string;
    chemicalTreatment: string;
  }[];
  marketRecommendation: string;
  harvestStages: { stage: string; color: string; purpose: string }[];
  stakingAdvice: string;
}

export interface NutrientAdvisory {
  cropId: string;
  cropName: string;
  soilPh: number;
  nutrientNeeds: {
    nutrient: string;
    label: string;
    requirementKgPerAcre: number;
    currentLevel: number;
    deficiency: 'Severe' | 'Marginal' | 'None';
  }[];
  schedule: {
    id: string;
    dap: number;
    date: string;
    productName: string;
    dosage: number;
    unit: string;
    method: string;
    status: 'pending' | 'completed';
  }[];
  organicAlternatives: string[];
  costAnalysis: {
    estimatedTotalCost: number;
    expectedRoi: number;
  };
}

export type IPMCategory = 'Biological' | 'Cultural' | 'Mechanical' | 'Chemical';

export interface IPMTask {
  id: string;
  title: string;
  category: IPMCategory;
  description: string;
  recommendedDate: string;
  status: 'pending' | 'completed';
  pestTarget: string;
}

export interface SprayLogEntry {
  id: string;
  date: string;
  productName: string;
  activeIngredient: string;
  dosage: string;
  targetPest: string;
  weatherAtTime: string;
  phiDays: number;
  reiHours: number;
  operatorName: string;
  effectiveness: string;
}

export interface IPMSummary {
  cropId: string;
  cropName: string;
  tasks: IPMTask[];
  logs: SprayLogEntry[];
  complianceScore: number;
  chemicalDependency: number;
}

export interface Transaction {
  date: string;
  time: string | null;
  transaction_type: string;
  party: string;
  description: string;
  amount: number;
  status: string;
  balance: number | null;
}

export interface CategoryMetric {
  category: string;
  amount: number;
  [key: string]: any;
}

export interface MonthlyPattern {
  month: string;
  amount: number;
  [key: string]: any;
}

export interface FinancialInsights {
  totalCredits: number;
  totalDebits: number;
  topSpendingCategories: CategoryMetric[];
  monthlyExpenditurePattern: MonthlyPattern[];
  predictedMonthlySavings: number;
  actionableSavingsSuggestions: string[];
}

export interface AnalysisResult {
  transactions: Transaction[];
  insights: FinancialInsights;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
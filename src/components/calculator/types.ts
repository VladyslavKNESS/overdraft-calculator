export interface CashFlowRow {
  day: string;
  date: string;
  paymentDaysUs: string;
  outgoing: number;
  paymentDaysThem: string;
  incoming: number;
  delta: number;
  dayInterest: number;
  dayOverdraftInterest: number;
  dayOvernightInterest: number;
  cumulativeDelta: number;
}

export interface FormData {
  firstPaymentUs: string;
  firstPaymentThem: string;
  weekendPayUs: boolean;
  weekendPayThem: boolean;
  priceType: string;
  planPrice: number | string;
  loadType: string;
  buyVolumeType: string;
  sellVolumeType: string;
  buyVolume: number | string;
  sellVolume: number | string;
  supplyStart: string;
  supplyEnd: string;
  buyDiscountUnit: string;
  buyDiscount: number | string;
  sellDiscountUnit: string;
  sellDiscount: number | string;
  // Роздільні ставки
  overdraftAnnualRate: number | string;
  overnightAnnualRate: number | string;
  paymentTerms: number | string;
  sellTerms: number | string;
  // Поля для післяплати
  buyPaymentMode: string;
  sellPaymentMode: string;
  buyPostpayType: string; // 'days' або 'decade'
  sellPostpayType: string; // 'days' або 'decade'
  postpayDaysBuy: number | string; // кількість днів для денної післяплати
  postpayDaysSell: number | string;
  postpayOffsetDaysBuy: number | string; // зсув після періоду
  postpayOffsetDaysSell: number | string;
  weekendPostpayUs: boolean;
  weekendPostpayThem: boolean;
  // Дисконти для подекадної оплати
  buyDiscount1Unit: string;
  buyDiscount1: number | string;
  buyDiscount2Unit: string;
  buyDiscount2: number | string;
  buyDiscount3Unit: string;
  buyDiscount3: number | string;
  sellDiscount1Unit: string;
  sellDiscount1: number | string;
  sellDiscount2Unit: string;
  sellDiscount2: number | string;
  sellDiscount3Unit: string;
  sellDiscount3: number | string;
}

export interface Results {
  totalBuyVolume: number;
  totalSellVolume: number;
  totalVolume: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyRate: number;
  dailyRate: number;
  totalInterest: number;
  // Роздільні відсотки
  totalOverdraftInterestExpenses: number;
  totalOvernightInterestIncome: number;
  overdraftDailyRate: number;
  overnightDailyRate: number;
  overdraftMonthlyRate: number;
  overnightMonthlyRate: number;
  netIncome: number;
  difference: number;
  cashFlows: CashFlowRow[];
}

export interface PostpayPeriod {
  start: Date;
  end: Date;
  payDate: Date;
  amount: number;
  description: string;
  decade?: number;
}

export interface HourlyData {
  [key: string]: (number | string)[];
}

export interface TableState {
  isPriceTableCollapsed: boolean;
  isBuyVolumeTableCollapsed: boolean;
  isSellVolumeTableCollapsed: boolean;
}

// УЕБ (Українська енергетична біржа) типи
export interface UEBStage {
  id: number;
  startDate: string;
  endDate: string;
  paymentDate: string;
  totalLots: number;
  hourStart: number;
  hourEnd: number;
  pricePerMWh: number;
  guaranteePercent: number;
}

export interface UEBResults {
  stages: UEBStageResult[];
  totalAdvancePayment: number;
  totalGuaranteeFee: number;
  totalOverdraftInterest: number;
  totalOvernightInterest: number;
}

export interface UEBStageResult {
  id: number;
  periodDays: number;
  totalHours: number;
  totalVolumeAuction: number;
  advancePayment: number;
  guaranteeFee: number;
  overdraftInterest: number;
  overnightInterest: number;
  description: string;
}
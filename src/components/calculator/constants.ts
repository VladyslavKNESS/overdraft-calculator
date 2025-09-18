import { FormData } from './types';

export const DEFAULT_FORM_DATA: FormData = {
  firstPaymentUs: '2025-09-19',
  firstPaymentThem: '2025-09-19',
  weekendPayUs: false,
  weekendPayThem: false,
  priceType: 'single',
  planPrice: '4800',
  loadType: 'блок 1 - 24',
  buyVolumeType: 'single',
  sellVolumeType: 'single',
  buyVolume: "",
  sellVolume: "",
  supplyStart: '2025-10-01',
  supplyEnd: '2025-10-31',
  buyDiscountUnit: '%',
  buyDiscount: "",
  sellDiscountUnit: '%',
  sellDiscount: "",
  // Роздільні ставки
  overdraftAnnualRate: 19,
  overnightAnnualRate: 10,
  paymentTerms: 10,
  sellTerms: 3,
  // Післяплата
  buyPaymentMode: 'prepay',
  sellPaymentMode: 'prepay',
  buyPostpayType: 'days',
  sellPostpayType: 'days',
  postpayDaysBuy: 1, // змінено для демонстрації Д+1
  postpayDaysSell: 2, // змінено для демонстрації Д+2
  postpayOffsetDaysBuy: 0, // зменшено для простіших прикладів
  postpayOffsetDaysSell: 0, // зменшено для простіших прикладів
  weekendPostpayUs: false,
  weekendPostpayThem: false,
  // Дисконти для подекадної оплати
  buyDiscount1Unit: '%',
  buyDiscount1: "",
  buyDiscount2Unit: '%',
  buyDiscount2: "",
  buyDiscount3Unit: '%',
  buyDiscount3: "",
  sellDiscount1Unit: '%',
  sellDiscount1: "",
  sellDiscount2Unit: '%',
  sellDiscount2: "",
  sellDiscount3Unit: '%',
  sellDiscount3: "",
};

export const DAYS_OF_WEEK = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
export const DAYS_OF_WEEK_SHORT = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export const BASE_DAYS = 365;
export const HOURS_PER_DAY = 24;

export const DISCOUNT_UNITS = ['%', 'UAH', 'fix'] as const;
export const VOLUME_TYPES = ['single', 'hourly'] as const;
export const PAYMENT_MODES = ['prepay', 'postpay'] as const;
export const POSTPAY_TYPES = ['days', 'decade'] as const;
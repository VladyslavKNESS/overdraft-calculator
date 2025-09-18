import { FormData, HourlyData } from './types';

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseLoadType = (loadType: string): number => {
  if (loadType.toLowerCase().includes('базове')) {
    return 24;
  }
  
  const match = loadType.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    let hours = end - start + 1;
    
    if (hours > 24) hours = 24;
    if (hours < 1) hours = 24;
    
    return hours;
  }
  
  return 24;
};

export const generateDatesForPeriod = (startDate: Date, endDate: Date): string[] => {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const hasDataInTable = (tableData: HourlyData): boolean => {
  return Object.values(tableData).some(dayArray => 
    dayArray.some(value => value !== 0)
  );
};

export const adjustToBusinessDay = (date: Date, allowWeekends: boolean): Date => {
  if (allowWeekends) return new Date(date);
  
  const adjustedDate = new Date(date);
  while (adjustedDate.getDay() === 0 || adjustedDate.getDay() === 6) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  }
  return adjustedDate;
};

export const getDecadePeriods = (year: number, month: number) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const periods = [];
  
  if (daysInMonth === 28) {
    // Лютий, звичайний рік: 1-9, 10-18, 19-28
    periods.push({ start: 1, end: 9, decade: 1, payDay: 9 });
    periods.push({ start: 10, end: 18, decade: 2, payDay: 18 });
    periods.push({ start: 19, end: 28, decade: 3, payDay: 28 });
  } else if (daysInMonth === 29) {
    // Лютий, високосний рік: 1-10, 11-20, 21-29
    periods.push({ start: 1, end: 10, decade: 1, payDay: 10 });
    periods.push({ start: 11, end: 20, decade: 2, payDay: 20 });
    periods.push({ start: 21, end: 29, decade: 3, payDay: 29 });
  } else if (daysInMonth === 30) {
    // 30 днів: 1-10, 11-20, 21-30
    periods.push({ start: 1, end: 10, decade: 1, payDay: 10 });
    periods.push({ start: 11, end: 20, decade: 2, payDay: 20 });
    periods.push({ start: 21, end: 30, decade: 3, payDay: 30 });
  } else {
    // 31 день: 1-10, 11-20, 21-31
    periods.push({ start: 1, end: 10, decade: 1, payDay: 10 });
    periods.push({ start: 11, end: 20, decade: 2, payDay: 20 });
    periods.push({ start: 21, end: 31, decade: 3, payDay: 31 });
  }
  
  return periods;
};

export const getDiscountForDecade = (decade: number, isBuy: boolean, formData: FormData) => {
  if (isBuy) {
    switch (decade) {
      case 1:
        return { unit: formData.buyDiscount1Unit, discount: formData.buyDiscount1 };
      case 2:
        return { unit: formData.buyDiscount2Unit, discount: formData.buyDiscount2 };
      case 3:
        return { unit: formData.buyDiscount3Unit, discount: formData.buyDiscount3 };
      default:
        return { unit: formData.buyDiscountUnit, discount: formData.buyDiscount };
    }
  } else {
    switch (decade) {
      case 1:
        return { unit: formData.sellDiscount1Unit, discount: formData.sellDiscount1 };
      case 2:
        return { unit: formData.sellDiscount2Unit, discount: formData.sellDiscount2 };
      case 3:
        return { unit: formData.sellDiscount3Unit, discount: formData.sellDiscount3 };
      default:
        return { unit: formData.sellDiscountUnit, discount: formData.sellDiscount };
    }
  }
};
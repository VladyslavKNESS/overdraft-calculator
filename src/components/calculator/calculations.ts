import { FormData, PostpayPeriod, HourlyData, CashFlowRow, Results } from './types';
import { formatDate, parseLoadType, adjustToBusinessDay, getDecadePeriods, getDiscountForDecade } from './utils';
import { BASE_DAYS, DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT } from './constants';

// НОВА ЛОГІКА АВАНСОВИХ ПЛАТЕЖІВ:
// Кількість днів за які платиться в день першого авансового платежу рахується так:
// 1. Від дати першого авансового платежу додаємо умови (Д-Х)
// 2. Це дає нам кінцеву дату покриття
// 3. Платимо тільки за дні що входять в період постачання
// 4. ДОДАТКОВА ЛОГІКА П'ЯТНИЦІ ТА ВИХІДНИХ:
//    - Якщо перший авансовий припадає на п'ятницю: застосовується логіка п'ятниці (3 дні)
//    - Якщо початок постачання на суботу: +1 день до покриття
//    - Якщо початок постачання на неділю: +2 дні до покриття
// 
// Приклад 1:
// Дата першого авансового платежу: 27.05.2025 (понеділок)
// Умови купівлі: Д-10
// Початок постачання: 01.06.2025 (неділя)
// Базове покриття: 27.05.2025 + 10 = 06.06.2025
// Корекція для неділі: +0 (для понеділка корекції неділі немає)
// Фінальне покриття: 01.06.2025 по 06.06.2025 = 6 днів ✓
//
// Приклад 2:
// Дата першого авансового платежу: 30.05.2025 (п'ятниця)
// Умови продажу: Д-3
// Початок постачання: 01.06.2025 (неділя)
// Базове покриття: 30.05.2025 + 3 = 02.06.2025
// Логіка п'ятниці: +2 дні (п'ятниця покриває вихідні)
// Фінальне покриття: 01.06.2025 по 04.06.2025 = 4 дні ✓

// Функція для розрахунку додаткових днів покриття з урахуванням логіки п'ятниці та вихідних
const calculateWeekendAdjustment = (
  firstPaymentDate: Date,
  supplyStartDate: Date,
  allowWeekends: boolean
): number => {
  // Якщо дозволені вихідні платежі, корекції не потрібні
  if (allowWeekends) return 0;
  
  let adjustment = 0;
  const paymentDayOfWeek = firstPaymentDate.getDay(); // 0=неділя, 5=п'ятниця, 6=субота
  const supplyStartDayOfWeek = supplyStartDate.getDay();
  
  // ДІАГНОСТИКА
  const paymentDayName = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота'][paymentDayOfWeek];
  const supplyDayName = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота'][supplyStartDayOfWeek];
  
  // ЛОГІКА П'ЯТНИЦІ: якщо платіж у п'ятницю, застосовується логіка що п'ятниця покриває 3 дні
  if (paymentDayOfWeek === 5) { // п'ятниця
    adjustment += 2; // п'ятниця покриває суботу та неділю (+2 дні до базових умов)
    console.log(`П'ятниця логіка: платіж=${paymentDayName}, початок=${supplyDayName}, корекція=+2`);
  } else {
    // ДЛЯ ІНШИХ ДНІВ ТИЖНЯ: корекція тільки якщо початок постачання у вихідні
    if (supplyStartDayOfWeek === 6) { // субота
      adjustment += 1; // +1 день за суботу
      console.log(`Субота корекція: +1`);
    } else if (supplyStartDayOfWeek === 0) { // неділя
      // Для не-п'ятниці корекція неділі не застосовується (як для понеділка)
      adjustment += 0;
      console.log(`Неділя: корекція=0 для ${paymentDayName}`);
    }
  }
  
  console.log(`Загальна корекція: ${adjustment} днів`);
  return adjustment;
};

export const calculateDailyCost = (
  dateStr: string, 
  isBuy: boolean, 
  formData: FormData, 
  hourlyPrices: HourlyData, 
  hourlyBuyVolumes: HourlyData, 
  hourlySellVolumes: HourlyData, 
  overrideDiscount?: { unit: string, discount: number }
): number => {
  let dailyCost = 0;
  const hoursPerDay = parseLoadType(formData.loadType);
  
  if (formData.priceType === 'hourly' && 
      ((isBuy && formData.buyVolumeType === 'hourly') || (!isBuy && formData.sellVolumeType === 'hourly')) &&
      hourlyPrices[dateStr]) {
    
    const volumeData = isBuy ? hourlyBuyVolumes[dateStr] : hourlySellVolumes[dateStr];
    
    if (volumeData) {
      // Погодинний розрахунок
      for (let hour = 0; hour < 24; hour++) {
        const rawPrice = hourlyPrices[dateStr][hour];
        const rawVolume = volumeData[hour];
        
        // Перетворюємо пусті рядки на 0 для розрахунків
        const hourPrice = (typeof rawPrice === 'string' && rawPrice === '') ? 0 : (rawPrice || 0);
        const hourVolume = (typeof rawVolume === 'string' && rawVolume === '') ? 0 : (rawVolume || 0);
        
        let finalPrice = hourPrice;
        
        // Застосування дисконту (використовуємо переданий дисконт або стандартний)
        const discountData = overrideDiscount || (isBuy ? 
          { unit: formData.buyDiscountUnit, discount: formData.buyDiscount } : 
          { unit: formData.sellDiscountUnit, discount: formData.sellDiscount });
        
        if (discountData.unit === '%') {
          finalPrice = hourPrice * (1 + discountData.discount / 100);
        } else if (discountData.unit === 'UAH') {
          finalPrice = hourPrice + discountData.discount;
        } else if (discountData.unit === 'fix') {
          finalPrice = discountData.discount;
        }
        
        dailyCost += finalPrice * hourVolume;
      }
    }
  } else {
    // Звичайний розрахунок
    // Перетворюємо пусті рядки на числа для розрахунків
    let price = typeof formData.planPrice === 'string' && formData.planPrice === '' ? 0 : Number(formData.planPrice) || 0;
    let volume = isBuy ? 
      (typeof formData.buyVolume === 'string' && formData.buyVolume === '' ? 0 : Number(formData.buyVolume) || 0) :
      (typeof formData.sellVolume === 'string' && formData.sellVolume === '' ? 0 : Number(formData.sellVolume) || 0);
    
    const discountData = overrideDiscount || (isBuy ? 
      { unit: formData.buyDiscountUnit, discount: typeof formData.buyDiscount === 'string' && formData.buyDiscount === '' ? 0 : Number(formData.buyDiscount) || 0 } : 
      { unit: formData.sellDiscountUnit, discount: typeof formData.sellDiscount === 'string' && formData.sellDiscount === '' ? 0 : Number(formData.sellDiscount) || 0 });
    
    if (discountData.unit === '%') {
      price = formData.planPrice * (1 + discountData.discount / 100);
    } else if (discountData.unit === 'UAH') {
      price = formData.planPrice + discountData.discount;
    } else if (discountData.unit === 'fix') {
      price = discountData.discount;
    }
    
    dailyCost = price * volume * hoursPerDay;
  }
  
  return dailyCost;
};

export const calculatePostpayPeriods = (
  isBuy: boolean, 
  formData: FormData, 
  hourlyPrices: HourlyData, 
  hourlyBuyVolumes: HourlyData, 
  hourlySellVolumes: HourlyData
): PostpayPeriod[] => {
  const supplyStart = new Date(formData.supplyStart);
  const supplyEnd = new Date(formData.supplyEnd);
  const postpayPeriods: PostpayPeriod[] = [];
  
  const postpayType = isBuy ? formData.buyPostpayType : formData.sellPostpayType;
  const offsetDays = isBuy ? formData.postpayOffsetDaysBuy : formData.postpayOffsetDaysSell;
  const allowWeekends = isBuy ? formData.weekendPostpayUs : formData.weekendPostpayThem;
  
  if (postpayType === 'decade') {
    // Подекадна логіка (залишається без змін)
    let currentDate = new Date(supplyStart);
    while (currentDate <= supplyEnd) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const monthEnd = new Date(year, month + 1, 0);
      const actualMonthEnd = monthEnd > supplyEnd ? supplyEnd : monthEnd;
      
      const decadePeriods = getDecadePeriods(year, month);
      
      decadePeriods.forEach(period => {
        const periodStart = new Date(year, month, period.start);
        const periodEnd = new Date(year, month, period.end);
        
        // Перевіряємо чи перетинається декада з періодом постачання
        if (periodEnd >= supplyStart && periodStart <= supplyEnd) {
          const actualStart = periodStart < supplyStart ? supplyStart : periodStart;
          const actualEnd = periodEnd > supplyEnd ? supplyEnd : periodEnd;
          
          let amount = 0;
          let currentDay = new Date(actualStart);
          
          // Отримуємо дисконт для поточної декади
          const discountData = getDiscountForDecade(period.decade, isBuy, formData);
          
          // Обчислити загальну суму за декаду
          while (currentDay <= actualEnd) {
            const dateStr = formatDate(currentDay);
            amount += calculateDailyCost(dateStr, isBuy, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes, discountData);
            // ФІКС: безпечне додавання дня для уникнення пропускання дат
            currentDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
          }
          
          if (amount > 0) {
            // Дата платежу - останній день декади (без перенесення на робочі дні)
            const payDate = new Date(year, month, period.payDay);
            
            postpayPeriods.push({
              start: actualStart,
              end: actualEnd,
              payDate,
              amount,
              description: `За ${period.decade} декаду ${actualStart.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}`,
              decade: period.decade
            });
          }
        }
      });
      
      // Переходимо до наступного місяця
      currentDate = new Date(year, month + 1, 1);
    }
  } else {
    // UNIVERSAL DAILY LOGIC: кожен день окремий платіж для будь-якої кількості днів
    const daysPeriod = isBuy ? formData.postpayDaysBuy : formData.postpayDaysSell;
    
    // Для всіх випадків (Д+1, Д+2, Д+15, Д+40 і т.д.) - кожен день окремо
    let currentSupplyDay = new Date(supplyStart);
    
    while (currentSupplyDay <= supplyEnd) {
      // Дата платежу = день постачання + кількість днів + зсув
      const payDate = new Date(currentSupplyDay.getTime() + (daysPeriod + offsetDays) * 24 * 60 * 60 * 1000);
      
      // Корекція дати платежу на робочий день
      const finalPayDate = adjustToBusinessDay(payDate, allowWeekends);
      
      // Рахуємо суму за цей конкретний день
      const dateStr = formatDate(currentSupplyDay);
      const amount = calculateDailyCost(dateStr, isBuy, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
      
      if (amount > 0) {
        postpayPeriods.push({
          start: new Date(currentSupplyDay),
          end: new Date(currentSupplyDay),
          payDate: finalPayDate,
          amount,
          description: `За ${formatDate(currentSupplyDay)} (Д+${daysPeriod}${offsetDays > 0 ? `+${offsetDays}` : ''})`
        });
      }
      
      // ФІКС: безпечне додавання дня для уникнення пропускання дат
      currentSupplyDay = new Date(currentSupplyDay.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  
  return postpayPeriods;
};

export const performMainCalculation = (
  formData: FormData,
  hourlyPrices: HourlyData,
  hourlyBuyVolumes: HourlyData,
  hourlySellVolumes: HourlyData
): Results => {
  console.log('Початок performMainCalculation');
  
  const firstPaymentUs = new Date(formData.firstPaymentUs);
  const firstPaymentThem = new Date(formData.firstPaymentThem);
  const supplyStart = new Date(formData.supplyStart);
  const supplyEnd = new Date(formData.supplyEnd);

  const hoursPerDay = parseLoadType(formData.loadType);
  const days = Math.floor((supplyEnd.getTime() - supplyStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  console.log('Основні параметри:', { hoursPerDay, days });
  
  // Розрахунок загальних обсягів для всього періоду постачання
  let totalBuyVolume = 0;
  let totalSellVolume = 0;
  
  if (formData.buyVolumeType === 'hourly' && hourlyBuyVolumes) {
    // Рахуємо тільки для днів у межах періоду постачання
    let currentDate = new Date(supplyStart);
    while (currentDate <= supplyEnd) {
      const dateStr = formatDate(currentDate);
      if (hourlyBuyVolumes[dateStr]) {
        hourlyBuyVolumes[dateStr].forEach(hourVolume => {
          // Перетворюємо пусті рядки на 0 для розрахунків
          const volume = (typeof hourVolume === 'string' && hourVolume === '') ? 0 : (hourVolume || 0);
          totalBuyVolume += volume;
        });
      }
      // ФІКС: безпечне додавання дня для уникнення пропускання дат
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    totalBuyVolume = (Number(formData.buyVolume) || 0) * hoursPerDay * days;
  }
  
  if (formData.sellVolumeType === 'hourly' && hourlySellVolumes) {
    // Рахуємо тільки для днів у межах періоду постачання
    let currentDate = new Date(supplyStart);
    while (currentDate <= supplyEnd) {
      const dateStr = formatDate(currentDate);
      if (hourlySellVolumes[dateStr]) {
        hourlySellVolumes[dateStr].forEach(hourVolume => {
          // Перетворюємо пусті рядки на 0 для розрахунків
          const volume = (typeof hourVolume === 'string' && hourVolume === '') ? 0 : (hourVolume || 0);
          totalSellVolume += volume;
        });
      }
      // ФІКС: безпечне додавання дня для уникнення пропускання дат
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    totalSellVolume = (Number(formData.sellVolume) || 0) * hoursPerDay * days;
  }

  const totalVolume = Math.max(totalBuyVolume, totalSellVolume);

  console.log('Обсяги:', { totalBuyVolume, totalSellVolume, totalVolume });

  // Розрахунок відсотків - тільки роздільні ставки
  const monthlyRate = 0; // Не використовуємо застарілий annualRate
  const dailyRate = 0; // Не використовуємо застарілий annualRate

  // Конвертація річних ставок у денні - винесено поза цикл!
  const overdraftAnnualRate = Number(formData.overdraftAnnualRate) || 0;
  const overnightAnnualRate = Number(formData.overnightAnnualRate) || 0;
  const overdraftDailyRate = (overdraftAnnualRate / 100) / BASE_DAYS;
  const overnightDailyRate = (overnightAnnualRate / 100) / BASE_DAYS;

  console.log('Ставки:', { overdraftDailyRate, overnightDailyRate });

  // Розрахунок післяплати
  const buyPostpayPeriods = formData.buyPaymentMode === 'postpay' ? calculatePostpayPeriods(true, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes) : [];
  const sellPostpayPeriods = formData.sellPaymentMode === 'postpay' ? calculatePostpayPeriods(false, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes) : [];

  console.log('Періоди післяплати:', { buyPostpayPeriods: buyPostpayPeriods.length, sellPostpayPeriods: sellPostpayPeriods.length });

  // Створення карти платежів для післяплати
  const postpayPayments = new Map<string, { outgoing: number; incoming: number; description: string }>();
  
  buyPostpayPeriods.forEach(period => {
    const dateKey = formatDate(period.payDate);
    if (!postpayPayments.has(dateKey)) {
      postpayPayments.set(dateKey, { outgoing: 0, incoming: 0, description: '' });
    }
    const payment = postpayPayments.get(dateKey)!;
    payment.outgoing += period.amount;
    payment.description += (payment.description ? ', ' : '') + period.description;
  });
  
  sellPostpayPeriods.forEach(period => {
    const dateKey = formatDate(period.payDate);
    if (!postpayPayments.has(dateKey)) {
      postpayPayments.set(dateKey, { outgoing: 0, incoming: 0, description: '' });
    }
    const payment = postpayPayments.get(dateKey)!;
    payment.incoming += period.amount;
    payment.description += (payment.description ? ', ' : '') + period.description;
  });

  // Генерація таблиці грошових потоків
  const cashFlows: CashFlowRow[] = [];
  
  // Знаходимо найранішу та найпізнішу дати для оптимізації таблиці
  const earliestPaymentDate = new Date(Math.min(
    formData.buyPaymentMode === 'prepay' ? firstPaymentUs.getTime() : supplyStart.getTime(),
    formData.sellPaymentMode === 'prepay' ? firstPaymentThem.getTime() : supplyStart.getTime()
  ));
  
  // Знаходимо найпізнішу дату з усіх можливих платежів
  let latestPaymentDate = new Date(supplyEnd);
  
  // Перевіряємо дати післяплат
  if (buyPostpayPeriods.length > 0) {
    const latestBuyPostpay = Math.max(...buyPostpayPeriods.map(p => p.payDate.getTime()));
    if (latestBuyPostpay > latestPaymentDate.getTime()) {
      latestPaymentDate = new Date(latestBuyPostpay);
    }
  }
  
  if (sellPostpayPeriods.length > 0) {
    const latestSellPostpay = Math.max(...sellPostpayPeriods.map(p => p.payDate.getTime()));
    if (latestSellPostpay > latestPaymentDate.getTime()) {
      latestPaymentDate = new Date(latestSellPostpay);
    }
  }
  
  // Для авансових платежів знаходимо останню дату платежу
  if (formData.buyPaymentMode === 'prepay' || formData.sellPaymentMode === 'prepay') {
    // Для авансових платежів останній платіж може бути після кінця постачання
    const safeLastSupplyDate = new Date(supplyEnd.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (safeLastSupplyDate.getTime() > latestPaymentDate.getTime()) {
      latestPaymentDate = safeLastSupplyDate;
    }
  }
  
  // ПОКРАЩЕНА ЛОГІКА ДІАПАЗОНУ ДАТ: збільшений діапазон для показу всіх важливих дат
  let currentDate = new Date(earliestPaymentDate.getTime() - 10 * 24 * 60 * 60 * 1000);
  
  // Кінцева дата - найпізніша дата платежу + 5 днів для контексту (збільшено для показу всіх дат)
  const finalEndDate = new Date(latestPaymentDate.getTime() + 5 * 24 * 60 * 60 * 1000);

  // Ініціалізація агрегатів для роздільних відсотків
  let totalInterest = 0;
  let totalOverdraftInterestExpenses = 0;
  let totalOvernightInterestIncome = 0;
  let totalExpenses = 0;
  let totalIncome = 0;
  let cumulativeDelta = 0;
  let currentSupplyDateUs = new Date(supplyStart);
  let currentSupplyDateThem = new Date(supplyStart);

  console.log('Початок циклу грошових потоків');

  while (currentDate <= finalEndDate) {
    const dayOfWeek = DAYS_OF_WEEK[currentDate.getDay()];
    const dayOfWeekShort = DAYS_OF_WEEK_SHORT[currentDate.getDay()];
    const dateStr = formatDate(currentDate);
    let outgoing = 0;
    let incoming = 0;
    let paymentDaysRangeUs = '';
    let paymentDaysRangeThem = '';

    // Перевірка післяплати
    if (postpayPayments.has(dateStr)) {
      const payment = postpayPayments.get(dateStr)!;
      outgoing += payment.outgoing;
      incoming += payment.incoming;
      if (payment.outgoing > 0) {
        paymentDaysRangeUs = payment.description;
      }
      if (payment.incoming > 0) {
        paymentDaysRangeThem = payment.description;
      }
    }

    // Розрахунок витрат (авансовий режим)
    if (formData.buyPaymentMode === 'prepay') {
      if (currentDate.getTime() === firstPaymentUs.getTime()) {
        // НОВА ЛОГІКА: розраховуємо кінцеву дату покриття згідно з умовами Д-Х + корекції
        const paymentTerms = Number(formData.paymentTerms) || 0;
        
        // Розраховуємо базову дату кінця покриття
        const baseCoverageEndDate = new Date(firstPaymentUs.getTime() + paymentTerms * 24 * 60 * 60 * 1000);
        
        // НОВА ЛОГІКА: додаємо корекції для п'ятниці та вихідних
        const weekendAdjustment = calculateWeekendAdjustment(firstPaymentUs, supplyStart, formData.weekendPayUs);
        
        // Застосовуємо корекцію до дати покриття
        const adjustedCoverageEndDate = new Date(baseCoverageEndDate.getTime() + weekendAdjustment * 24 * 60 * 60 * 1000);
        
        // Обмежуємо покриття періодом постачання
        const actualCoverageEnd = adjustedCoverageEndDate > supplyEnd ? supplyEnd : adjustedCoverageEndDate;
        const actualCoverageStart = supplyStart;
        
        // Рахуємо кількість днів тільки в межах періоду постачання
        let daysToPayFor = 0;
        if (actualCoverageEnd >= actualCoverageStart) {
          daysToPayFor = Math.floor((actualCoverageEnd.getTime() - actualCoverageStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        if (daysToPayFor > 0) {
          let prepayAmount = 0;
          let tempDate = new Date(actualCoverageStart);
          
          for (let i = 0; i < daysToPayFor; i++) {
            const tempDateStr = formatDate(tempDate);
            prepayAmount += calculateDailyCost(tempDateStr, true, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
            tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
          }
          
          outgoing += prepayAmount;
          
          if (daysToPayFor === 1) {
            paymentDaysRangeUs = formatDate(actualCoverageStart);
          } else {
            paymentDaysRangeUs = `${formatDate(actualCoverageStart)} - ${formatDate(actualCoverageEnd)}`;
          }
          
          // Оновлюємо поточну дату постачання для наступних платежів
          currentSupplyDateUs = new Date(actualCoverageEnd.getTime() + 24 * 60 * 60 * 1000);
        }
      } else if (currentDate > firstPaymentUs && currentSupplyDateUs <= supplyEnd) {
        // Наступні платежі - залежить від налаштувань вихідних
        if (formData.weekendPayUs) {
          // Якщо дозволені вихідні - платимо щодня
          const dateStrUs = formatDate(currentSupplyDateUs);
          const prepayAmount = calculateDailyCost(dateStrUs, true, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
          outgoing += prepayAmount;
          paymentDaysRangeUs = formatDate(currentSupplyDateUs);
          currentSupplyDateUs = new Date(currentSupplyDateUs.getTime() + 24 * 60 * 60 * 1000);
        } else {
          // Якщо не дозволені вихідні - тільки у робочі дні з логікою п'ятниці
          if (dayOfWeekShort !== 'сб' && dayOfWeekShort !== 'нд') {
            let daysToPayFor = 1;
            if (dayOfWeekShort === 'пт') {
              daysToPayFor = 3; // п'ятниця покриває пт, сб, нд
            }
            
            const remainingDays = Math.floor((supplyEnd.getTime() - currentSupplyDateUs.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            daysToPayFor = Math.min(daysToPayFor, remainingDays);
            
            if (daysToPayFor > 0) {
              let prepayAmount = 0;
              let tempDate = new Date(currentSupplyDateUs);
              for (let i = 0; i < daysToPayFor; i++) {
                const tempDateStr = formatDate(tempDate);
                prepayAmount += calculateDailyCost(tempDateStr, true, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
                tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
              }
              
              outgoing += prepayAmount;
              
              const rangeStart = new Date(currentSupplyDateUs);
              const rangeEnd = new Date(currentSupplyDateUs.getTime() + (daysToPayFor - 1) * 24 * 60 * 60 * 1000);
              if (daysToPayFor === 1) {
                paymentDaysRangeUs = formatDate(rangeStart);
              } else {
                paymentDaysRangeUs = `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
              }
              currentSupplyDateUs = new Date(currentSupplyDateUs.getTime() + daysToPayFor * 24 * 60 * 60 * 1000);
            }
          }
        }
      }
    }

    // Розрахунок надходжень (авансовий режим)
    if (formData.sellPaymentMode === 'prepay') {
      if (currentDate.getTime() === firstPaymentThem.getTime()) {
        // НОВА ЛОГІКА: розраховуємо кінцеву дату покриття згідно з умовами Д-Х + корекції
        const sellTerms = Number(formData.sellTerms) || 0;
        
        // Розраховуємо базову дату кінця покриття
        const baseCoverageEndDate = new Date(firstPaymentThem.getTime() + sellTerms * 24 * 60 * 60 * 1000);
        
        // НОВА ЛОГІКА: додаємо корекції для п'ятниці та вихідних
        const weekendAdjustment = calculateWeekendAdjustment(firstPaymentThem, supplyStart, formData.weekendPayThem);
        
        // Застосовуємо корекцію до дати покриття
        const adjustedCoverageEndDate = new Date(baseCoverageEndDate.getTime() + weekendAdjustment * 24 * 60 * 60 * 1000);
        
        // Обмежуємо покриття períодом постачання
        const actualCoverageEnd = adjustedCoverageEndDate > supplyEnd ? supplyEnd : adjustedCoverageEndDate;
        const actualCoverageStart = supplyStart;
        
        // Рахуємо кількість днів тільки в межах періоду постачання
        let daysToReceiveFor = 0;
        if (actualCoverageEnd >= actualCoverageStart) {
          daysToReceiveFor = Math.floor((actualCoverageEnd.getTime() - actualCoverageStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }
        
        if (daysToReceiveFor > 0) {
          let prepayAmount = 0;
          let tempDate = new Date(actualCoverageStart);
          
          for (let i = 0; i < daysToReceiveFor; i++) {
            const tempDateStr = formatDate(tempDate);
            prepayAmount += calculateDailyCost(tempDateStr, false, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
            tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
          }
          
          incoming += prepayAmount;
          
          if (daysToReceiveFor === 1) {
            paymentDaysRangeThem = formatDate(actualCoverageStart);
          } else {
            paymentDaysRangeThem = `${formatDate(actualCoverageStart)} - ${formatDate(actualCoverageEnd)}`;
          }
          
          // Оновлюємо поточну дату постачання для наступних платежів
          currentSupplyDateThem = new Date(actualCoverageEnd.getTime() + 24 * 60 * 60 * 1000);
        }
      } else if (currentDate > firstPaymentThem && currentSupplyDateThem <= supplyEnd) {
        // Наступні платежі - залежить від налаштувань вихідних
        if (formData.weekendPayThem) {
          // Якщо дозволені вихідні - отримуємо щодня
          const dateStrThem = formatDate(currentSupplyDateThem);
          const prepayAmount = calculateDailyCost(dateStrThem, false, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
          incoming += prepayAmount;
          paymentDaysRangeThem = formatDate(currentSupplyDateThem);
          currentSupplyDateThem = new Date(currentSupplyDateThem.getTime() + 24 * 60 * 60 * 1000);
        } else {
          // Якщо не дозволені вихідні - тільки у робочі дні з логікою п'ятниці
          if (dayOfWeekShort !== 'сб' && dayOfWeekShort !== 'нд') {
            let daysToReceiveFor = 1;
            if (dayOfWeekShort === 'пт') {
              daysToReceiveFor = 3; // п'ятниця покриває пт, сб, нд
            }
            
            const remainingDays = Math.floor((supplyEnd.getTime() - currentSupplyDateThem.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            daysToReceiveFor = Math.min(daysToReceiveFor, remainingDays);
            
            if (daysToReceiveFor > 0) {
              let prepayAmount = 0;
              let tempDate = new Date(currentSupplyDateThem);
              for (let i = 0; i < daysToReceiveFor; i++) {
                const tempDateStr = formatDate(tempDate);
                prepayAmount += calculateDailyCost(tempDateStr, false, formData, hourlyPrices, hourlyBuyVolumes, hourlySellVolumes);
                tempDate = new Date(tempDate.getTime() + 24 * 60 * 60 * 1000);
              }
              
              incoming += prepayAmount;
              
              const rangeStart = new Date(currentSupplyDateThem);
              const rangeEnd = new Date(currentSupplyDateThem.getTime() + (daysToReceiveFor - 1) * 24 * 60 * 60 * 1000);
              if (daysToReceiveFor === 1) {
                paymentDaysRangeThem = formatDate(rangeStart);
              } else {
                paymentDaysRangeThem = `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
              }
              currentSupplyDateThem = new Date(currentSupplyDateThem.getTime() + daysToReceiveFor * 24 * 60 * 60 * 1000);
            }
          }
        }
      }
    }

    // Розрахунок дельти
    const delta = incoming - outgoing;
    cumulativeDelta += delta;

    // Розрахунок денних відсотків (роздільні ставки)
    let dayInterestExpense = 0;
    let dayInterestIncome = 0;
    
    if (cumulativeDelta < 0) {
      dayInterestExpense = Math.abs(cumulativeDelta) * overdraftDailyRate;
    } else if (cumulativeDelta > 0) {
      dayInterestIncome = cumulativeDelta * overnightDailyRate;
    }

    const dayInterest = dayInterestIncome - dayInterestExpense;
    totalInterest += dayInterest;
    totalOverdraftInterestExpenses += dayInterestExpense;
    totalOvernightInterestIncome += dayInterestIncome;

    // Додаємо до загальних сум
    totalExpenses += outgoing;
    totalIncome += incoming;

    // КЛЮЧОВЕ ВИПРАВЛЕННЯ: показуємо ВСІ дати включно з вихідними днями для контексту
    const isImportantDate =
  // Показуємо дати, починаючи з найранішої дати платежу
  currentDate >= earliestPaymentDate &&
  (outgoing > 0 ||
    incoming > 0 ||
    dayInterest !== 0 ||
    // Показуємо дати періоду постачання
    (currentDate >= supplyStart && currentDate <= supplyEnd) ||
    // Показуємо всі дати авансових платежів
    currentDate.getTime() === firstPaymentUs.getTime() ||
    currentDate.getTime() === firstPaymentThem.getTime() ||
    // Показуємо ключові дати для контексту (5 днів до/після важливих по  дій)
    Math.abs(currentDate.getTime() - firstPaymentUs.getTime()) <= 5 * 24 * 60 * 60 * 1000 ||
    Math.abs(currentDate.getTime() - firstPaymentThem.getTime()) <= 5 * 24 * 60 * 60 * 1000 ||
    Math.abs(currentDate.getTime() - supplyStart.getTime()) <= 5 * 24 * 60 * 60 * 1000);

    if (isImportantDate) {
      cashFlows.push({
        date: formatDate(currentDate),
        dayOfWeek,
        outgoing,
        incoming,
        delta,
        cumulativeDelta,
        dayInterestExpense,
        dayInterestIncome,
        dayInterest,
        paymentDaysRangeUs,
        paymentDaysRangeThem
      });
    }

    // ФІКС: безпечне додавання дня для уникнення пропускання дат
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  console.log('Кінець циклу грошових потоків');

  // Розрахунок додаткових метрик
  const netIncome = totalIncome + totalOvernightInterestIncome - totalOverdraftInterestExpenses - totalExpenses;
  const difference = totalIncome > 0 ? (1 - totalExpenses / (totalIncome - totalOverdraftInterestExpenses)) * 100 : 0;

  // Конвертація ставок назад у місячні для відображення
  const overdraftMonthlyRate = overdraftDailyRate * BASE_DAYS / 12;
  const overnightMonthlyRate = overnightDailyRate * BASE_DAYS / 12;

  // Повертаємо результати
  return {
    totalBuyVolume,
    totalSellVolume,
    totalVolume,
    totalExpenses,
    totalIncome,
    totalProfit: totalIncome - totalExpenses,
    totalInterest,
    totalOverdraftInterestExpenses,
    totalOvernightInterestIncome,
    netCashFlow: totalIncome - totalExpenses + totalInterest,
    cashFlows: cashFlows,
    summary: {
      averageDelta: cashFlows.length > 0 ? cumulativeDelta / cashFlows.length : 0,
      maxOverdraft: cashFlows.length > 0 ? Math.min(...cashFlows.map(cf => cf.cumulativeDelta)) : 0,
      maxSurplus: cashFlows.length > 0 ? Math.max(...cashFlows.map(cf => cf.cumulativeDelta)) : 0,
      totalDays: days
    },
    // Additional properties expected by the interface
    monthlyRate,
    dailyRate,
    overdraftDailyRate,
    overnightDailyRate,
    overdraftMonthlyRate,
    overnightMonthlyRate,
    netIncome,
    difference
  };
};
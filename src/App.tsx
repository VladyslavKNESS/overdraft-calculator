import React, { useState, useMemo } from 'react';
import { Button } from "./components/ui/button";
import { Calculator } from "lucide-react";
import { TooltipProvider } from "./components/ui/tooltip";

// Імпорти модулів калькулятора
import { FormData, HourlyData, Results, TableState } from './components/calculator/types';
import { DEFAULT_FORM_DATA } from './components/calculator/constants';
import { performMainCalculation } from './components/calculator/calculations';
import { formatDate, generateDatesForPeriod, hasDataInTable } from './components/calculator/utils';
import { FormSection } from './components/calculator/FormSection';
import { HourlyTables } from './components/calculator/HourlyTables';
import { ResultsSection } from './components/calculator/ResultsSection';
import { DecadeDemo } from './components/calculator/DecadeDemo';

export default function App() {
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [hourlyPrices, setHourlyPrices] = useState<HourlyData>({});
  const [hourlyBuyVolumes, setHourlyBuyVolumes] = useState<HourlyData>({});
  const [hourlySellVolumes, setHourlySellVolumes] = useState<HourlyData>({});
  const [results, setResults] = useState<Results | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tableState, setTableState] = useState<TableState>({
    isPriceTableCollapsed: false,
    isBuyVolumeTableCollapsed: false,
    isSellVolumeTableCollapsed: false,
  });
  const [showDecadeDemo, setShowDecadeDemo] = useState(false);

  // Генерація дат на основі періоду постачання
  const monthDates = useMemo(() => {
    return generateDatesForPeriod(new Date(formData.supplyStart), new Date(formData.supplyEnd));
  }, [formData.supplyStart, formData.supplyEnd]);

  // Ініціалізація погодинних даних при зміні періоду
  React.useEffect(() => {
    const newPriceData: HourlyData = {};
    const newBuyVolumeData: HourlyData = {};
    const newSellVolumeData: HourlyData = {};

    monthDates.forEach(dateStr => {
      if (!hourlyPrices[dateStr]) {
        newPriceData[dateStr] = Array(24).fill(formData.planPrice);
      } else {
        newPriceData[dateStr] = [...hourlyPrices[dateStr]];
      }

      if (!hourlyBuyVolumes[dateStr]) {
        newBuyVolumeData[dateStr] = Array(24).fill(formData.buyVolume);
      } else {
        newBuyVolumeData[dateStr] = [...hourlyBuyVolumes[dateStr]];
      }

      if (!hourlySellVolumes[dateStr]) {
        newSellVolumeData[dateStr] = Array(24).fill(formData.sellVolume);
      } else {
        newSellVolumeData[dateStr] = [...hourlySellVolumes[dateStr]];
      }
    });

    setHourlyPrices(newPriceData);
    setHourlyBuyVolumes(newBuyVolumeData);
    setHourlySellVolumes(newSellVolumeData);
  }, [monthDates, formData.planPrice, formData.buyVolume, formData.sellVolume]);

  // Універсальна функція для обробки введення, що дозволяє пусті значення в числових полях
  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Функція для обробки числових полів з підтримкою пустих значень
  const handleNumberInput = (field: keyof FormData, value: string, parser: (val: string) => number = parseFloat) => {
    const finalValue = value === '' ? '' : (parser(value) || 0);
    setFormData(prev => ({ ...prev, [field]: finalValue }));
  };

  const handleHourlyPriceChange = (date: string, hour: number, value: string) => {
    // Зберігаємо пусті рядки як пусті, а не перетворюємо в 0
    const finalValue = value === '' ? '' : (parseFloat(value) || 0);
    
    setHourlyPrices(prev => ({
      ...prev,
      [date]: prev[date] ? [...prev[date].slice(0, hour), finalValue, ...prev[date].slice(hour + 1)] : Array(24).fill(0).map((_, i) => i === hour ? finalValue : 0)
    }));
  };

  const handleHourlyBuyVolumeChange = (date: string, hour: number, value: string) => {
    // Зберігаємо пусті рядки як пусті, а не перетворюємо в 0
    const finalValue = value === '' ? '' : (parseFloat(value) || 0);
    
    setHourlyBuyVolumes(prev => ({
      ...prev,
      [date]: prev[date] ? [...prev[date].slice(0, hour), finalValue, ...prev[date].slice(hour + 1)] : Array(24).fill(0).map((_, i) => i === hour ? finalValue : 0)
    }));
  };

  const handleHourlySellVolumeChange = (date: string, hour: number, value: string) => {
    // Зберігаємо пусті рядки як пусті, а не перетворюємо в 0
    const finalValue = value === '' ? '' : (parseFloat(value) || 0);
    
    setHourlySellVolumes(prev => ({
      ...prev,
      [date]: prev[date] ? [...prev[date].slice(0, hour), finalValue, ...prev[date].slice(hour + 1)] : Array(24).fill(0).map((_, i) => i === hour ? finalValue : 0)
    }));
  };

  const handleTableStateChange = (field: keyof TableState, value: boolean) => {
    setTableState(prev => ({ ...prev, [field]: value }));
  };

  const calculate = async () => {
    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const calculationResults = performMainCalculation(
        formData,
        hourlyPrices,
        hourlyBuyVolumes,
        hourlySellVolumes
      );
      
      setResults(calculationResults);
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-yellow-50/20 to-amber-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Калькулятор грошових потоків</h1>
                <p className="text-lg text-gray-600">Енергетична торгівля з розширеними режимами оплати</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={calculate}
                disabled={isCalculating}
                size="lg"
                className="px-12 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 transform hover:scale-105 transition-all duration-300"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Розраховується...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5 mr-3" />
                    Розрахувати
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowDecadeDemo(!showDecadeDemo)}
                variant="outline"
                size="lg"
                className="px-8 py-4 border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {showDecadeDemo ? 'Приховати' : 'Показати'} подекадні розрахунки
              </Button>
            </div>
          </div>

          {/* Decade Demo */}
          <DecadeDemo isVisible={showDecadeDemo} />

          {/* Main Form */}
          <FormSection 
            formData={formData}
            onInputChange={handleInputChange}
            onNumberInputChange={handleNumberInput}
          />

          {/* Hourly Tables */}
          {(formData.priceType === 'hourly' || formData.buyVolumeType === 'hourly' || formData.sellVolumeType === 'hourly') && (
            <HourlyTables
              formData={formData}
              monthDates={monthDates}
              hourlyPrices={hourlyPrices}
              hourlyBuyVolumes={hourlyBuyVolumes}
              hourlySellVolumes={hourlySellVolumes}
              tableState={tableState}
              onHourlyPriceChange={handleHourlyPriceChange}
              onHourlyBuyVolumeChange={handleHourlyBuyVolumeChange}
              onHourlySellVolumeChange={handleHourlySellVolumeChange}
              onTableStateChange={handleTableStateChange}
              hasDataInTable={hasDataInTable}
            />
          )}

          {/* Results */}
          {results && (
            <ResultsSection 
              formData={formData}
              results={results}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
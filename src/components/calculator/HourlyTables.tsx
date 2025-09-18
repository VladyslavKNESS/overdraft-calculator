import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { BarChart, TrendingDown, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { FormData, HourlyData, TableState } from './types';

interface HourlyTablesProps {
  formData: FormData;
  monthDates: string[];
  hourlyPrices: HourlyData;
  hourlyBuyVolumes: HourlyData;
  hourlySellVolumes: HourlyData;
  tableState: TableState;
  onHourlyPriceChange: (date: string, hour: number, value: string) => void;
  onHourlyBuyVolumeChange: (date: string, hour: number, value: string) => void;
  onHourlySellVolumeChange: (date: string, hour: number, value: string) => void;
  onTableStateChange: (field: keyof TableState, value: boolean) => void;
  hasDataInTable: (tableData: HourlyData) => boolean;
}

export function HourlyTables({
  formData,
  monthDates,
  hourlyPrices,
  hourlyBuyVolumes,
  hourlySellVolumes,
  tableState,
  onHourlyPriceChange,
  onHourlyBuyVolumeChange,
  onHourlySellVolumeChange,
  onTableStateChange,
  hasDataInTable
}: HourlyTablesProps) {
  // Функції для обробки вставки
  const handlePricePaste = (e: React.ClipboardEvent, date: string, hour: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length === 0) return;

    const startDateIndex = monthDates.indexOf(date);
    if (startDateIndex === -1) return;

    rows.forEach((row, rowIndex) => {
      const targetDateIndex = startDateIndex + rowIndex;
      if (targetDateIndex >= monthDates.length) return;
      
      const targetDate = monthDates[targetDateIndex];
      const cells = row.split('\t');
      
      cells.forEach((cell, cellIndex) => {
        const targetHour = hour + cellIndex;
        if (targetHour >= 24) return;
        
        let cleanValue = cell.trim()
          .replace(/\s/g, '')
          .replace(/,/g, '.');
        
        if (cleanValue === '' || cleanValue === '-' || isNaN(Number(cleanValue))) {
          cleanValue = '0';
        }
        
        const preciseValue = Number(cleanValue);
        onHourlyPriceChange(targetDate, targetHour, preciseValue.toString());
      });
    });
  };

  const handleBuyVolumePaste = (e: React.ClipboardEvent, date: string, hour: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length === 0) return;

    const startDateIndex = monthDates.indexOf(date);
    if (startDateIndex === -1) return;

    rows.forEach((row, rowIndex) => {
      const targetDateIndex = startDateIndex + rowIndex;
      if (targetDateIndex >= monthDates.length) return;
      
      const targetDate = monthDates[targetDateIndex];
      const cells = row.split('\t');
      
      cells.forEach((cell, cellIndex) => {
        const targetHour = hour + cellIndex;
        if (targetHour >= 24) return;
        
        const numValue = parseFloat(cell.replace(',', '.')) || 0;
        onHourlyBuyVolumeChange(targetDate, targetHour, numValue.toString());
      });
    });
  };

  const handleSellVolumePaste = (e: React.ClipboardEvent, date: string, hour: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const rows = pastedData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length === 0) return;

    const startDateIndex = monthDates.indexOf(date);
    if (startDateIndex === -1) return;

    rows.forEach((row, rowIndex) => {
      const targetDateIndex = startDateIndex + rowIndex;
      if (targetDateIndex >= monthDates.length) return;
      
      const targetDate = monthDates[targetDateIndex];
      const cells = row.split('\t');
      
      cells.forEach((cell, cellIndex) => {
        const targetHour = hour + cellIndex;
        if (targetHour >= 24) return;
        
        const numValue = parseFloat(cell.replace(',', '.')) || 0;
        onHourlySellVolumeChange(targetDate, targetHour, numValue.toString());
      });
    });
  };

  return (
    <>
      {/* Таблиця цін */}
      {formData.priceType === 'hourly' && (
        <Card className="mb-8 shadow-lg border-0 shadow-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="py-0 bg-white/20 rounded-lg">
                <BarChart className="h-5 w-5" />
              </div>
              <span>Погодинна таблиця цін</span>
              <span className="text-sm text-emerald-100 ml-auto mr-4">Ctrl+V для точної вставки з Excel</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTableStateChange('isPriceTableCollapsed', !tableState.isPriceTableCollapsed)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {tableState.isPriceTableCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {!tableState.isPriceTableCollapsed && (
            <CardContent className="p-4">
              <div className="mb-4 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  <strong>Інструкція:</strong> Для вставки цін з Excel - клікніть на потрібну комірку та натисніть Ctrl+V. 
                  Ціни будуть збережені з усіма десятковими знаками без округлень.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-100 to-teal-100">
                      <th className="border border-gray-300 py-0 text-center font-semibold">Дата</th>
                      {Array.from({ length: 24 }, (_, i) => (
                        <th key={i} className="border border-gray-300 py-0 text-center font-semibold min-w-16">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthDates.map((date, index) => (
                      <tr key={date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 py-0 text-center font-medium bg-emerald-50">
                          {date}
                        </td>
                        {Array.from({ length: 24 }, (_, hour) => (
                          <td key={hour} className="border border-gray-300 p-1">
                            <Input
                              type="number"
                              step="0.01"
                              value={hourlyPrices[date]?.[hour] === '' ? '' : hourlyPrices[date]?.[hour] || 0}
                              onChange={(e) => onHourlyPriceChange(date, hour, e.target.value)}
                              onPaste={(e) => handlePricePaste(e, date, hour)}
                              className="w-full h-5 text-xs p-1 border-emerald-200 focus:border-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
          {tableState.isPriceTableCollapsed && hasDataInTable(hourlyPrices) && (
            <CardContent className="p-4">
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-emerald-700">Таблиця згорнута. Дані збережено.</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Таблиця обсягів купівлі */}
      {formData.buyVolumeType === 'hourly' && (
        <Card className="mb-8 shadow-lg border-0 shadow-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="py-0 bg-white/20 rounded-lg">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span>Погодинна таблиця обсягів купівлі</span>
              <span className="text-sm text-red-100 ml-auto mr-4">Ctrl+V для вставки з Excel</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTableStateChange('isBuyVolumeTableCollapsed', !tableState.isBuyVolumeTableCollapsed)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {tableState.isBuyVolumeTableCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {!tableState.isBuyVolumeTableCollapsed && (
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-100 to-pink-100">
                      <th className="border border-gray-300 py-0 text-center font-semibold">Дата</th>
                      {Array.from({ length: 24 }, (_, i) => (
                        <th key={i} className="border border-gray-300 py-0 text-center font-semibold min-w-16">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthDates.map((date, index) => (
                      <tr key={date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 py-0 text-center font-medium bg-red-50">
                          {date}
                        </td>
                        {Array.from({ length: 24 }, (_, hour) => (
                          <td key={hour} className="border border-gray-300 p-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={hourlyBuyVolumes[date]?.[hour] === '' ? '' : hourlyBuyVolumes[date]?.[hour] || 0}
                              onChange={(e) => onHourlyBuyVolumeChange(date, hour, e.target.value)}
                              onPaste={(e) => handleBuyVolumePaste(e, date, hour)}
                              className="w-full h-5 text-xs p-1 border-red-200 focus:border-red-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
          {tableState.isBuyVolumeTableCollapsed && hasDataInTable(hourlyBuyVolumes) && (
            <CardContent className="p-4">
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-red-700">Таблиця згорнута. Дані збережено.</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Таблиця обсягів продажу */}
      {formData.sellVolumeType === 'hourly' && (
        <Card className="mb-8 shadow-lg border-0 shadow-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="py-0 bg-white/20 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span>Погодинна таблиця обсягів продажу</span>
              <span className="text-sm text-green-100 ml-auto mr-4">Ctrl+V для вставки з Excel</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTableStateChange('isSellVolumeTableCollapsed', !tableState.isSellVolumeTableCollapsed)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {tableState.isSellVolumeTableCollapsed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {!tableState.isSellVolumeTableCollapsed && (
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-emerald-100">
                      <th className="border border-gray-300 py-0 text-center font-semibold">Дата</th>
                      {Array.from({ length: 24 }, (_, i) => (
                        <th key={i} className="border border-gray-300 py-0 text-center font-semibold min-w-16">
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {monthDates.map((date, index) => (
                      <tr key={date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 py-0 text-center font-medium bg-green-50">
                          {date}
                        </td>
                        {Array.from({ length: 24 }, (_, hour) => (
                          <td key={hour} className="border border-gray-300 p-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={hourlySellVolumes[date]?.[hour] === '' ? '' : hourlySellVolumes[date]?.[hour] || 0}
                              onChange={(e) => onHourlySellVolumeChange(date, hour, e.target.value)}
                              onPaste={(e) => handleSellVolumePaste(e, date, hour)}
                              className="w-full h-5 text-xs p-1 border-green-200 focus:border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
          {tableState.isSellVolumeTableCollapsed && hasDataInTable(hourlySellVolumes) && (
            <CardContent className="p-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-700">Таблиця згорнута. Дані збережено.</p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
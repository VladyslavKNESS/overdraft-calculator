import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TrendingUp, TrendingDown, DollarSign, Percent, Calculator, ChevronDown, ChevronUp, Calendar, Clock, Target, BarChart, Grid3X3 } from 'lucide-react';
import { FormData, Results } from './types';
import { formatCurrency } from './utils';

interface ResultsSectionProps {
  formData: FormData;
  results: Results;
}

export function ResultsSection({ formData, results }: ResultsSectionProps) {
  const [isCashFlowTableCollapsed, setIsCashFlowTableCollapsed] = useState(false);

  // Safe accessors for potentially undefined values
  const safeResults = {
    ...results,
    netIncome: results.netIncome || 0,
    difference: results.difference || 0,
    overdraftMonthlyRate: results.overdraftMonthlyRate || 0,
    overdraftDailyRate: results.overdraftDailyRate || 0,
    overnightMonthlyRate: results.overnightMonthlyRate || 0,
    overnightDailyRate: results.overnightDailyRate || 0,
  };

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {/* Динамічні картки обсягу */}
        {(formData.buyVolumeType === 'hourly' || formData.sellVolumeType === 'hourly') ? (
          <>
            <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Обсяг купівлі</p>
                      <p className="text-2xl font-bold">{formatCurrency(results.totalBuyVolume)}</p>
                      <p className="text-red-200 text-xs">МВт·год</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingDown className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Обсяг продажу</p>
                      <p className="text-2xl font-bold">{formatCurrency(results.totalSellVolume)}</p>
                      <p className="text-green-200 text-xs">МВт·год</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 text-sm font-medium">Загальний обсяг</p>
                    <p className="text-2xl font-bold">{formatCurrency(results.totalVolume)}</p>
                    <p className="text-slate-300 text-xs">МВт·год</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Надходження</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalIncome)}</p>
                  <p className="text-emerald-200 text-xs">грн</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Витрати</p>
                  <p className="text-2xl font-bold">{formatCurrency(results.totalExpenses)}</p>
                  <p className="text-red-200 text-xs">грн</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingDown className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className={`p-6 text-white ${safeResults.netIncome >= 0 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-orange-500 to-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${safeResults.netIncome >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
                    Чистий дохід
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(safeResults.netIncome)}</p>
                  <p className={`text-xs ${safeResults.netIncome >= 0 ? 'text-blue-200' : 'text-orange-200'}`}>
                    грн
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Різниця</p>
                  <p className="text-2xl font-bold">{safeResults.difference.toFixed(2)}%</p>
                  <p className="text-purple-200 text-xs">маржа</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Percent className="h-8 w-8" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Mode Info */}
      {(formData.buyPaymentMode === 'postpay' || formData.sellPaymentMode === 'postpay') && (
        <Card className="mb-8 shadow-lg border-0 shadow-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <span>Режими оплати</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Купівля
                </h4>
                <div className="text-sm text-red-700">
                  <p><strong>Режим:</strong> {formData.buyPaymentMode === 'postpay' ? 'Післяплата' : 'Аванс (Д-Х)'}</p>
                  {formData.buyPaymentMode === 'postpay' && (
                    <div className="mt-1 text-xs text-red-600">
                      <p><strong>Тип:</strong> {formData.buyPostpayType === 'decade' ? 'Подекадна' : 'Денна'}</p>
                      {formData.buyPostpayType === 'days' && (
                        <>
                          <p><strong>Період:</strong> Д+{formData.postpayDaysBuy}{formData.postpayOffsetDaysBuy > 0 ? ` + ${formData.postpayOffsetDaysBuy} днів зсув` : ''}</p>
                          {formData.postpayDaysBuy >= 15 ? (
                            <p className="text-purple-600 font-medium">
                              Спеціальна логіка: розбиття на періоди (1-15 та 16-кінець місяця)
                            </p>
                          ) : (
                            <p className="text-blue-600 font-medium">
                              Логіка: кожен день постачання оплачується окремо через {formData.postpayDaysBuy} {formData.postpayDaysBuy === 1 ? 'день' : 'днів'}
                            </p>
                          )}
                          <p><strong>Вихідні:</strong> {formData.weekendPostpayUs ? 'Дозволені' : 'Перенос на робочі дні'}</p>
                        </>
                      )}
                      {formData.buyPostpayType === 'decade' && (
                        <div>
                          <p>Оплата в останній день кожної декади</p>
                          <p className="text-xs mt-1">
                            1 декада: {formData.buyDiscount1}{formData.buyDiscount1Unit} | 
                            2 декада: {formData.buyDiscount2}{formData.buyDiscount2Unit} | 
                            3 декада: {formData.buyDiscount3}{formData.buyDiscount3Unit}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Продаж
                </h4>
                <div className="text-sm text-green-700">
                  <p><strong>Режим:</strong> {formData.sellPaymentMode === 'postpay' ? 'Післяплата' : 'Аванс (Д-Х)'}</p>
                  {formData.sellPaymentMode === 'postpay' && (
                    <div className="mt-1 text-xs text-green-600">
                      <p><strong>Тип:</strong> {formData.sellPostpayType === 'decade' ? 'Подекадна' : 'Денна'}</p>
                      {formData.sellPostpayType === 'days' && (
                        <>
                          <p><strong>Період:</strong> Д+{formData.postpayDaysSell}{formData.postpayOffsetDaysSell > 0 ? ` + ${formData.postpayOffsetDaysSell} днів зсув` : ''}</p>
                          {formData.postpayDaysSell >= 15 ? (
                            <p className="text-purple-600 font-medium">
                              Спеціальна логіка: розбиття на періоди (1-15 та 16-кінець місяця)
                            </p>
                          ) : (
                            <p className="text-blue-600 font-medium">
                              Логіка: кожен день постачання оплачується окремо через {formData.postpayDaysSell} {formData.postpayDaysSell === 1 ? 'день' : 'днів'}
                            </p>
                          )}
                          <p><strong>Вихідні:</strong> {formData.weekendPostpayThem ? 'Дозволені' : 'Перенос на робочі дні'}</p>
                        </>
                      )}
                      {formData.sellPostpayType === 'decade' && (
                        <div>
                          <p>Оплата в останній день кожної декади</p>
                          <p className="text-xs mt-1">
                            1 декада: {formData.sellDiscount1}{formData.sellDiscount1Unit} | 
                            2 декада: {formData.sellDiscount2}{formData.sellDiscount2Unit} | 
                            3 декада: {formData.sellDiscount3}{formData.sellDiscount3Unit}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Metrics */}
      <Card className="mb-8 shadow-lg border-0 shadow-slate-200/50">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart className="h-5 w-5" />
            </div>
            <span>Детальна аналітика</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-blue-700 font-medium mb-2">Місячний % (Overdraft)</p>
              <p className="text-xl font-bold text-blue-900">{safeResults.overdraftMonthlyRate.toFixed(4)}%</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-purple-700 font-medium mb-2">Добовий % (Overdraft)</p>
              <p className="text-xl font-bold text-purple-900">{safeResults.overdraftDailyRate.toFixed(5)}%</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-100">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-teal-700 font-medium mb-2">Місячний % (Overnight)</p>
              <p className="text-xl font-bold text-teal-900">{safeResults.overnightMonthlyRate.toFixed(4)}%</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl border border-cyan-100">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-cyan-700 font-medium mb-2">Добовий % (Overnight)</p>
              <p className="text-xl font-bold text-cyan-900">{safeResults.overnightDailyRate.toFixed(5)}%</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-amber-700 font-medium mb-2">Відсоткові витрати (Overdraft)</p>
              <p className="text-xl font-bold text-amber-900">{formatCurrency(results.totalOverdraftInterestExpenses)}</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-emerald-700 font-medium mb-2">Відсоткові доходи (Overnight)</p>
              <p className="text-xl font-bold text-emerald-900">{formatCurrency(results.totalOvernightInterestIncome)}</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gray-600" />
              Формули розрахунку
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <strong>Чистий дохід =</strong> Надходження + Відсоткові доходи (Overnight) - Відсоткові витрати (Overdraft) - Витрати
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <strong>Різниця =</strong> 100% - (Витрати/(Надходження - Відсоткові витрати (Overdraft)))
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <strong>Overdraft =</strong> Відсоткові витрати на негативний баланс (річна ставка {formData.overdraftAnnualRate}%)
              </p>
              <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                <strong>Overnight =</strong> Відсоткові доходи на позитивний баланс (річна ставка {formData.overnightAnnualRate}%)
              </p>
              {(formData.buyPaymentMode === 'postpay' || formData.sellPaymentMode === 'postpay') && (
                <>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <strong>Денна післяплата =</strong> Агрегована сума за період + зсув
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <strong>Подекадна післяплата =</strong> Оплата в останній день декади з унікальними дисконтами
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Table */}
      <Card className="shadow-lg border-0 shadow-slate-200/50">
        <CardHeader 
          className="bg-gradient-to-r from-slate-700 to-gray-800 text-white cursor-pointer"
          onClick={() => setIsCashFlowTableCollapsed(!isCashFlowTableCollapsed)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Grid3X3 className="h-5 w-5" />
              </div>
              <span>Таблиця грошових потоків</span>
            </div>
            <div className="p-1 bg-white/20 rounded-lg">
              {isCashFlowTableCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </div>
          </CardTitle>
        </CardHeader>
        
        {!isCashFlowTableCollapsed && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-gray-100 to-slate-100">
                    <TableHead className="text-center border-r font-semibold text-gray-800">День</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Дата</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Дні витрат</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Вартість NaT</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Дні надходжень</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Надходження</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Дельта</TableHead>
                    <TableHead className="text-center border-r font-semibold text-gray-800">Overdraft</TableHead>
                    <TableHead className="text-center font-semibold text-gray-800">Overnight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.cashFlows.map((row, index) => (
                    <TableRow key={index} className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}>
                      <TableCell className="text-center border-r font-medium text-gray-800">{row.dayOfWeek}</TableCell>
                      <TableCell className="text-center border-r text-gray-700">{row.date}</TableCell>
                      <TableCell className="text-center border-r text-xs text-gray-600">{row.paymentDaysRangeUs || '-'}</TableCell>
                      <TableCell className="text-right border-r text-gray-800">
                        {row.outgoing > 0 ? formatCurrency(row.outgoing) : ''}
                      </TableCell>
                      <TableCell className="text-center border-r text-xs text-gray-600">{row.paymentDaysRangeThem || '-'}</TableCell>
                      <TableCell className="text-right border-r text-gray-800">
                        {row.incoming > 0 ? formatCurrency(row.incoming) : ''}
                      </TableCell>
                      <TableCell className={`text-right border-r font-semibold ${row.delta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatCurrency(row.delta)}
                      </TableCell>
                      <TableCell className="text-right border-r text-red-600 font-medium">
                        {row.dayInterestExpense > 0 ? formatCurrency(row.dayInterestExpense) : ''}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {row.dayInterestIncome > 0 ? formatCurrency(row.dayInterestIncome) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}
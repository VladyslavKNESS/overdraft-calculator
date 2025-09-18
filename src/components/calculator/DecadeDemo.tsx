import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar, Layers3, TrendingUp, TrendingDown } from 'lucide-react';
import { getDecadePeriods } from './utils';

interface DecadeDemoProps {
  isVisible: boolean;
}

export function DecadeDemo({ isVisible }: DecadeDemoProps) {
  if (!isVisible) return null;

  // Демонстрація для різних місяців
  const demoMonths = [
    { year: 2025, month: 1, name: 'Лютий (28 днів)' }, // month 1 = February (0-indexed)
    { year: 2024, month: 1, name: 'Лютий (29 днів, високосний)' },
    { year: 2025, month: 3, name: 'Квітень (30 днів)' },
    { year: 2025, month: 0, name: 'Січень (31 день)' },
  ];

  return (
    <Card className="mt-6 shadow-lg border-0 shadow-slate-200/50">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Layers3 className="h-5 w-5" />
          </div>
          <span>Демонстрація подекадних розрахунків</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Як працюють подекадні оплати
          </h4>
          <div className="text-sm text-indigo-700 space-y-2">
            <p><strong>Логіка:</strong> Місяць ділиться на 3 декади з унікальними дисконтами для кожної.</p>
            <p><strong>Оплата:</strong> В останній день кожної декади (10, 20, останній день місяця).</p>
            <p><strong>Дисконти:</strong> Кожна декада може мати свій дисконт у %, UAH або fix.</p>
          </div>
        </div>

        <div className="space-y-6">
          {demoMonths.map((demo, index) => {
            const periods = getDecadePeriods(demo.year, demo.month);
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-300">
                    {demo.name}
                  </Badge>
                </h5>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center">Декада</TableHead>
                      <TableHead className="text-center">Період</TableHead>
                      <TableHead className="text-center">Кількість днів</TableHead>
                      <TableHead className="text-center">День оплати</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.map((period) => (
                      <TableRow key={period.decade}>
                        <TableCell className="text-center font-medium">
                          <Badge 
                            variant={period.decade === 1 ? "default" : period.decade === 2 ? "secondary" : "outline"}
                            className={
                              period.decade === 1 ? "bg-green-100 text-green-800" :
                              period.decade === 2 ? "bg-blue-100 text-blue-800" :
                              "bg-purple-100 text-purple-800"
                            }
                          >
                            {period.decade} декада
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{period.start} - {period.end}</TableCell>
                        <TableCell className="text-center">{period.end - period.start + 1} днів</TableCell>
                        <TableCell className="text-center font-semibold text-indigo-600">{period.payDay}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-800 mb-2">Приклад використання</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <p>1. Виберіть режим оплати "Післяплата" для купівлі або продажу</p>
            <p>2. Оберіть тип "Подекадна"</p>
            <p>3. Налаштуйте унікальні дисконти для кожної з 3 декад</p>
            <p>4. Система автоматично розрахує оплати в кінці кожної декади</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Купівля (подекадна)
            </h5>
            <div className="text-xs text-red-600 space-y-1">
              <p><strong>1 декада:</strong> Дисконт 1 (%, UAH або fix)</p>
              <p><strong>2 декада:</strong> Дисконт 2 (%, UAH або fix)</p>
              <p><strong>3 декада:</strong> Дисконт 3 (%, UAH або fix)</p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Продаж (подекадна)
            </h5>
            <div className="text-xs text-green-600 space-y-1">
              <p><strong>1 декада:</strong> Дисконт 1 (%, UAH або fix)</p>
              <p><strong>2 декада:</strong> Дисконт 2 (%, UAH або fix)</p>
              <p><strong>3 декада:</strong> Дисконт 3 (%, UAH або fix)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
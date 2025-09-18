import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { CalendarIcon, DollarSign, Settings, TrendingDown, TrendingUp, CreditCard, Layers3 } from 'lucide-react';
import { FormData } from './types';

interface FormSectionProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | number | boolean) => void;
  onNumberInputChange: (field: keyof FormData, value: string, parser?: (val: string) => number) => void;
}

export function FormSection({ formData, onInputChange, onNumberInputChange }: FormSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Block 1: Payment Dates & Supply Period */}
      <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-white/20 rounded-lg">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <span>Дати та періоди</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Дата першого авансового платежу від нас:
              </Label>
              <Input
                type="date"
                value={formData.firstPaymentUs}
                onChange={(e) => onInputChange('firstPaymentUs', e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                disabled={formData.buyPaymentMode === 'postpay'}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Дата першого авансового платежу нам:
              </Label>
              <Input
                type="date"
                value={formData.firstPaymentThem}
                onChange={(e) => onInputChange('firstPaymentThem', e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                disabled={formData.sellPaymentMode === 'postpay'}
              />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Початок постачання:
              </Label>
              <Input
                type="date"
                value={formData.supplyStart}
                onChange={(e) => onInputChange('supplyStart', e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Кінець постачання:
              </Label>
              <Input
                type="date"
                value={formData.supplyEnd}
                onChange={(e) => onInputChange('supplyEnd', e.target.value)}
                className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
              />
            </div>
          </div>

          {/* Weekend payment checkboxes */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekendPayUs"
                  checked={formData.weekendPayUs}
                  onCheckedChange={(checked) => onInputChange('weekendPayUs', checked as boolean)}
                />
                <Label htmlFor="weekendPayUs" className="text-sm text-gray-700 cursor-pointer">
                  Дозволені платежі у вихідні (від нас)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekendPayThem"
                  checked={formData.weekendPayThem}
                  onCheckedChange={(checked) => onInputChange('weekendPayThem', checked as boolean)}
                />
                <Label htmlFor="weekendPayThem" className="text-sm text-gray-700 cursor-pointer">
                  Дозволені платежі у вихідні (нам)
                </Label>
              </div>
              {formData.buyPaymentMode === 'postpay' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekendPostpayUs"
                    checked={formData.weekendPostpayUs}
                    onCheckedChange={(checked) => onInputChange('weekendPostpayUs', checked as boolean)}
                  />
                  <Label htmlFor="weekendPostpayUs" className="text-sm text-gray-700 cursor-pointer">
                    Дозволені післяплати у вихідні (від нас)
                  </Label>
                </div>
              )}
              {formData.sellPaymentMode === 'postpay' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekendPostpayThem"
                    checked={formData.weekendPostpayThem}
                    onCheckedChange={(checked) => onInputChange('weekendPostpayThem', checked as boolean)}
                  />
                  <Label htmlFor="weekendPostpayThem" className="text-sm text-gray-700 cursor-pointer">
                    Дозволені післяплати у вихідні (нам)
                  </Label>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 2: Price, Volume, Terms */}
      <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <span>Основні параметри</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Тип ціни
              </Label>
              <Select value={formData.priceType} onValueChange={(value) => onInputChange('priceType', value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Загальна ціна</SelectItem>
                  <SelectItem value="hourly">Погодинна таблиця</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Планова ціна, грн/МВт·год
              </Label>
              <Input
                type="number"
                step="0.01"
                value={formData.planPrice === '' ? '' : formData.planPrice}
                onChange={(e) => onNumberInputChange('planPrice', e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={formData.priceType === 'hourly'}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Тип обсягу купівлі
              </Label>
              <Select value={formData.buyVolumeType} onValueChange={(value) => onInputChange('buyVolumeType', value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Загальний обсяг</SelectItem>
                  <SelectItem value="hourly">Погодинний графік</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Тип обсягу продажу
              </Label>
              <Select value={formData.sellVolumeType} onValueChange={(value) => onInputChange('sellVolumeType', value)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Загальний обсяг</SelectItem>
                  <SelectItem value="hourly">Погодинний графік</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Обсяг купівлі, МВт·год
              </Label>
              <Input
                type="number"
                step="0.1"
                value={formData.buyVolume === '' ? '' : formData.buyVolume}
                onChange={(e) => onNumberInputChange('buyVolume', e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={formData.buyVolumeType === 'hourly'}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Обсяг продажу, МВт·год
              </Label>
              <Input
                type="number"
                step="0.1"
                value={formData.sellVolume === '' ? '' : formData.sellVolume}
                onChange={(e) => onNumberInputChange('sellVolume', e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={formData.sellVolumeType === 'hourly'}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Тип навантаження
            </Label>
            <Input
              value={formData.loadType}
              onChange={(e) => onInputChange('loadType', e.target.value)}
              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
              placeholder="блок 1 - 24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Умови купівлі (Д-Х)
              </Label>
              <Input
                type="number"
                value={formData.paymentTerms === '' ? '' : formData.paymentTerms}
                onChange={(e) => onNumberInputChange('paymentTerms', e.target.value, parseInt)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={formData.buyPaymentMode === 'postpay'}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Умови продажу (Д-Х)
              </Label>
              <Input
                type="number"
                value={formData.sellTerms === '' ? '' : formData.sellTerms}
                onChange={(e) => onNumberInputChange('sellTerms', e.target.value, parseInt)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={formData.sellPaymentMode === 'postpay'}
              />
            </div>
          </div>

          {/* Відсоткові ставки */}
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Річна ставка Overdraft, %
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overdraftAnnualRate === '' ? '' : formData.overdraftAnnualRate}
                  onChange={(e) => onNumberInputChange('overdraftAnnualRate', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="наприклад, 24"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Річна ставка Overnight, %
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overnightAnnualRate === '' ? '' : formData.overnightAnnualRate}
                  onChange={(e) => onNumberInputChange('overnightAnnualRate', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="наприклад, 6.5"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Discounts and Payment Settings */}
      <Card className="shadow-lg border-0 shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-white/20 rounded-lg">
              <Settings className="h-5 w-5" />
            </div>
            <span>Знижки та оплата</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Payment Modes */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Режими оплати
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1 block">
                  Режим купівлі
                </Label>
                <Select value={formData.buyPaymentMode} onValueChange={(value) => onInputChange('buyPaymentMode', value)}>
                  <SelectTrigger className="h-9 border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepay">Аванс (Д-Х)</SelectItem>
                    <SelectItem value="postpay">Післяплата</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-1 block">
                  Режим продажу
                </Label>
                <Select value={formData.sellPaymentMode} onValueChange={(value) => onInputChange('sellPaymentMode', value)}>
                  <SelectTrigger className="h-9 border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepay">Аванс (Д-Х)</SelectItem>
                    <SelectItem value="postpay">Післяплата</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Postpay Settings */}
            {(formData.buyPaymentMode === 'postpay' || formData.sellPaymentMode === 'postpay') && (
              <div className="pt-3 border-t border-purple-200">
                {/* Postpay Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {formData.buyPaymentMode === 'postpay' && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">
                        Тип післяплати (купівля)
                      </Label>
                      <Select value={formData.buyPostpayType} onValueChange={(value) => onInputChange('buyPostpayType', value)}>
                        <SelectTrigger className="h-9 border-purple-200 focus:border-purple-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Денна</SelectItem>
                          <SelectItem value="decade">Подекадна</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {formData.sellPaymentMode === 'postpay' && (
                    <div>
                      <Label className="text-xs font-medium text-gray-600 mb-1 block">
                        Тип післяплати (продаж)
                      </Label>
                      <Select value={formData.sellPostpayType} onValueChange={(value) => onInputChange('sellPostpayType', value)}>
                        <SelectTrigger className="h-9 border-purple-200 focus:border-purple-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">Денна</SelectItem>
                          <SelectItem value="decade">Подекадна</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Days Settings */}
                {((formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'days') || 
                  (formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'days')) && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'days' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Днів післяплати (купівля)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={formData.postpayDaysBuy === '' ? '' : formData.postpayDaysBuy}
                          onChange={(e) => onNumberInputChange('postpayDaysBuy', e.target.value, parseInt)}
                          className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Дні від початку постачання до платежу
                        </p>
                      </div>
                    )}
                    {formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'days' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Днів післяплати (продаж)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={formData.postpayDaysSell === '' ? '' : formData.postpayDaysSell}
                          onChange={(e) => onNumberInputChange('postpayDaysSell', e.target.value, parseInt)}
                          className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Дні від початку постачання до платежу
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Offset Days (only for days type) */}
                {((formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'days') || 
                  (formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'days')) && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'days' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Додаткові дні зсуву (купівля)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={formData.postpayOffsetDaysBuy === '' ? '' : formData.postpayOffsetDaysBuy}
                          onChange={(e) => onNumberInputChange('postpayOffsetDaysBuy', e.target.value, parseInt)}
                          className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                    {formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'days' && (
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">
                          Додаткові дні зсуву (продаж)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="90"
                          value={formData.postpayOffsetDaysSell === '' ? '' : formData.postpayOffsetDaysSell}
                          onChange={(e) => onNumberInputChange('postpayOffsetDaysSell', e.target.value, parseInt)}
                          className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Standard Purchase and Sell Discounts */}
          {!(formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'decade') && (
            <div className="p-4 bg-red-50 rounded-xl">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Купівля
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Одиниця знижки/націнки
                  </Label>
                  <Select value={formData.buyDiscountUnit} onValueChange={(value) => onInputChange('buyDiscountUnit', value)}>
                    <SelectTrigger className="h-9 border-red-200 focus:border-red-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="UAH">UAH</SelectItem>
                      <SelectItem value="fix">fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Дисконт
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.buyDiscount === '' ? '' : formData.buyDiscount}
                    onChange={(e) => onNumberInputChange('buyDiscount', e.target.value)}
                    className="h-9 border-red-200 focus:border-red-400 focus:ring-red-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}

          {!(formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'decade') && (
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Продаж
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Одиниця знижки/націнки
                  </Label>
                  <Select value={formData.sellDiscountUnit} onValueChange={(value) => onInputChange('sellDiscountUnit', value)}>
                    <SelectTrigger className="h-9 border-green-200 focus:border-green-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="UAH">UAH</SelectItem>
                      <SelectItem value="fix">fix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600 mb-1 block">
                    Дисконт
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.sellDiscount === '' ? '' : formData.sellDiscount}
                    onChange={(e) => onNumberInputChange('sellDiscount', e.target.value)}
                    className="h-9 border-green-200 focus:border-green-400 focus:ring-green-400/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Decade Discounts */}
          {((formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'decade') || 
            (formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'decade')) && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                <Layers3 className="h-4 w-4" />
                Подекадні дисконти
              </h4>
              
              {formData.buyPaymentMode === 'postpay' && formData.buyPostpayType === 'decade' && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-red-700 mb-2">Купівля</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(decade => (
                      <div key={decade}>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">{decade} декада</Label>
                        <div className="grid grid-cols-2 gap-1">
                          <Select 
                            value={formData[`buyDiscount${decade}Unit` as keyof FormData] as string} 
                            onValueChange={(value) => onInputChange(`buyDiscount${decade}Unit` as keyof FormData, value)}
                          >
                            <SelectTrigger className="h-8 border-red-200 focus:border-red-400 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="UAH">UAH</SelectItem>
                              <SelectItem value="fix">fix</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData[`buyDiscount${decade}` as keyof FormData] === '' ? '' : formData[`buyDiscount${decade}` as keyof FormData]}
                            onChange={(e) => onNumberInputChange(`buyDiscount${decade}` as keyof FormData, e.target.value)}
                            className="h-8 text-xs border-red-200 focus:border-red-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.sellPaymentMode === 'postpay' && formData.sellPostpayType === 'decade' && (
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">Продаж</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(decade => (
                      <div key={decade}>
                        <Label className="text-xs font-medium text-gray-600 mb-1 block">{decade} декада</Label>
                        <div className="grid grid-cols-2 gap-1">
                          <Select 
                            value={formData[`sellDiscount${decade}Unit` as keyof FormData] as string} 
                            onValueChange={(value) => onInputChange(`sellDiscount${decade}Unit` as keyof FormData, value)}
                          >
                            <SelectTrigger className="h-8 border-green-200 focus:border-green-400 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="%">%</SelectItem>
                              <SelectItem value="UAH">UAH</SelectItem>
                              <SelectItem value="fix">fix</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            step="0.1"
                            value={formData[`sellDiscount${decade}` as keyof FormData] === '' ? '' : formData[`sellDiscount${decade}` as keyof FormData]}
                            onChange={(e) => onNumberInputChange(`sellDiscount${decade}` as keyof FormData, e.target.value)}
                            className="h-8 text-xs border-green-200 focus:border-green-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Additional Weekend Settings */}
          {(formData.buyPaymentMode === 'postpay' || formData.sellPaymentMode === 'postpay') && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3">Налаштування вихідних для післяплати</h4>
              <div className="space-y-2">
                {formData.buyPaymentMode === 'postpay' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekendPostpayUs"
                      checked={formData.weekendPostpayUs}
                      onCheckedChange={(checked) => onInputChange('weekendPostpayUs', checked as boolean)}
                    />
                    <Label htmlFor="weekendPostpayUs" className="text-xs text-gray-600 cursor-pointer">
                      Дозволені післяплати у вихідні (купівля)
                    </Label>
                  </div>
                )}
                {formData.sellPaymentMode === 'postpay' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="weekendPostpayThem"
                      checked={formData.weekendPostpayThem}
                      onCheckedChange={(checked) => onInputChange('weekendPostpayThem', checked as boolean)}
                    />
                    <Label htmlFor="weekendPostpayThem" className="text-xs text-gray-600 cursor-pointer">
                      Дозволені післяплати у вихідні (продаж)
                    </Label>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
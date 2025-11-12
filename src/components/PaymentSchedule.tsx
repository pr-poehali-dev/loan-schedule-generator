import { RefObject } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface PaymentScheduleItem {
  day: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface PaymentScheduleProps {
  scheduleRef: RefObject<HTMLDivElement>;
  loanAmount: number;
  loanDays: number;
  totalAmount: number;
  totalInterest: number;
  schedule: PaymentScheduleItem[];
  onDownload: () => void;
}

const PaymentSchedule = ({
  scheduleRef,
  loanAmount,
  loanDays,
  totalAmount,
  totalInterest,
  schedule,
  onDownload
}: PaymentScheduleProps) => {
  return (
    <Card className="shadow-lg border-2 border-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="LineChart" size={28} />
          График платежей
        </CardTitle>
        <CardDescription className="text-blue-50">
          Подробный план выплат по займу
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div ref={scheduleRef} className="bg-white p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-center text-primary mb-2">
              ГРАФИК ПЛАТЕЖЕЙ ПО ЗАЙМУ
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"
            </p>
            <p className="text-center text-xs text-muted-foreground mt-1">
              Дата формирования: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-muted-foreground mb-1">Сумма займа</p>
              <p className="text-xl font-bold text-primary">{loanAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-200">
              <p className="text-xs text-muted-foreground mb-1">Общая сумма</p>
              <p className="text-xl font-bold text-green-600">{totalAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
              <p className="text-xs text-muted-foreground mb-1">Проценты</p>
              <p className="text-xl font-bold text-purple-600">{totalInterest.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-200">
              <p className="text-xs text-muted-foreground mb-1">Срок</p>
              <p className="text-xl font-bold text-orange-600">{loanDays} дней</p>
            </div>
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <div className="rounded-lg border border-slate-200">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gradient-to-r from-primary to-secondary text-white">
                  <tr>
                    <th className="p-2 md:p-3 text-left font-semibold">День</th>
                    <th className="p-2 md:p-3 text-right font-semibold">Платёж</th>
                    <th className="p-2 md:p-3 text-right font-semibold">Основной долг</th>
                    <th className="p-2 md:p-3 text-right font-semibold">Проценты</th>
                    <th className="p-2 md:p-3 text-right font-semibold">Остаток</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, index) => (
                    <tr
                      key={item.day}
                      className={`border-b hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="p-2 md:p-3 font-medium">{item.day}</td>
                      <td className="p-2 md:p-3 text-right font-semibold text-green-600 whitespace-nowrap">
                        {item.payment.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="p-2 md:p-3 text-right whitespace-nowrap">{item.principal.toLocaleString('ru-RU')} ₽</td>
                      <td className="p-2 md:p-3 text-right text-orange-600 whitespace-nowrap">
                        {item.interest.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="p-2 md:p-3 text-right font-medium whitespace-nowrap">
                        {item.balance.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Всего платежей</p>
              <p className="text-lg font-bold">{loanDays}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Общая сумма выплат</p>
              <p className="text-lg font-bold text-green-600">{totalAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Переплата</p>
              <p className="text-lg font-bold text-orange-600">{totalInterest.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
            <p>© 2024 ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"</p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            onClick={onDownload}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base py-6"
          >
            <Icon name="Download" className="mr-2" size={20} />
            Скачать график платежей (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSchedule;

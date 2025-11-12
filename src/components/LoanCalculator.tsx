import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface LoanCalculatorProps {
  loanAmount: number;
  loanDays: number;
  onLoanAmountChange: (value: number) => void;
  onLoanDaysChange: (value: number) => void;
  totalInterest: number;
  totalAmount: number;
  dailyPayment: number;
}

const LoanCalculator = ({
  loanAmount,
  loanDays,
  onLoanAmountChange,
  onLoanDaysChange,
  totalInterest,
  totalAmount,
  dailyPayment
}: LoanCalculatorProps) => {
  return (
    <Card className="shadow-lg border-2 border-primary/10">
      <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Icon name="Calculator" size={28} />
          Калькулятор займа
        </CardTitle>
        <CardDescription className="text-blue-50">
          Рассчитайте свой займ под 2% в день
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="space-y-4">
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              Сумма займа: <span className="text-primary">{loanAmount.toLocaleString('ru-RU')} ₽</span>
            </Label>
            <Slider
              value={[loanAmount]}
              onValueChange={(value) => onLoanAmountChange(value[0])}
              min={10000}
              max={200000}
              step={5000}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>10 000 ₽</span>
              <span>200 000 ₽</span>
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">
              Срок займа: <span className="text-primary">{loanDays} дней</span>
            </Label>
            <Slider
              value={[loanDays]}
              onValueChange={(value) => onLoanDaysChange(value[0])}
              min={7}
              max={90}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>7 дней</span>
              <span>90 дней</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-primary/20">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Icon name="Wallet" className="mx-auto mb-2 text-primary" size={24} />
            <p className="text-sm text-muted-foreground mb-1">Сумма займа</p>
            <p className="text-2xl font-bold text-primary">{loanAmount.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Icon name="Percent" className="mx-auto mb-2 text-secondary" size={24} />
            <p className="text-sm text-muted-foreground mb-1">Проценты</p>
            <p className="text-2xl font-bold text-secondary">{totalInterest.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <Icon name="Coins" className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm text-muted-foreground mb-1">К возврату</p>
            <p className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <Icon name="Info" className="inline mr-2" size={16} />
            Ежедневный платёж: <span className="font-bold">{dailyPayment.toLocaleString('ru-RU')} ₽</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCalculator;

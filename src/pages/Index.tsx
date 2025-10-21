import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface PaymentScheduleItem {
  day: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface ContractData {
  fullName: string;
  birthDate: string;
  passportSeries: string;
  passportNumber: string;
  loanAmount: number;
  loanDays: number;
  totalAmount: number;
  contractDate: string;
}

const Index = () => {
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanDays, setLoanDays] = useState<number>(30);
  const [contractData, setContractData] = useState<ContractData>({
    fullName: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    loanAmount: 0,
    loanDays: 0,
    totalAmount: 0,
    contractDate: ''
  });

  const dailyRate = 0.02;
  
  const calculateLoan = () => {
    const totalInterest = loanAmount * dailyRate * loanDays;
    const totalAmount = loanAmount + totalInterest;
    return {
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
      dailyPayment: Math.round(totalAmount / loanDays)
    };
  };

  const generatePaymentSchedule = (): PaymentScheduleItem[] => {
    const { totalAmount, dailyPayment } = calculateLoan();
    const schedule: PaymentScheduleItem[] = [];
    let remainingBalance = totalAmount;

    for (let day = 1; day <= loanDays; day++) {
      const payment = day === loanDays ? remainingBalance : dailyPayment;
      const interest = Math.round(loanAmount * dailyRate);
      const principal = payment - interest;
      remainingBalance -= payment;

      schedule.push({
        day,
        payment,
        principal: Math.max(0, principal),
        interest: Math.min(interest, payment),
        balance: Math.max(0, remainingBalance)
      });
    }

    return schedule;
  };

  const handleGenerateContract = () => {
    const { totalAmount } = calculateLoan();
    const today = new Date().toLocaleDateString('ru-RU');
    
    setContractData({
      ...contractData,
      loanAmount,
      loanDays,
      totalAmount,
      contractDate: today
    });
  };

  const downloadContract = () => {
    if (!contractData.fullName || !contractData.birthDate || !contractData.passportSeries || !contractData.passportNumber) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const contractNumber = Math.floor(Math.random() * 10000);
    const contractText = `
════════════════════════════════════════════════════════════════════════════════
                              ДОГОВОР ЗАЙМА №${contractNumber}
════════════════════════════════════════════════════════════════════════════════

г. Москва                                                  ${contractData.contractDate}

────────────────────────────────────────────────────────────────────────────────
                                 СТОРОНЫ ДОГОВОРА
────────────────────────────────────────────────────────────────────────────────

ЗАИМОДАВЕЦ:
    Наименование: ООО "МикроФинанс"
    Далее именуемый: "Заимодавец"

ЗАЕМЩИК:
    ФИО: ${contractData.fullName}
    Дата рождения: ${contractData.birthDate}
    Паспорт: серия ${contractData.passportSeries}, номер ${contractData.passportNumber}
    Далее именуемый: "Заемщик"

════════════════════════════════════════════════════════════════════════════════
                            1. ПРЕДМЕТ ДОГОВОРА
════════════════════════════════════════════════════════════════════════════════

1.1. Заимодавец обязуется передать Заемщику денежные средства (займ), 
     а Заемщик обязуется возвратить полученную сумму займа и уплатить 
     проценты за пользование займом в размере и в порядке, установленных 
     настоящим Договором.

1.2. Займ предоставляется в безналичной форме путем перечисления денежных 
     средств на банковский счет Заемщика.

════════════════════════════════════════════════════════════════════════════════
                         2. СУММА И УСЛОВИЯ ЗАЙМА
════════════════════════════════════════════════════════════════════════════════

2.1. СУММА ЗАЙМА:              ${loanAmount.toLocaleString('ru-RU')} (${this.numberToWords(loanAmount)}) рублей

2.2. СРОК ЗАЙМА:               ${loanDays} (${this.numberToWords(loanDays)}) календарных дней

2.3. ПРОЦЕНТНАЯ СТАВКА:        2% (два процента) в день

2.4. СУММА ПРОЦЕНТОВ:          ${loan.totalInterest.toLocaleString('ru-RU')} рублей

2.5. ОБЩАЯ СУММА К ВОЗВРАТУ:   ${contractData.totalAmount.toLocaleString('ru-RU')} рублей

2.6. ЕЖЕДНЕВНЫЙ ПЛАТЕЖ:        ${loan.dailyPayment.toLocaleString('ru-RU')} рублей

════════════════════════════════════════════════════════════════════════════════
                      3. ПОРЯДОК И СРОКИ ВОЗВРАТА ЗАЙМА
════════════════════════════════════════════════════════════════════════════════

3.1. Заемщик обязуется возвратить Заимодавцу полученный займ и уплатить 
     проценты за пользование займом не позднее ${loanDays} календарных дней 
     с момента получения денежных средств.

3.2. Возврат займа и уплата процентов производятся путем ежедневных платежей 
     в размере ${loan.dailyPayment.toLocaleString('ru-RU')} рублей.

3.3. Заемщик вправе досрочно возвратить займ полностью или частично, 
     уведомив об этом Заимодавца не менее чем за 3 (три) календарных дня.

════════════════════════════════════════════════════════════════════════════════
                         4. ПРАВА И ОБЯЗАННОСТИ СТОРОН
════════════════════════════════════════════════════════════════════════════════

4.1. ЗАИМОДАВЕЦ ОБЯЗУЕТСЯ:
     • Предоставить займ в сроки, указанные в Договоре
     • Предоставить график платежей по требованию Заемщика

4.2. ЗАЕМЩИК ОБЯЗУЕТСЯ:
     • Возвратить полученный займ в установленный срок
     • Уплатить проценты в размере и порядке, предусмотренных Договором
     • Уведомить Заимодавца об изменении контактных данных

════════════════════════════════════════════════════════════════════════════════
                         5. ОТВЕТСТВЕННОСТЬ СТОРОН
════════════════════════════════════════════════════════════════════════════════

5.1. За нарушение срока возврата займа Заемщик уплачивает неустойку (пени) 
     в размере 0,1% (ноль целых одна десятая процента) от суммы 
     непогашенного займа за каждый день просрочки.

5.2. Уплата неустойки не освобождает Заемщика от обязанности возврата 
     суммы займа и уплаты процентов.

5.3. В случае просрочки платежа свыше 30 дней, Заимодавец вправе обратиться 
     в суд для взыскания задолженности.

════════════════════════════════════════════════════════════════════════════════
                            6. ПРОЧИЕ УСЛОВИЯ
════════════════════════════════════════════════════════════════════════════════

6.1. Договор вступает в силу с момента его подписания обеими Сторонами 
     и действует до полного исполнения Сторонами своих обязательств.

6.2. Все споры и разногласия, возникающие из настоящего Договора или 
     в связи с ним, разрешаются путем переговоров между Сторонами.

6.3. В случае невозможности разрешения споров путем переговоров, они 
     подлежат рассмотрению в судебном порядке в соответствии с действующим 
     законодательством Российской Федерации.

6.4. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу,
     по одному для каждой из Сторон.

════════════════════════════════════════════════════════════════════════════════
                             РЕКВИЗИТЫ И ПОДПИСИ СТОРОН
════════════════════════════════════════════════════════════════════════════════

ЗАИМОДАВЕЦ:                          ЗАЕМЩИК:
ООО "МикроФинанс"                    ${contractData.fullName}
ИНН: 7701234567                      Паспорт: ${contractData.passportSeries} ${contractData.passportNumber}
ОГРН: 1177746123456                  Дата рождения: ${contractData.birthDate}
Адрес: г. Москва,
ул. Финансовая, д. 1

_____________________                _____________________
    (подпись)                            (подпись)

М.П.

════════════════════════════════════════════════════════════════════════════════
    `;

    const blob = new Blob([contractText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Договор_займа_№${contractNumber}_${contractData.fullName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    const thousands = ['', 'одна тысяча', 'две тысячи', 'три тысячи', 'четыре тысячи', 'пять тысяч', 'шесть тысяч', 'семь тысяч', 'восемь тысяч', 'девять тысяч'];
    
    if (num === 0) return 'ноль';
    if (num < 10) return ones[num];
    if (num < 100) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
    if (num < 1000) return `${hundreds[Math.floor(num / 100)]} ${numberToWords(num % 100)}`.trim();
    if (num < 10000) return `${thousands[Math.floor(num / 1000)]} ${numberToWords(num % 1000)}`.trim();
    
    return num.toString();
  };

  const loan = calculateLoan();
  const schedule = generatePaymentSchedule();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            МикроФинанс
          </h1>
          <p className="text-lg text-muted-foreground">
            Современный подход к микрозаймам
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Icon name="Calculator" size={18} />
              <span className="hidden sm:inline">Калькулятор</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Icon name="LineChart" size={18} />
              <span className="hidden sm:inline">График платежей</span>
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center gap-2">
              <Icon name="FileText" size={18} />
              <span className="hidden sm:inline">Договор</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="animate-slide-up">
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
                      onValueChange={(value) => setLoanAmount(value[0])}
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
                      onValueChange={(value) => setLoanDays(value[0])}
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
                    <p className="text-2xl font-bold text-secondary">{loan.totalInterest.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <Icon name="Coins" className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="text-sm text-muted-foreground mb-1">К возврату</p>
                    <p className="text-2xl font-bold text-green-600">{loan.totalAmount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <Icon name="Info" className="inline mr-2" size={16} />
                    Ежедневный платёж: <span className="font-bold">{loan.dailyPayment.toLocaleString('ru-RU')} ₽</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="animate-slide-up">
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
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-muted-foreground mb-1">Сумма займа</p>
                    <p className="text-xl font-bold text-primary">{loanAmount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-muted-foreground mb-1">Общая сумма</p>
                    <p className="text-xl font-bold text-green-600">{loan.totalAmount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-muted-foreground mb-1">Проценты</p>
                    <p className="text-xl font-bold text-purple-600">{loan.totalInterest.toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg border border-orange-200">
                    <p className="text-xs text-muted-foreground mb-1">Срок</p>
                    <p className="text-xl font-bold text-orange-600">{loanDays} дней</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="max-h-[500px] overflow-y-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white">
                        <tr>
                          <th className="p-3 text-left font-semibold">День</th>
                          <th className="p-3 text-right font-semibold">Платёж</th>
                          <th className="p-3 text-right font-semibold">Основной долг</th>
                          <th className="p-3 text-right font-semibold">Проценты</th>
                          <th className="p-3 text-right font-semibold">Остаток</th>
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
                            <td className="p-3 font-medium">{item.day}</td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {item.payment.toLocaleString('ru-RU')} ₽
                            </td>
                            <td className="p-3 text-right">{item.principal.toLocaleString('ru-RU')} ₽</td>
                            <td className="p-3 text-right text-orange-600">
                              {item.interest.toLocaleString('ru-RU')} ₽
                            </td>
                            <td className="p-3 text-right font-medium">
                              {item.balance.toLocaleString('ru-RU')} ₽
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contract" className="animate-slide-up">
            <Card className="shadow-lg border-2 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="FileText" size={28} />
                  Оформление договора займа
                </CardTitle>
                <CardDescription className="text-blue-50">
                  Заполните данные для формирования договора
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">
                      ФИО полностью
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Иванов Иван Иванович"
                      value={contractData.fullName}
                      onChange={(e) => setContractData({ ...contractData, fullName: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-base font-semibold">
                      Дата рождения
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={contractData.birthDate}
                      onChange={(e) => setContractData({ ...contractData, birthDate: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passportSeries" className="text-base font-semibold">
                        Серия паспорта
                      </Label>
                      <Input
                        id="passportSeries"
                        placeholder="1234"
                        maxLength={4}
                        value={contractData.passportSeries}
                        onChange={(e) => setContractData({ ...contractData, passportSeries: e.target.value })}
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passportNumber" className="text-base font-semibold">
                        Номер паспорта
                      </Label>
                      <Input
                        id="passportNumber"
                        placeholder="567890"
                        maxLength={6}
                        value={contractData.passportNumber}
                        onChange={(e) => setContractData({ ...contractData, passportNumber: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-primary/20 space-y-3">
                  <h3 className="font-bold text-lg text-primary mb-4">Параметры займа</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Сумма займа:</p>
                      <p className="font-bold text-lg">{loanAmount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Срок:</p>
                      <p className="font-bold text-lg">{loanDays} дней</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Процентная ставка:</p>
                      <p className="font-bold text-lg">2% в день</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">К возврату:</p>
                      <p className="font-bold text-lg text-green-600">{loan.totalAmount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleGenerateContract}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base py-6"
                  >
                    <Icon name="FileCheck" className="mr-2" size={20} />
                    Сформировать договор
                  </Button>
                  <Button
                    onClick={downloadContract}
                    variant="outline"
                    className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white text-base py-6"
                  >
                    <Icon name="Download" className="mr-2" size={20} />
                    Скачать договор
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <Icon name="AlertCircle" className="inline mr-2" size={16} />
                    Перед скачиванием убедитесь, что все данные заполнены корректно
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 МикроФинанс. Современные решения для быстрых займов</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
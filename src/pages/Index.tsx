import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  address: string;
  phone: string;
  loanAmount: number;
  loanDays: number;
  totalAmount: number;
  contractDate: string;
}

const Index = () => {
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanDays, setLoanDays] = useState<number>(30);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  const [contractData, setContractData] = useState<ContractData>({
    fullName: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    address: '',
    phone: '',
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

  const downloadContract = async () => {
    if (!contractData.fullName || !contractData.birthDate || !contractData.passportSeries || !contractData.passportNumber || !contractData.address || !contractData.phone) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const contractNumber = `${loanAmount}-${Date.now().toString().slice(-6)}`;
    const returnDate = new Date(contractData.contractDate);
    returnDate.setDate(returnDate.getDate() + loanDays);
    const returnDateStr = returnDate.toLocaleDateString('ru-RU');
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 5;
      let y = margin;

      const addText = (text: string, size: number = 10, align: 'left' | 'center' | 'right' = 'left') => {
        pdf.setFontSize(size);
        
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          
          if (align === 'center') {
            pdf.text(line, pageWidth / 2, y, { align: 'center' });
          } else if (align === 'right') {
            pdf.text(line, pageWidth - margin, y, { align: 'right' });
          } else {
            pdf.text(line, margin, y);
          }
          y += lineHeight;
        });
      };

      const addLine = () => {
        pdf.line(margin, y, pageWidth - margin, y);
        y += lineHeight;
      };

      pdf.setFont('helvetica', 'bold');
      addText('ДОГОВОР ЗАЙМА №' + contractNumber, 14, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 5;
      pdf.text('г. Москва', margin, y);
      pdf.text(contractData.contractDate, pageWidth - margin, y, { align: 'right' });
      y += 10;
      addLine();
      y += 3;

      addText('Общество с ограниченной ответственностью "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР", именуемое в дальнейшем "ЗАЙМОДАВЕЦ", в лице Директора ________________________, действующего на основании Устава, с одной стороны, и');
      y += 2;
      addText(contractData.fullName + ', именуемый(ая) в дальнейшем "ЗАЕМЩИК", с другой стороны, вместе именуемые "СТОРОНЫ", заключили настоящий Договор о нижеследующем:');
      y += 5;

      pdf.setFont('helvetica', 'bold');
      addText('ПРЕДМЕТ ДОГОВОРА', 12, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 3;

      addText('1. Займодавец передает в собственность Заемщику денежные средства в размере ' + loanAmount.toLocaleString('ru-RU') + ' (' + numberToWords(loanAmount) + ') рублей, а Заемщик обязуется вернуть указанную сумму с процентами в установленный настоящим Договором срок.');
      y += 2;

      addText('2. Настоящий договор займа НЕ является беспроцентным. Процентная ставка составляет 2% (два процента) в день.');
      y += 2;

      addText('3. В момент получения от Займодавца денежных средств Заемщик обязан написать Займодавцу расписку в их получении.');
      y += 2;

      addText('4. Заемщик обязан вернуть всю сумму займа, указанную в п. 1 настоящего договора, вместе с начисленными процентами не позднее "' + returnDateStr + '" г.');
      y += 2;

      addText('5. По желанию Заемщика сумма займа может быть возвращена досрочно либо возвращаться частями, но не позднее срока, указанного в п. 4 настоящего договора.');
      y += 2;

      addText('6. В случае нарушения Заемщиком срока возврата суммы займа, указанного в п. 4 настоящего договора, он обязан уплатить Займодавцу неустойку (пени) в размере 0,1% от всей суммы займа за каждый день просрочки. Неустойка начисляется до момента возврата всей суммы займа, но не может составлять более 100% суммы займа.');
      y += 2;

      addText('7. Настоящий договор считается заключенным с момента фактической передачи Займодавцем Заемщику суммы займа.');
      y += 2;

      addText('8. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному экземпляру для каждой из сторон.');
      y += 5;

      pdf.setFont('helvetica', 'bold');
      addText('ПАРАМЕТРЫ ЗАЙМА', 12, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 3;

      addText('Сумма займа: ' + loanAmount.toLocaleString('ru-RU') + ' рублей');
      addText('Срок займа: ' + loanDays + ' календарных дней');
      addText('Процентная ставка: 2% (два процента) в день');
      addText('Сумма процентов: ' + loan.totalInterest.toLocaleString('ru-RU') + ' рублей');
      pdf.setFont('helvetica', 'bold');
      addText('ОБЩАЯ СУММА К ВОЗВРАТУ: ' + contractData.totalAmount.toLocaleString('ru-RU') + ' рублей', 11);
      pdf.setFont('helvetica', 'normal');
      addText('Ежедневный платёж: ' + loan.dailyPayment.toLocaleString('ru-RU') + ' рублей');
      addText('Дата выдачи займа: ' + contractData.contractDate);
      addText('Дата возврата займа: ' + returnDateStr);
      y += 5;

      pdf.setFont('helvetica', 'bold');
      addText('РЕКВИЗИТЫ ДЛЯ ВОЗВРАТА ЗАЙМА', 12, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 3;

      addText('Заемщик обязуется производить возврат займа и уплату процентов одним из следующих способов:');
      y += 2;
      pdf.setFont('helvetica', 'bold');
      addText('1. ПЕРЕВОД НА БАНКОВСКУЮ КАРТУ:');
      pdf.setFont('helvetica', 'normal');
      addText('   Номер карты: 2200 9802 0524 3667');
      addText('   Банк: Фора Банк');
      addText('   Получатель: ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"');
      y += 2;
      pdf.setFont('helvetica', 'bold');
      addText('2. ПЕРЕВОД ПО СИСТЕМЕ БЫСТРЫХ ПЛАТЕЖЕЙ (СБП):');
      pdf.setFont('helvetica', 'normal');
      addText('   Номер телефона: +7 (958) 684-12-76');
      addText('   Банк: Фора Банк');
      addText('   Получатель: ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"');
      y += 2;
      pdf.setFont('helvetica', 'bold');
      addText('ВАЖНО: При оплате в назначении платежа обязательно указывать:');
      pdf.setFont('helvetica', 'normal');
      addText('"Возврат займа по договору №' + contractNumber + ', ' + contractData.fullName + '"');
      y += 5;

      pdf.setFont('helvetica', 'bold');
      addText('ПОЛНЫЕ ДАННЫЕ ЗАЕМЩИКА', 12, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 3;

      addText('ФИО: ' + contractData.fullName);
      addText('Дата рождения: ' + contractData.birthDate);
      addText('Паспорт: серия ' + contractData.passportSeries + ', номер ' + contractData.passportNumber);
      addText('Адрес проживания: ' + contractData.address);
      addText('Контактный телефон: ' + contractData.phone);
      y += 5;

      addText('Заемщик ' + contractData.fullName + ' подтверждает получение суммы займа в размере ' + loanAmount.toLocaleString('ru-RU') + ' рублей и обязуется вернуть указанную сумму с процентами в размере ' + contractData.totalAmount.toLocaleString('ru-RU') + ' рублей в установленный срок до ' + returnDateStr + ' на указанные выше реквизиты.');
      y += 5;

      pdf.setFont('helvetica', 'bold');
      addText('ПОДПИСИ СТОРОН:', 12, 'center');
      pdf.setFont('helvetica', 'normal');
      y += 5;

      pdf.text('Займодавец', margin, y);
      pdf.text('___________________', pageWidth - margin - 50, y);
      y += lineHeight;
      pdf.setFontSize(9);
      pdf.text('(ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР")', margin, y);
      pdf.text('(подпись)', pageWidth - margin - 50, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.text('Заемщик', margin, y);
      pdf.text('___________________', pageWidth - margin - 50, y);
      y += lineHeight;
      pdf.setFontSize(9);
      pdf.text('(' + contractData.fullName + ')', margin, y);
      pdf.text('(подпись)', pageWidth - margin - 50, y);
      y += 5;

      pdf.setFontSize(10);
      addText('Дата: ' + contractData.contractDate, 10, 'center');

      const fileName = `Договор_займа_${contractNumber}_${contractData.fullName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      alert('Ошибка при создании договора. Попробуйте ещё раз.');
    }
  };

  const downloadContractOld = () => {
    const contractNumber = Math.floor(Math.random() * 10000);
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + loanDays);
    const returnDateStr = returnDate.toLocaleDateString('ru-RU');
    
    const contractText = `
                                ДОГОВОР ЗАЙМА N ${contractNumber}

________________________________________________________________________________
                Москва, ${contractData.contractDate}

Мы, представитель ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР", действующий на основании Устава,
именуемый в дальнейшем "Займодавец", 

и гр. ${contractData.fullName},
паспорт: серия ${contractData.passportSeries}, N ${contractData.passportNumber},
проживающий(ая) по адресу: ${contractData.address},
именуемый(ая) в дальнейшем "Заемщик", 

заключили настоящий договор о нижеследующем:

    1. Займодавец передает Заемщику в собственность денежные средства в размере
${loanAmount.toLocaleString('ru-RU')} (${numberToWords(loanAmount)}) рублей
на указанный в настоящем договоре срок, а Заемщик обязуется
возвратить указанную сумму в обусловленный срок.

    2. Настоящий договор займа НЕ является беспроцентным.
Процентная ставка составляет 2% (два процента) в день.

    3. В момент получения от Займодавца денежных средств Заемщик обязан написать
Займодавцу расписку в их получении.

    4. Заемщик обязан вернуть всю сумму займа, указанную в п. 1 настоящего договора,
вместе с начисленными процентами не позднее "${returnDateStr}" г.

    5. По желанию Заемщика сумма займа может быть возвращена досрочно либо
возвращаться частями, но не позднее срока, указанного в п. 4 настоящего договора.

    6. В случае нарушения Заемщиком срока возврата суммы займа, указанного в п. 4
настоящего договора, он обязан уплатить Займодавцу неустойку (пени) в размере 0,1% от
всей суммы займа за каждый день просрочки. Неустойка начисляется до момента возврата
всей суммы займа, но не может составлять более 100% суммы займа.

    7. Настоящий договор считается заключенным с момента фактической передачи
Займодавцем Заемщику суммы займа.

    8. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу,
по одному экземпляру для каждой из сторон.


                        ПОДПИСИ СТОРОН:

Займодавец                    ___________________
   (ООО "ЭКОРРА                   (подпись)
ФИНАНСОВЫЙ ЦЕНТР")

Заемщик                       ___________________
                                  (подпись)


________________________________________________________________________________

                    РЕКВИЗИТЫ ЗАЙМОДАВЦА 

Полное наименование: Общество с ограниченной ответственностью 
                     "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"
Сокращенное наименование: ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"

ИНН: _______________________
КПП: _______________________
ОГРН: ______________________

Юридический адрес: _________________________________________________________

Фактический адрес: _________________________________________________________

Банковские реквизиты:
Расчетный счет: ____________________________________________________________
Наименование банка: ________________________________________________________
БИК: ___________________________
Корр. счет: ____________________________

Контактный телефон: ________________________________________________________
E-mail: ____________________________________________________________________

Директор ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР": ___________________  _______________
                                            (подпись)          (Ф.И.О.)

М.П.

________________________________________________________________________________

                         ПОЛНЫЕ ДАННЫЕ ЗАЕМЩИКА

ФИО: ${contractData.fullName}
Дата рождения: ${contractData.birthDate}
Паспорт: серия ${contractData.passportSeries}, номер ${contractData.passportNumber}

Адрес регистрации/проживания: ${contractData.address}

Контактный телефон: ${contractData.phone}

________________________________________________________________________________

                         ПАРАМЕТРЫ ЗАЙМА

Сумма займа:                  ${loanAmount.toLocaleString('ru-RU')} рублей
Срок займа:                   ${loanDays} календарных дней
Процентная ставка:            2% (два процента) в день
Сумма процентов:              ${loan.totalInterest.toLocaleString('ru-RU')} рублей
ОБЩАЯ СУММА К ВОЗВРАТУ:       ${contractData.totalAmount.toLocaleString('ru-RU')} рублей
Ежедневный платёж:            ${loan.dailyPayment.toLocaleString('ru-RU')} рублей

Дата выдачи займа:            ${contractData.contractDate}
Дата возврата займа:          ${returnDateStr}

________________________________________________________________________________

                    РЕКВИЗИТЫ ДЛЯ ВОЗВРАТА ЗАЙМА

Заемщик обязуется производить возврат займа и уплату процентов одним из 
следующих способов:

1. ПЕРЕВОД НА БАНКОВСКУЮ КАРТУ:
   Номер карты: 2200 9802 0524 3667
   Банк: Фора Банк
   Получатель: ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"

2. ПЕРЕВОД ПО СИСТЕМЕ БЫСТРЫХ ПЛАТЕЖЕЙ (СБП):
   Номер телефона: +7 (958) 684-12-76
   Банк: Фора Банк
   Получатель: ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"

ВАЖНО: При оплате в назначении платежа обязательно указывать:
"Возврат займа по договору №${contractNumber}, ${contractData.fullName}"

________________________________________________________________________________

Заемщик ${contractData.fullName} подтверждает получение суммы займа 
в размере ${loanAmount.toLocaleString('ru-RU')} рублей и обязуется вернуть 
указанную сумму с процентами в размере ${contractData.totalAmount.toLocaleString('ru-RU')} рублей
в установленный срок до ${returnDateStr} на указанные выше реквизиты.

Заемщик ознакомлен с реквизитами для оплаты и обязуется производить платежи 
своевременно согласно графику платежей.

Подпись Заемщика: ___________________  Дата: ${contractData.contractDate}


                           С условиями договора ознакомлен(а) и согласен(на)
                           
                           Заемщик: ___________________ ${contractData.fullName}
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

  const downloadPaymentSchedule = async () => {
    if (!scheduleRef.current) return;

    try {
      const element = scheduleRef.current;
      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      const originalMaxHeight = element.style.maxHeight;
      
      element.style.overflow = 'visible';
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        scrollX: 0,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pdfWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - 2 * margin);

      while (heightLeft > 0) {
        position = -(pdfHeight - margin) + (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - 2 * margin);
      }

      const fileName = `График_платежей_${loanAmount}_руб_${loanDays}_дней.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      alert('Ошибка при создании файла. Попробуйте ещё раз.');
    }
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

                  <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Всего платежей</p>
                      <p className="text-lg font-bold">{loanDays}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Общая сумма выплат</p>
                      <p className="text-lg font-bold text-green-600">{loan.totalAmount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Переплата</p>
                      <p className="text-lg font-bold text-orange-600">{loan.totalInterest.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
                    <p>© 2024 ООО "ЭКОРРА ФИНАНСОВЫЙ ЦЕНТР"</p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={downloadPaymentSchedule}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base py-6"
                  >
                    <Icon name="Download" className="mr-2" size={20} />
                    Скачать график платежей (PDF)
                  </Button>
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

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base font-semibold">
                      Адрес проживания
                    </Label>
                    <Input
                      id="address"
                      placeholder="г. Москва, ул. Ленина, д. 1, кв. 1"
                      value={contractData.address}
                      onChange={(e) => setContractData({ ...contractData, address: e.target.value })}
                      className="text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold">
                      Контактный телефон
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+7 (999) 123-45-67"
                      value={contractData.phone}
                      onChange={(e) => setContractData({ ...contractData, phone: e.target.value })}
                      className="text-base"
                    />
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
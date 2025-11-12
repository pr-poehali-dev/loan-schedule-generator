import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface ContractFormProps {
  contractData: ContractData;
  loanAmount: number;
  loanDays: number;
  totalAmount: number;
  onContractDataChange: (data: ContractData) => void;
  onGenerateContract: () => void;
  onDownloadContract: () => void;
}

const ContractForm = ({
  contractData,
  loanAmount,
  loanDays,
  totalAmount,
  onContractDataChange,
  onGenerateContract,
  onDownloadContract
}: ContractFormProps) => {
  return (
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
              onChange={(e) => onContractDataChange({ ...contractData, fullName: e.target.value })}
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
              onChange={(e) => onContractDataChange({ ...contractData, birthDate: e.target.value })}
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
                onChange={(e) => onContractDataChange({ ...contractData, passportSeries: e.target.value })}
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
                onChange={(e) => onContractDataChange({ ...contractData, passportNumber: e.target.value })}
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
              onChange={(e) => onContractDataChange({ ...contractData, address: e.target.value })}
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
              onChange={(e) => onContractDataChange({ ...contractData, phone: e.target.value })}
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
              <p className="font-bold text-lg text-green-600">{totalAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onGenerateContract}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base py-6"
          >
            <Icon name="FileCheck" className="mr-2" size={20} />
            Сформировать договор
          </Button>
          <Button
            onClick={onDownloadContract}
            variant="outline"
            className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white text-base py-6"
          >
            <Icon name="Download" className="mr-2" size={20} />
            Скачать договор
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractForm;

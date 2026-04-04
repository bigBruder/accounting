const MONO_API_URL = 'https://api.monobank.ua';

export interface MonoTransaction {
  id: string;
  time: number;
  description: string;
  mcc: number;
  originalMcc: number;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  hold: boolean;
  receiptId?: string;
}

export interface MonoAccount {
  id: string;
  sendId: string;
  balance: number;
  creditLimit: number;
  type: string;
  currencyCode: number;
  cashbackType: string;
  maskedPan: string[];
  iban: string;
}

export interface MonoClientInfo {
  clientId: string;
  name: string;
  webHookUrl: string;
  permissions: string;
  accounts: MonoAccount[];
}

// Mapping of MCC codes to local categories
const MCC_MAPPING: Record<number, string> = {
  5411: 'Продукти',
  5499: 'Продукти',
  5811: 'Кафе та ресторани',
  5812: 'Кафе та ресторани',
  5813: 'Кафе та ресторани',
  5814: 'Фастфуд',
  4111: 'Транспорт',
  4121: 'Таксі',
  5541: 'Авто',
  5542: 'Авто',
  5912: 'Здоров\'я',
  8099: 'Здоров\'я',
  6011: 'Готівка',
  4814: 'Комуналка та зв\'язок',
  4816: 'Комуналка та зв\'язок',
  4900: 'Комуналка та зв\'язок',
  5977: 'Краса та догляд',
  7230: 'Краса та догляд',
  7997: 'Спорт',
  5732: 'Техніка',
  5200: 'Житло та ремонт',
  5211: 'Житло та ремонт',
};

export const MonobankService = {
  /**
   * Fetches the client information (accounts, name, etc.)
   */
  async getClientInfo(token: string): Promise<MonoClientInfo> {
    const response = await fetch(`${MONO_API_URL}/personal/client-info`, {
      headers: { 'X-Token': token }
    });
    
    if (!response.ok) {
      throw new Error(`Monobank API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Fetches transactions for a specific account and period
   */
  async getStatement(token: string, accountId: string, from: number, to?: number): Promise<MonoTransaction[]> {
    const toTimestamp = to || Math.floor(Date.now() / 1000);
    const response = await fetch(`${MONO_API_URL}/personal/statement/${accountId}/${from}/${toTimestamp}`, {
      headers: { 'X-Token': token }
    });
    
    if (response.status === 429) {
      throw new Error('Занадто багато запитів. Спробуйте через хвилину.');
    }
    
    if (!response.ok) {
      throw new Error(`Monobank API Error: ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Maps Monobank MCC to application category name
   */
  mapMccToCategory(mcc: number): string {
    return MCC_MAPPING[mcc] || 'Інше';
  }
};

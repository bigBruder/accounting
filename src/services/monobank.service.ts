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

// Mapping of MCC codes to local category IDs (based on DEFAULT_CATEGORIES)
const MCC_MAPPING: Record<number, string> = {
  // Food & Groceries
  5411: 'food', // Grocery Stores, Supermarkets
  5422: 'food', // Freezer and Locker Meat Provisioners
  5441: 'food', // Candy, Nut, and Confectionery Stores
  5451: 'food', // Dairy Products Stores
  5462: 'food', // Bakeries
  5499: 'food', // Miscellaneous Food Stores
  5811: 'food', // Caterers
  5812: 'food', // Eating Places and Restaurants
  5813: 'food', // Drinking Places (Alcoholic Beverages)
  5814: 'food', // Fast Food Restaurants
  
  // Transport & Auto
  4111: 'transport', // Local and Suburban Commuter Passenger Transportation
  4121: 'transport', // Taxicabs and Limousines
  4131: 'transport', // Bus Lines
  4789: 'transport', // Transportation Services, Not Elsewhere Classified
  5541: 'transport', // Service Stations
  5542: 'transport', // Automated Fuel Dispensers
  
  // Shopping
  5311: 'shopping', // Department Stores
  5611: 'shopping', // Men's and Boys' Clothing
  5621: 'shopping', // Women's Ready-to-Wear Stores
  5631: 'shopping', // Women's Accessory and Specialty Shops
  5651: 'shopping', // Family Clothing Stores
  5661: 'shopping', // Shoe Stores
  5691: 'shopping', // Men's and Women's Clothing Stores
  5732: 'shopping', // Electronics Stores
  5912: 'shopping', // Drug Stores and Pharmacies (often health, but generalized)
  5941: 'shopping', // Sporting Goods Stores
  5942: 'shopping', // Book Stores
  5945: 'shopping', // Hobby, Toy, and Game Shops
  5977: 'shopping', // Cosmetic Stores
  
  // Health
  8011: 'health', // Doctors and Physicians
  8021: 'health', // Dentists and Orthodontists
  8099: 'health', // Medical Services and Health Practitioners
  
  // Utilities & Communication
  4812: 'utilities', // Telecommunications Equipment
  4814: 'utilities', // Telecommunication Services
  4900: 'utilities', // Utilities—Electric, Gas, Heating, Water, Sanitary
  
  // Housing & Repair
  5200: 'housing', // Home Supply Warehouse Stores
  5211: 'housing', // Lumber and Building Materials Stores
  
  // Entertainment
  7997: 'entertainment', // Membership Clubs (Sports, Recreation, Athletic)
  7832: 'entertainment', // Motion Picture Theaters
  7991: 'entertainment', // Tourist Attractions and Exhibits
};

// Common keywords for better matching
const KEYWORD_MAPPING: Record<string, string> = {
  'атб': 'food',
  'сільпо': 'food',
  'фора': 'food',
  'ашан': 'food',
  'metro': 'food',
  'варрус': 'food',
  'glovo': 'food',
  'bolt food': 'food',
  'сирне королівство': 'food',
  'mcdonalds': 'food',
  
  'bolt': 'transport',
  'uklon': 'transport',
  'uber': 'transport',
  'wog': 'transport',
  'okko': 'transport',
  'socar': 'transport',
  'glusco': 'transport',
  
  'аптека': 'health',
  'itunes': 'entertainment',
  'netflix': 'entertainment',
  'spotify': 'entertainment',
  'steam': 'entertainment',
  'playstation': 'entertainment',
  
  'epicentr': 'housing',
  'еріцентр': 'housing',
  'leroy merlin': 'housing',
  
  'eva': 'shopping',
  'watsons': 'shopping',
  'rozetka': 'shopping',
  'allo': 'shopping',
  'citrus': 'shopping',
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
   * Maps Monobank transaction to application category ID
   */
  mapToCategoryId(mcc: number, description: string): string {
    // 1. Try MCC mapping first
    if (MCC_MAPPING[mcc]) {
      return MCC_MAPPING[mcc];
    }

    // 2. Try keyword mapping in description
    const lowerDesc = description.toLowerCase();
    for (const [keyword, categoryId] of Object.entries(KEYWORD_MAPPING)) {
      if (lowerDesc.includes(keyword)) {
        return categoryId;
      }
    }

    // 3. Fallback
    return 'other-expense';
  }
};

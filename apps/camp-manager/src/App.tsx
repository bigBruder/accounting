import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Download, 
  PlusCircle, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  FileText,
  Search,
  CheckCircle,
  Clock,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Tent,
  AlertTriangle,
  ChevronDown,
  Utensils,
  Truck,
  Mountain,
  Stethoscope,
  CircleDollarSign,
  Heart,
  Key,
  LayoutGrid,
  LogOut,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { db } from './services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  query, 
  orderBy, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';

// Auth Config
const APP_PASSWORD = 'panorama'; // Secure application password

// Types
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: Date;
  category: string;
  party: string;
}

const CATEGORIES = [
  // Expense
  { id: 'food', label: 'Харчування', icon: Utensils, color: '#f87171', type: 'expense' },
  { id: 'logistics', label: 'Логістика', icon: Truck, color: '#60a5fa', type: 'expense' },
  { id: 'equipment', label: 'Спорядження', icon: Mountain, color: '#4ade80', type: 'expense' },
  { id: 'medical', label: 'Медикаменти', icon: Stethoscope, color: '#fbbf24', type: 'expense' },
  { id: 'rent', label: 'Оренда', icon: Key, color: '#94a3b8', type: 'expense' },
  { id: 'other_exp', label: 'Інші витрати', icon: LayoutGrid, color: '#cbd5e1', type: 'expense' },
  // Income
  { id: 'reg_fees', label: 'Реєстраційні внески', icon: CircleDollarSign, color: '#10b981', type: 'income' },
  { id: 'donations', label: 'Донати / Пожертви', icon: Heart, color: '#f472b6', type: 'income' },
  { id: 'grants', label: 'Зовнішня допомога', icon: ArrowDownLeft, color: '#818cf8', type: 'income' },
  { id: 'other_inc', label: 'Інший прихід', icon: LayoutGrid, color: '#94a3b8', type: 'income' },
];

const DatePicker: React.FC<{ value: Date; onChange: (date: Date) => void }> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const days = [];
  const startOffset = (startDayOfMonth(viewDate) + 6) % 7; // Adjust for Monday start
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(viewDate); i++) days.push(i);

  return (
    <div className="date-picker-wrapper" ref={containerRef}>
      <button type="button" className="date-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Clock size={18} className="text-secondary" />
        <span>{format(value, 'dd MMMM yyyy', { locale: uk })}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="date-dropdown glass-premium animate-in">
          <div className="calendar-controls">
            <button type="button" onClick={handlePrevMonth} className="ctrl-btn"><ArrowDownLeft size={16} style={{transform: 'rotate(45deg)'}} /></button>
            <span className="month-name">{format(viewDate, 'LLLL yyyy', { locale: uk })}</span>
            <button type="button" onClick={handleNextMonth} className="ctrl-btn"><ArrowUpRight size={16} style={{transform: 'rotate(45deg)'}} /></button>
          </div>
          <div className="calendar-grid">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
            {days.map((day, idx) => (
              <div 
                key={idx}
                className={`calendar-day ${day === null ? 'empty' : ''} ${day && new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString() === value.toDateString() ? 'selected' : ''}`}
                onClick={() => {
                  if (day) {
                    onChange(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
                    setIsOpen(false);
                  }
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="quick-dates">
            <button type="button" className="quick-btn" onClick={() => { onChange(new Date()); setIsOpen(false); }}>Сьогодні</button>
            <button type="button" className="quick-btn" onClick={() => { 
              const d = new Date(); d.setDate(d.getDate() - 1); 
              onChange(d); setIsOpen(false); 
            }}>Вчора</button>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours in ms
  const [isAuthorized, setIsAuthorized] = useState(() => {
    const auth = sessionStorage.getItem('camp_auth') === 'true';
    const lastActivity = Number(sessionStorage.getItem('camp_last_activity') || 0);
    if (auth && Date.now() - lastActivity > SESSION_TIMEOUT) {
      sessionStorage.removeItem('camp_auth');
      return false;
    }
    return auth;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Update activity timestamp
  const updateActivity = () => {
    if (isAuthorized) {
      sessionStorage.setItem('camp_last_activity', Date.now().toString());
    }
  };

  // Real-time Firestore sync
  useEffect(() => {
    if (!isAuthorized) return;
    
    const q = query(collection(db, 'camp_transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date)
        } as Transaction;
      });
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      updateActivity();
      const interval = setInterval(() => {
        const lastActivity = Number(sessionStorage.getItem('camp_last_activity') || 0);
        if (Date.now() - lastActivity > SESSION_TIMEOUT) {
          handleLogout();
        }
      }, 60000); // Check every minute
      
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
      };
    }
  }, [isAuthorized]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [partyType, setPartyType] = useState<'person' | 'org'>('person');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const incomeCategories = CATEGORIES.filter(c => c.type === 'income');
  const expenseCategories = CATEGORIES.filter(c => c.type === 'expense');
  
  const [selectedCategory, setSelectedCategory] = useState(incomeCategories[0].label);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Sync category when type changes
  useEffect(() => {
    if (formType === 'income') setSelectedCategory(incomeCategories[0].label);
    else setSelectedCategory(expenseCategories[0].label);
  }, [formType]);
  
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthorized(true);
      sessionStorage.setItem('camp_auth', 'true');
      sessionStorage.setItem('camp_last_activity', Date.now().toString());
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem('camp_auth');
    sessionStorage.removeItem('camp_last_activity');
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filteredTransactions = useMemo(() => 
    transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(filter.toLowerCase()) || 
        t.category.toLowerCase().includes(filter.toLowerCase()) ||
        t.party.toLowerCase().includes(filter.toLowerCase());
      
      const matchesTab = viewFilter === 'all' || t.type === viewFilter;
      
      return matchesSearch && matchesTab;
    }).sort((a, b) => b.date.getTime() - a.date.getTime())
  , [transactions, filter, viewFilter]);

  const handleExportCSV = () => {
    const headers = ['№', 'Тип', 'Опис', 'Сума', 'Дата', 'Категорія', 'Сторона'];
    const rows = filteredTransactions.map((t, index) => [
      (index + 1).toString(),
      t.type === 'income' ? 'Дохід' : 'Витрата',
      t.description,
      t.amount.toString(),
      format(t.date, 'dd.MM.yyyy'),
      t.category,
      t.party
    ]);

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const filename = `camp_budget_${viewFilter}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const newTx = {
        type: formType as 'income' | 'expense',
        description: formData.get('description') as string,
        amount: Number(formData.get('amount')),
        date: Timestamp.fromDate(transactionDate),
        category: selectedCategory,
        party: formData.get('party') as string,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'camp_transactions'), newTx);
      setIsFormOpen(false);
      // Reset form if needed, but since it closes it's mostly for next open
    } catch (error) {
      console.error("Error adding transaction: ", error);
      alert("Помилка при збереженні. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'camp_transactions', deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      alert("Помилка при видаленні. Спробуйте ще раз.");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="camp-container">
        <div className="background-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        <div className="auth-gate-wrapper">
          <div className="auth-card glass-premium animate-in">
            <div className="logo-wrapper large">
              <Tent size={48} />
            </div>
            <h2>Вхід у CampManager</h2>
            <p className="auth-note">Будь ласка, введіть пароль для доступу до фінансів табору</p>
            
            <form onSubmit={handleAuth} className="auth-form">
              <div className={`input-wrapper-auth ${authError ? 'error' : ''}`}>
                <Key size={18} className="field-icon-auth" />
                <input 
                  type="password" 
                  placeholder="Пароль доступу"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>
              {authError && <p className="error-text">Невірний пароль, спробуйте ще раз.</p>}
              <button type="submit" className="btn-primary-gradient full shadow-glow-primary">
                <span>Увійти в систему</span>
                <ArrowUpRight size={18} />
              </button>
            </form>
          </div>
        </div>
        
        <style>{`
          .auth-gate-wrapper { height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; z-index: 100; padding: 1.5rem; }
          .auth-card { width: 100%; max-width: 440px; padding: 3.5rem 3rem; border-radius: 40px; text-align: center; }
          .logo-wrapper.large { width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; background: linear-gradient(135deg, var(--primary), #a855f7); border-radius: 28px; box-shadow: 0 15px 35px var(--primary-glow); color: white; }
          .auth-card h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.8rem; letter-spacing: -0.02em; }
          .auth-note { color: var(--secondary); margin-bottom: 2.5rem; font-size: 0.95rem; line-height: 1.5; }
          .auth-form { display: flex; flex-direction: column; gap: 1.5rem; }
          
          .input-wrapper-auth { position: relative; width: 100%; }
          .input-wrapper-auth input { 
            width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border); 
            padding: 1.2rem 1.4rem 1.2rem 3.4rem; border-radius: 15px; color: white; transition: all 0.3s; font-size: 1.1rem;
          }
          .field-icon-auth { position: absolute; left: 1.4rem; top: 50%; transform: translateY(-50%); color: var(--secondary); pointer-events: none; }
          
          .btn-primary-gradient.full { width: 100%; justify-content: center; padding: 1.2rem; font-size: 1rem; margin-top: 0.5rem; }
          .error-text { color: var(--danger); font-size: 0.85rem; font-weight: 600; margin-top: -0.5rem; text-align: left; padding-left: 0.5rem; }
          .input-wrapper-auth.error input { border-color: var(--danger); background: rgba(239, 68, 68, 0.05); }

          :root {
            --bg-dark: #0f172a;
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --secondary: #94a3b8;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --white: #f8fafc;
            --glass-border: rgba(255, 255, 255, 0.12);
          }
          .camp-container { min-height: 100vh; background: var(--bg-dark); color: var(--white); font-family: 'Inter', sans-serif; overflow: hidden; }
          .background-blobs { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
          .blob { position: absolute; width: 500px; height: 500px; filter: blur(120px); opacity: 0.15; border-radius: 50%; }
          .blob-1 { top: -100px; right: -100px; background: var(--primary); }
          .blob-2 { bottom: -100px; left: -100px; background: #a855f7; }
          .glass-premium { background: rgba(30, 41, 59, 0.45); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
          .btn-primary-gradient.full { 
            width: 100%; 
            justify-content: center; 
            padding: 1.4rem; 
            font-size: 1.15rem; 
            margin-top: 1.2rem; 
            letter-spacing: 0.03em;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: linear-gradient(135deg, #6366f1, #a855f7);
            color: white;
            font-weight: 800;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255,255,255,0.4);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .btn-primary-gradient.full:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 15px 40px rgba(168, 85, 247, 0.5), inset 0 1px 1px rgba(255,255,255,0.6);
            background: linear-gradient(135deg, #4f46e5, #9333ea);
          }
          .btn-primary-gradient.full:active {
            transform: translateY(-1px) scale(0.98);
          }
          .shadow-glow-primary {
            filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.3));
          }
          .animate-in { animation: authFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
          @keyframes authFadeIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="camp-container">
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <header className="app-header glass">
        <div className="brand">
          <div className="logo-wrapper">
            <Tent size={32} className="logo-icon" />
          </div>
          <div>
            <h1>CampManager <span className="version">PRO</span></h1>
            <p className="subtitle">Система фінансового обліку таборів</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-icon-label" onClick={handleExportCSV}>
            <Download size={18} />
            <span>Експорт звіту</span>
          </button>
          <button className="btn-logout-icon" onClick={handleLogout} title="Вийти">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="stats-section">
          <div className="stat-card glass-premium">
            <div className="stat-header">
              <div className="icon-box income">
                <ArrowDownLeft size={24} />
              </div>
              <span className="stat-label">Загальний прихід</span>
            </div>
            <div className="stat-value">{stats.income.toLocaleString()} ₴</div>
            <div className="stat-footer">Внески та донати</div>
          </div>

          <div className="stat-card glass-premium">
            <div className="stat-header">
              <div className="icon-box expense">
                <ArrowUpRight size={24} />
              </div>
              <span className="stat-label">Загальні витрати</span>
            </div>
            <div className="stat-value text-danger">-{stats.expense.toLocaleString()} ₴</div>
            <div className="stat-footer">Харчування, логістика тощо</div>
          </div>

          <div className="stat-card glass-premium main-balance">
            <div className="stat-header">
              <div className="icon-box balance">
                <CreditCard size={24} />
              </div>
              <span className="stat-label white">Поточний баланс</span>
            </div>
            <div className="stat-value large">{stats.balance.toLocaleString()} ₴</div>
            <div className="balance-progress">
              <div className="progress-bar" style={{ width: `${Math.min(100, (stats.income > 0 ? (stats.balance / stats.income) * 100 : 0))}%` }}></div>
            </div>
          </div>
        </section>

        <section className="main-content glass-flat">
          <div className="content-toolbar">
            <div className="filter-tabs-wrapper">
              <div className="tab-pill-container glass-flat">
                <button className={`tab-pill ${viewFilter === 'all' ? 'active' : ''}`} onClick={() => setViewFilter('all')}>Всі</button>
                <button className={`tab-pill ${viewFilter === 'income' ? 'active' : ''}`} onClick={() => setViewFilter('income')}>Прихід</button>
                <button className={`tab-pill ${viewFilter === 'expense' ? 'active' : ''}`} onClick={() => setViewFilter('expense')}>Витрати</button>
              </div>
            </div>

            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Пошук..." 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <button className="btn-primary-gradient shadow-glow" onClick={() => setIsFormOpen(true)}>
              <PlusCircle size={20} />
              <span>Додати запис</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Транзакція</th>
                  <th>Категорія</th>
                  <th>Контрагент</th>
                  <th className="text-right">Сума</th>
                  <th className="text-right">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, index) => {
                  const cat = CATEGORIES.find(c => c.label === t.category) || CATEGORIES[7];
                  const Icon = cat.icon;
                  return (
                    <tr key={t.id} className="row-animate">
                      <td className="col-num">
                        <span className="row-number">{(index + 1).toString().padStart(2, '0')}</span>
                      </td>
                      <td className="col-date">
                        <div className="date-badge">
                          <span className="day">{format(t.date, 'dd')}</span>
                          <span className="month">{format(t.date, 'MMM', { locale: uk })}</span>
                        </div>
                      </td>
                      <td className="col-info">
                        <div className="tx-desc">{t.description}</div>
                      </td>
                      <td>
                        <div className="badge-pill">
                          <Icon size={14} style={{ color: cat.color }} />
                          <span>{t.category}</span>
                        </div>
                      </td>
                      <td className="col-party">
                        <div className="party-wrapper">
                          <User size={14} />
                          <span>{t.party}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className={`tx-amount ${t.type}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ₴
                        </div>
                      </td>
                      <td className="text-right">
                        <button 
                          className="btn-delete-row" 
                          onClick={() => handleDeleteTransaction(t.id)}
                          title="Видалити запис"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isFormOpen && (
        <div className="modal-root">
          <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}></div>
          <div className="modal-box glass-premium animate-in">
            <header className="modal-header">
              <h3>Нова операція</h3>
              <button className="btn-close" onClick={() => setIsFormOpen(false)}>
                <X size={20} />
              </button>
            </header>
            
            <form onSubmit={addTransaction} className="tx-form">
              <div className="type-toggle-container">
                <div className={`sliding-pill ${formType}`}></div>
                <button 
                  type="button" 
                  className={`toggle-btn ${formType === 'income' ? 'active' : ''}`}
                  onClick={() => setFormType('income')}
                >
                  <TrendingUp size={18} /> Прихід
                </button>
                <button 
                  type="button" 
                  className={`toggle-btn ${formType === 'expense' ? 'active' : ''}`}
                  onClick={() => setFormType('expense')}
                >
                  <TrendingDown size={18} /> Витрата
                </button>
              </div>

              <div className="form-grid">
                <div className="form-field full">
                  <label>Опис операції</label>
                  <div className="input-wrapper">
                    <input type="text" name="description" required placeholder="Наприклад: Закупівля карематів" />
                  </div>
                </div>

                <div className="form-field">
                  <label>Сума (₴)</label>
                  <div className="input-wrapper">
                    <input type="number" name="amount" required placeholder="0.00" min="1" step="0.01" />
                  </div>
                </div>

                <div className="form-field">
                  <label>Дата операції</label>
                  <DatePicker value={transactionDate} onChange={setTransactionDate} />
                </div>

                <div className="form-field" ref={categoryRef}>
                  <label>Категорія</label>
                  <div className="custom-select-wrapper">
                    <button 
                      type="button" 
                      className="custom-select-trigger"
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      {(() => {
                        const cat = CATEGORIES.find(c => c.label === selectedCategory) || CATEGORIES[7];
                        const Icon = cat.icon;
                        return (
                          <>
                            <Icon size={18} style={{ color: cat.color }} />
                            <span>{selectedCategory}</span>
                          </>
                        );
                      })()}
                      <ChevronDown size={16} className={`chevron ${isCategoryOpen ? 'open' : ''}`} />
                    </button>
                    {isCategoryOpen && (
                      <div className="custom-select-options glass-premium">
                        {CATEGORIES.filter(c => c.type === formType).map(cat => (
                          <div 
                            key={cat.id} 
                            className={`select-option ${selectedCategory === cat.label ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedCategory(cat.label);
                              setIsCategoryOpen(false);
                            }}
                          >
                            <cat.icon size={18} style={{ color: cat.color }} />
                            <span>{cat.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field">
                  <label>{formType === 'income' ? 'Джерело коштів' : 'Отримувач платежу'}</label>
                  {formType === 'income' ? (
                    <div className="input-wrapper">
                      <User size={16} className="field-icon" />
                      <input 
                        type="text" 
                        name="party" 
                        required 
                        placeholder="ПІБ особи або назва організації" 
                      />
                    </div>
                  ) : (
                    <div className="party-selector-container glass-flat">
                      <div className="party-type-tabs">
                        <button 
                          type="button" 
                          className={`type-tab ${partyType === 'person' ? 'active' : ''}`}
                          onClick={() => setPartyType('person')}
                        >
                          Приватна особа
                        </button>
                        <button 
                          type="button" 
                          className={`type-tab ${partyType === 'org' ? 'active' : ''}`}
                          onClick={() => setPartyType('org')}
                        >
                          Магазин / Заклад
                        </button>
                      </div>
                      <div className="input-wrapper">
                        {partyType === 'person' ? <User size={16} className="field-icon" /> : <Truck size={16} className="field-icon" />}
                        <input 
                          type="text" 
                          name="party" 
                          required 
                          placeholder={partyType === 'person' ? "ПІБ отримувача" : "Назва магазину (н-р: Епіцентр)"} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <footer className="form-actions">
                <button type="button" className="btn-secondary-flat" onClick={() => setIsFormOpen(false)}>Скасувати</button>
                <button type="submit" className={`btn-submit-gradient ${formType}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Збереження...' : 'Зберегти транзакцію'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-root">
          <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}></div>
          <div className="modal-box glass-premium confirm-modal animate-in">
            <div className="confirm-icon-wrapper">
              <AlertTriangle size={40} className="text-danger" />
            </div>
            <h3>Видалити запис?</h3>
            <p>Ви впевнені, що хочете видалити цю операцію? Цю дію неможливо буде скасувати.</p>
            <div className="confirm-actions">
              <button className="btn-secondary-flat" onClick={() => setDeleteConfirmId(null)}>Скасувати</button>
              <button className="btn-danger-gradient" onClick={confirmDelete}>Так, видалити</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --bg-dark: #0f172a;
          --primary: #6366f1;
          --primary-glow: rgba(99, 102, 241, 0.4);
          --secondary: #94a3b8;
          --success: #10b981;
          --danger: #ef4444;
          --warning: #f59e0b;
          --white: #f8fafc;
          --glass-bg: rgba(30, 41, 59, 0.7);
          --glass-border: rgba(255, 255, 255, 0.08);
          --card-radius: 24px;
        }

        .camp-container {
          min-height: 100vh;
          width: 100%;
          background-color: var(--bg-dark);
          color: var(--white);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow-x: hidden;
        }

        .background-blobs { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
        .blob { position: absolute; width: 600px; height: 600px; background: linear-gradient(135deg, var(--primary), #a855f7); filter: blur(140px); opacity: 0.12; border-radius: 50%; }
        .blob-1 { top: -150px; right: -150px; }
        .blob-2 { bottom: -150px; left: -150px; background: linear-gradient(135deg, var(--success), var(--primary)); }

        .glass-premium {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        .glass-flat {
          background: rgba(30, 41, 59, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
        }

        .app-header, .dashboard {
          width: 100%;
          max-width: 1400px;
          padding: 0 2rem;
          position: relative;
          z-index: 10;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2.5rem;
          border-radius: var(--card-radius);
          margin: 2rem 0 3rem 0;
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
        }
        .brand { display: flex; align-items: center; gap: 1.2rem; }
        .logo-wrapper {
          background: linear-gradient(135deg, var(--primary), #818cf8);
          padding: 0.8rem;
          border-radius: 18px;
          color: white;
          box-shadow: 0 0 25px var(--primary-glow);
        }
        h1 { font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -0.03em; }
        .version { font-size: 0.7rem; background: var(--warning); color: black; padding: 0.1rem 0.5rem; border-radius: 4px; vertical-align: top; margin-left: 0.5rem; font-weight: 900; }
        .subtitle { color: var(--secondary); font-size: 0.95rem; margin: 0; }

        .btn-icon-label {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--white);
          padding: 0.8rem 1.4rem;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 0.8rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
        }
        .btn-icon-label:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-2px); }

        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .btn-logout-icon { 
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--secondary); 
          padding: 0.8rem; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s;
        }
        .btn-logout-icon:hover { background: rgba(239, 68, 68, 0.15); color: var(--danger); border-color: rgba(239, 68, 68, 0.2); transform: translateY(-2px); }

        .dashboard { padding-bottom: 5rem; }
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        .stat-card {
          padding: 2.2rem;
          border-radius: 30px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .stat-card:hover { transform: translateY(-8px) scale(1.01); }
        .stat-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.8rem; }
        .icon-box { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .icon-box.income { background: rgba(16, 185, 129, 0.12); color: var(--success); }
        .icon-box.expense { background: rgba(239, 68, 68, 0.12); color: var(--danger); }
        .icon-box.balance { background: rgba(255, 255, 255, 0.12); color: white; }
        .stat-label { color: var(--secondary); font-size: 1.05rem; font-weight: 500; }
        .stat-value { font-size: 2.4rem; font-weight: 800; font-variant-numeric: tabular-nums; }
        .stat-value.large { font-size: 3rem; }
        .main-balance { background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef); border: none; }
        .balance-progress { height: 8px; background: rgba(0,0,0,0.15); border-radius: 20px; margin-top: 2rem; overflow: hidden; }
        .progress-bar { height: 100%; background: white; border-radius: 20px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }

        .main-content { border-radius: 35px; padding: 2.5rem; }
        .content-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; gap: 1.5rem; flex-wrap: wrap; }
        
        .tab-pill-container { display: flex; padding: 0.4rem; border-radius: 16px; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border); }
        .tab-pill { padding: 0.6rem 1.4rem; border: none; background: transparent; color: var(--secondary); font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.2s; font-size: 0.9rem; }
        .tab-pill.active { background: var(--white); color: var(--bg-dark); box-shadow: 0 4px 12px rgba(255,255,255,0.2); }
        .tab-pill:hover:not(.active) { color: white; background: rgba(255,255,255,0.05); }

        .search-wrapper { flex: 1; min-width: 280px; position: relative; }
        .search-icon { position: absolute; left: 1.4rem; top: 50%; transform: translateY(-50%); color: var(--secondary); }
        .search-wrapper input {
          width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border);
          color: white; padding: 1.1rem 1.1rem 1.1rem 3.8rem; border-radius: 18px; outline: none; transition: all 0.3s ease;
        }
        .btn-primary-gradient {
          background: linear-gradient(135deg, var(--primary), #4338ca); color: white; border: none;
          padding: 1.1rem 2rem; border-radius: 18px; font-weight: 700; display: flex; align-items: center; gap: 0.8rem; cursor: pointer; transition: all 0.3s ease;
        }

        .table-responsive { overflow-x: auto; border-radius: 20px; }
        /* Party Selector */
        .party-selector-container { border-radius: 20px; padding: 0.8rem; border: 1px solid var(--glass-border); }
        .party-type-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .type-tab { 
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); 
          color: var(--secondary); padding: 0.6rem; border-radius: 12px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-weight: 600;
        }
        .type-tab.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 12px var(--primary-glow); }
        .type-tab:hover:not(.active) { background: rgba(255,255,255,0.08); color: white; }

        .modern-table { width: 100%; border-collapse: separate; border-spacing: 0 0.8rem; }
        .modern-table td { padding: 1.4rem 1.8rem; background: rgba(255,255,255,0.015); transition: background 0.2s; }
        .modern-table tr:hover td { background: rgba(255,255,255,0.05); }
        .badge-pill { display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.04); padding: 0.4rem 1rem; border-radius: 100px; color: var(--secondary); font-size: 0.95rem; font-weight: 500; border: 1px solid rgba(255,255,255,0.05); width: fit-content; }
        .row-number { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--secondary); opacity: 0.6; }
        .tx-amount { font-family: 'JetBrains Mono', monospace; font-size: 1.15rem; font-weight: 700; }

        .btn-delete-row {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.1);
          color: var(--danger);
          padding: 0.6rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: auto;
        }
        .btn-delete-row:hover {
          background: var(--danger);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* Custom Selector */
        .custom-select-wrapper { position: relative; width: 100%; }
        .custom-select-trigger {
          width: 100%; display: flex; align-items: center; gap: 0.8rem; background: rgba(15, 23, 42, 0.4);
          border: 1px solid var(--glass-border); padding: 1rem 1.4rem; border-radius: 15px; color: white; cursor: pointer; text-align: left;
          transition: all 0.3s;
        }
        .custom-select-trigger:hover { background: rgba(30, 41, 59, 0.6); border-color: rgba(255,255,255,0.2); }
        .custom-select-trigger .chevron { margin-left: auto; transition: transform 0.3s; color: var(--secondary); }
        .custom-select-trigger .chevron.open { transform: rotate(180deg); }
        
        .custom-select-options {
          position: absolute; bottom: calc(100% + 10px); left: 0; width: 100%; border-radius: 18px; padding: 0.5rem; z-index: 100;
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .select-option {
          display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: all 0.2s;
        }
        .select-option:hover { background: rgba(255,255,255,0.08); }
        .select-option.selected { background: rgba(99, 102, 241, 0.15); color: var(--primary); }

        /* Advanced Toggle */
        .type-toggle-container {
          position: relative; display: flex; background: rgba(15, 23, 42, 0.6); padding: 0.45rem; border-radius: 18px; margin-bottom: 2.2rem; border: 1px solid var(--glass-border);
        }
        .sliding-pill {
          position: absolute; top: 0.45rem; left: 0.45rem; height: calc(100% - 0.9rem); width: calc(50% - 0.45rem);
          border-radius: 14px; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .sliding-pill.income { background: var(--success); transform: translateX(0); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
        .sliding-pill.expense { background: var(--danger); transform: translateX(100%); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
        .toggle-btn { position: relative; z-index: 1; flex: 1; border: none; background: transparent; color: white; padding: 0.9rem; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.8rem; font-weight: 700; transition: color 0.3s; }
        .toggle-btn:not(.active) { color: var(--secondary); }

        /* Date Picker UI */
        .date-picker-wrapper { position: relative; width: 100%; }
        .date-trigger { 
          width: 100%; display: flex; align-items: center; gap: 0.8rem; background: rgba(15, 23, 42, 0.4); 
          border: 1px solid var(--glass-border); padding: 1rem 1.4rem; border-radius: 15px; color: white; cursor: pointer; transition: all 0.3s; 
        }
        .date-trigger:hover { background: rgba(30, 41, 59, 0.6); }
        .date-trigger .chevron { margin-left: auto; transition: transform 0.3s; color: var(--secondary); }
        .date-trigger .chevron.open { transform: rotate(180deg); }

        .date-dropdown { 
          position: absolute; bottom: calc(100% + 10px); left: 0; width: 320px; padding: 1.5rem; border-radius: 20px; z-index: 101; 
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .calendar-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
        .month-name { font-weight: 700; font-size: 1rem; text-transform: capitalize; }
        .ctrl-btn { background: transparent; border: none; color: var(--secondary); cursor: pointer; padding: 0.5rem; border-radius: 10px; transition: all 0.2s; }
        .ctrl-btn:hover { background: rgba(255,255,255,0.08); color: white; }

        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.4rem; }
        .calendar-day-header { font-size: 0.75rem; color: var(--secondary); text-align: center; font-weight: 600; padding: 0.5rem 0; }
        .calendar-day { 
          aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 12px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; 
          border: 1px solid transparent;
        }
        .calendar-day:hover:not(.empty) { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.1); }
        .calendar-day.selected { background: var(--primary); color: white; box-shadow: 0 4px 15px var(--primary-glow); }
        .calendar-day.empty { cursor: default; }

        .quick-dates { display: flex; gap: 0.6rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.2rem; }
        .quick-btn { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); color: var(--secondary); padding: 0.7rem; border-radius: 12px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .quick-btn:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.1); }

        /* Modal Layout */
        .modal-root { 
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .modal-backdrop { 
          position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
          background: rgba(2, 6, 23, 0.7); backdrop-filter: blur(8px); 
        }
        .modal-box { 
          position: relative; z-index: 1001; width: 100%; max-width: 650px; 
          padding: 2.5rem; border-radius: 40px; overflow: hidden;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .modal-header h3 { font-size: 1.6rem; font-weight: 800; margin: 0; }
        .btn-close { background: rgba(255,255,255,0.05); border: none; color: var(--secondary); width: 40px; height: 40px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-close:hover { background: rgba(239, 68, 68, 0.15); color: var(--danger); transform: rotate(90deg); }

        .tx-form { display: flex; flex-direction: column; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
        .form-field.full { grid-column: span 2; }
        .form-field label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--secondary); margin-bottom: 0.8rem; padding-left: 0.4rem; }
        .input-wrapper { position: relative; width: 100%; }
        .input-wrapper input { 
          width: 100%; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--glass-border); 
          padding: 1rem 1.4rem; border-radius: 15px; color: white; transition: all 0.3s;
        }
        .input-wrapper input:focus { border-color: var(--primary); outline: none; }
        .field-icon { position: absolute; right: 1.2rem; top: 50%; transform: translateY(-50%); color: var(--secondary); pointer-events: none; }

        .form-actions { display: flex; justify-content: flex-end; gap: 1.2rem; }
        .btn-secondary-flat { background: transparent; border: none; color: var(--secondary); font-weight: 600; cursor: pointer; transition: color 0.2s; }
        .btn-secondary-flat:hover { color: white; }
        .btn-submit-gradient { 
          padding: 1rem 2rem; border-radius: 16px; border: none; font-weight: 700; color: white; cursor: pointer; transition: all 0.3s;
        }
        .btn-submit-gradient.income { background: linear-gradient(135deg, var(--success), #059669); }
        .btn-submit-gradient.expense { background: linear-gradient(135deg, var(--danger), #b91c1c); }
        .btn-submit-gradient:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .btn-submit-gradient:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Confirm Modal specific styles */
        .confirm-modal { max-width: 400px; text-align: center; padding: 3rem 2rem; }
        .confirm-icon-wrapper { width: 80px; height: 80px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .confirm-modal h3 { margin-bottom: 1rem; }
        .confirm-modal p { color: var(--secondary); line-height: 1.6; margin-bottom: 2rem; }
        .confirm-actions { display: flex; gap: 1rem; justify-content: center; }
        .btn-danger-gradient { 
          background: linear-gradient(135deg, var(--danger), #b91c1c); color: white; border: none; padding: 0.8rem 1.8rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s;
        }
        .btn-danger-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4); }

        @media (max-width: 768px) {
          .app-header { padding: 1.2rem; margin: 1rem 0; flex-direction: column; gap: 1.5rem; text-align: center; }
          .modern-table td { padding: 1rem; }
          .date-dropdown { left: 50%; transform: translateX(-50%) !important; bottom: calc(100% + 10px); }
        }
      `}</style>
    </div>
  );
};

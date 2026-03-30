import React from 'react';
import { useTranslation } from 'react-i18next';

interface DateRangePickerProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateFrom = '', dateTo = '', onChange }) => {
  const { t } = useTranslation();

  const handleClear = () => {
    onChange('', '');
  };

  return (
    <div className="date-range-picker">
      <div className="date-range-group">
        <label htmlFor="date-from" className="date-range-label">{t('common.from', { defaultValue: 'Від:' })}</label>
        <input 
          type="date" 
          id="date-from" 
          className="date-input" 
          value={dateFrom} 
          onChange={(e) => onChange(e.target.value, dateTo)}
        />
      </div>
      <div className="date-range-group">
        <label htmlFor="date-to" className="date-range-label">{t('common.to', { defaultValue: 'До:' })}</label>
        <input 
          type="date" 
          id="date-to" 
          className="date-input" 
          value={dateTo} 
          onChange={(e) => onChange(dateFrom, e.target.value)}
        />
      </div>
      <button 
        onClick={handleClear} 
        className="btn btn-ghost btn-sm" 
        title={t('common.clear', { defaultValue: 'Очистити' })}
      >
        <span className="icon">✕</span>
      </button>
    </div>
  );
};

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isValid, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import styles from './DateRangePicker.module.css';

registerLocale('uk', uk);

interface DateRangePickerProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateFrom = '', dateTo = '', onChange }) => {
  const { t } = useTranslation();
  const startDate = dateFrom ? parseISO(dateFrom) : null;
  const endDate = dateTo ? parseISO(dateTo) : null;

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    const fromStr = start && isValid(start) ? format(start, 'yyyy-MM-dd') : '';
    const toStr = end && isValid(end) ? format(end, 'yyyy-MM-dd') : '';
    onChange(fromStr, toStr);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '');
  };

  const shiftMonth = (delta: number) => {
    const baseDate = startDate || new Date();
    const newBase = delta > 0 ? addMonths(baseDate, 1) : subMonths(baseDate, 1);
    const from = format(startOfMonth(newBase), 'yyyy-MM-dd');
    const to = format(endOfMonth(newBase), 'yyyy-MM-dd');
    onChange(from, to);
  };

  return (
    <div className={styles.rangePickerRow}>
      <div className={styles.monthArrows}>
        <button className={styles.monthArrowBtn} onClick={() => shiftMonth(-1)} title={t('date.prevMonth')}>
          ‹
        </button>
      </div>

      <div className={styles.rangePickerContainer}>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable={false}
          placeholderText={t('date.selectPeriod')}
          className={styles.premiumDatepickerInput}
          calendarClassName="premium-calendar"
          dateFormat="dd.MM.yyyy"
          locale="uk"
          autoComplete="off"
        />
        {(dateFrom || dateTo) && (
          <button className={styles.clearTrigger} onClick={handleClear} title={t('common.clear')}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.monthArrows}>
        <button className={styles.monthArrowBtn} onClick={() => shiftMonth(1)} title={t('date.nextMonth')}>
          ›
        </button>
      </div>
    </div>
  );
};

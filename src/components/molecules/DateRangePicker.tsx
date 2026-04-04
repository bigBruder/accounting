import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import { format, parseISO, isValid, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('uk', uk);

interface DateRangePickerProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (from: string, to: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateFrom = '', dateTo = '', onChange }) => {
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
    <div className="range-picker-row">
      <div className="month-arrows">
        <button className="month-arrow-btn" onClick={() => shiftMonth(-1)} title="Попередній місяць">
          ‹
        </button>
      </div>

      <div className="range-picker-container">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          isClearable={false}
          placeholderText="Оберіть період..."
          className="premium-datepicker-input"
          calendarClassName="premium-calendar"
          dateFormat="dd.MM.yyyy"
          locale="uk"
          autoComplete="off"
        />
        {(dateFrom || dateTo) && (
          <button className="clear-trigger" onClick={handleClear} title="Очистити">
            ✕
          </button>
        )}
      </div>

      <div className="month-arrows">
        <button className="month-arrow-btn" onClick={() => shiftMonth(1)} title="Наступний місяць">
          ›
        </button>
      </div>

      <style>{`
        .range-picker-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .month-arrows {
          display: flex;
          align-items: center;
        }
        .month-arrow-btn {
          background: #1a1e26;
          color: #94a3b8;
          border: 1px solid #334155;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          line-height: 1;
        }
        .month-arrow-btn:hover {
          background: #334155;
          color: white;
          border-color: #6366f1;
        }

        .range-picker-container {
          position: relative;
          min-width: 220px;
          display: inline-flex;
          align-items: center;
        }
        .premium-datepicker-input {
          width: 100%;
          background: #1a1e26;
          color: #f8fafc;
          border: 1px solid #334155;
          padding: 8px 40px 8px 16px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .premium-datepicker-input:hover {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        .premium-datepicker-input:focus {
          outline: none;
          border-color: #818cf8;
          box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.2);
        }
        .clear-trigger {
          position: absolute;
          right: 10px;
          background: rgba(148, 163, 184, 0.2);
          color: #94a3b8;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.15s;
          z-index: 10;
        }
        .clear-trigger:hover {
          background: #ef4444;
          color: white;
        }

        /* Calendar Styling (Dark Mode) */
        .premium-calendar {
          background-color: #0f172a !important;
          border: 1px solid #334155 !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          padding: 8px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          margin-top: 8px !important;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid #334155 !important;
          padding-top: 8px !important;
        }
        .react-datepicker__current-month,
        .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 600 !important;
          font-size: 0.85rem !important;
        }
        .react-datepicker__day {
          color: #f1f5f9 !important;
          border-radius: 6px !important;
          margin: 2px !important;
          width: 32px !important;
          line-height: 32px !important;
          transition: all 0.15s !important;
        }
        .react-datepicker__day:hover {
          background-color: #334155 !important;
        }
        .react-datepicker__day--in-range {
          background-color: rgba(99, 102, 241, 0.2) !important;
          color: #c7d2fe !important;
          border-radius: 0 !important;
        }
        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #6366f1 !important;
          color: white !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4) !important;
        }
        .react-datepicker__day--outside-month {
          color: #475569 !important;
        }
        .react-datepicker__navigation {
          top: 14px !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
};

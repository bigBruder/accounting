import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { uk } from 'date-fns/locale/uk';
import { format, parseISO, isValid } from 'date-fns';
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

  return (
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

      <style>{`
        .range-picker-container {
          position: relative;
          min-width: 240px;
          display: inline-flex;
          align-items: center;
        }
        .premium-datepicker-input {
          width: 100%;
          background: #1a1e26;
          color: #f8fafc;
          border: 1px solid #334155;
          padding: 10px 40px 10px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
          right: 12px;
          background: #334155;
          color: #94a3b8;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
          z-index: 10;
        }
        .clear-trigger:hover {
          background: #ef4444;
          color: white;
        }

        /* Calendar Styling */
        .premium-calendar {
          background-color: #1a1e26 !important;
          border: 1px solid #334155 !important;
          border-radius: 16px !important;
          font-family: inherit !important;
          padding: 15px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
          margin-top: 10px !important;
        }
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: 1px solid #334155 !important;
          padding-top: 10px !important;
        }
        .react-datepicker__current-month,
        .react-datepicker-time__header,
        .react-datepicker-year-header,
        .react-datepicker__day-name {
          color: #94a3b8 !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day {
          color: #f1f5f9 !important;
          border-radius: 8px !important;
          margin: 4px !important;
          transition: all 0.2s !important;
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
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4) !important;
        }
        .react-datepicker__day--outside-month {
          color: #475569 !important;
        }
        .react-datepicker__navigation {
          top: 18px !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #94a3b8 !important;
        }
        .react-datepicker__triangle {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

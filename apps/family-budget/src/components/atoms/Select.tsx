import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, label, id, name, placeholder, ...props }) => {
  const selectId = id || name;
  return (
    <div className="form-group">
      {label && <label className="label" htmlFor={selectId}>{label}</label>}
      <select 
        id={selectId}
        name={name}
        className={`select ${props.className || ''}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon ? `${option.icon} ` : ''}
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

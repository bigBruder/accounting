import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, name, ...props }) => {
  const inputId = id || name;
  return (
    <div className="form-group">
      {label && <label className="label" htmlFor={inputId}>{label}</label>}
      <input 
        id={inputId}
        name={name}
        className={`input ${props.className || ''}`}
        {...props}
      />
    </div>
  );
};

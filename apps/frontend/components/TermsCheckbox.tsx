'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TermsCheckboxProps {
  name: string;
  label: string;
  termsUrl: string;
  termsText: string;
  required?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
}

export default function TermsCheckbox({
  name,
  label,
  termsUrl,
  termsText,
  required = true,
  checked = false,
  onChange,
  error,
}: TermsCheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    onChange?.(newChecked);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            required={required}
            className={`h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 ${
              error ? 'border-error-500' : ''
            }`}
          />
        </div>
        <label htmlFor={name} className="ml-3 text-sm text-gray-700">
          {label}{' '}
          <Link
            href={termsUrl}
            target="_blank"
            className="text-primary-600 hover:text-primary-700 underline font-medium"
          >
            {termsText}
          </Link>
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      </div>
      {error && (
        <p className="text-sm text-error-600 ml-7">{error}</p>
      )}
    </div>
  );
}

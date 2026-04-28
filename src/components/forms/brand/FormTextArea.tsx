import React from 'react';

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function FormTextArea({ label, className = '', ...props }: FormTextAreaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={4}
        className={`w-full px-4 py-3 rounded-lg bg-[#1A2737] border border-gray-700 text-white 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${className}`}
      />
    </div>
  );
}
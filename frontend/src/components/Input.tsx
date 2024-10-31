import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: { field: string; message: string } | null | undefined;
}

const Input: React.FC<InputProps> = ({ label, error, ...rest }) => {
  return (
    <div className="mb-3 pt-0">
      <label htmlFor={rest.id}>{label}</label>

      <input
        {...rest}
        type={rest.type ? rest.type : "text"}
        className={`px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-sm border ${
          error && error.field === rest.name
            ? "border-red-500"
            : "border-blueGray-300"
        } outline-none focus:outline-none focus:ring w-full ${rest.className}`}
      />
      {error && error.field === rest.name && (
        <div className="text-red-500">{error.message}</div>
      )}
    </div>
  );
};

export default Input;

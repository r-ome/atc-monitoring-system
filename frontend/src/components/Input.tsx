import React from "react";
import { RegisterOptions, FieldErrors, useFormContext } from "react-hook-form";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: { field: string; message: string } | null | undefined;
  validations?: RegisterOptions;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  name,
  validations = {},
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const findInputErrors = (errors: FieldErrors, name: string): any => {
    const filtered = Object.keys(errors)
      .filter((key) => key.includes(name))
      .reduce((cur, key) => {
        return Object.assign(cur, { error: errors[key] });
      }, {});
    return filtered;
  };

  const isFormInvalid = (err: {}) => {
    if (Object.keys(err).length > 0) return true;
    return false;
  };

  const inputError = findInputErrors(errors, name);
  const isInvalid = isFormInvalid(inputError);

  return (
    <div className="mb-3 pt-0">
      <label htmlFor={rest.id} className="text-2xl">
        {label}
      </label>

      <input
        {...rest}
        type={rest.type ? rest.type : "text"}
        className={`mt-2 p-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-lg border ${
          error && error.field === name
            ? "border-red-500"
            : "border-blueGray-300"
        } outline-none focus:outline-none focus:ring w-full ${rest.className}`}
        {...register(name, validations)}
      />
      {isInvalid && (
        <div className="text-red-500">{inputError?.error.message}</div>
      )}
    </div>
  );
};

export default Input;

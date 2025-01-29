import React from "react";
import { RegisterOptions, useFormContext } from "react-hook-form";
import { findInputErrors, isFormInvalid } from "../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  validations?: RegisterOptions;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  validations = {},
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputError = findInputErrors(errors, name);
  const isInvalid = isFormInvalid(inputError);

  return (
    <div className="mb-3 pt-0">
      <label htmlFor={rest.id} className="text-2xl">
        {label}
      </label>

      <input
        type={rest.type ? rest.type : "text"}
        className={`mt-2 p-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-lg border outline-none focus:outline-none focus:ring w-full ${rest.className}`}
        {...rest}
        {...register(name, validations)}
      />
      {isInvalid && (
        <div className="text-red-500">{inputError?.error.message}</div>
      )}
    </div>
  );
};

export default Input;

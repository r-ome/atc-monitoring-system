import { RegisterOptions, useFormContext } from "react-hook-form";
import { findInputErrors, isFormInvalid } from "../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  options: { label: string; value: string }[];
  validations?: RegisterOptions;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  validations,
  options,
  ...rest
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const inputError = findInputErrors(errors, name);
  const isInvalid = isFormInvalid(inputError);

  return (
    <div className="mb-3 pt-0 relative w-full">
      <label htmlFor={rest.id} className="text-2xl">
        {label}
      </label>

      <select
        className={`mt-2 p-4 placeholder-blueGray-300 text-blueGray-600 relative bg-white text-lg border
          rounded focus:outline-none w-full ${rest.className} ${
          rest.disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
        {...rest}
        {...register(name, { ...validations })}
      >
        <option disabled value={""}>
          Select your option
        </option>
        {(options || []).map((item, i) => (
          <option key={i} value={item.value} className="bg-white p-2">
            {item.label}
          </option>
        ))}
      </select>

      {isInvalid && (
        <div className="text-red-500">{inputError?.error.message}</div>
      )}
    </div>
  );
};

export default Select;

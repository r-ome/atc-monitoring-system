import ReactTailwindSelect from "react-tailwindcss-select";
import { SelectProps } from "react-tailwindcss-select/dist/components/type";

interface CustomSelectProps extends SelectProps {
  label?: string;
  name: string;
  error?: { field: string; message: string } | null | undefined;
}

const Select: React.FC<CustomSelectProps> = ({
  label,
  error,
  primaryColor,
  value,
  options,
  onChange,
  ...rest
}) => {
  return (
    <div className="flex flex-col">
      {label && <label>{label}</label>}
      <div
        className={`mb-3 pt-0 ${
          error && error?.field === rest.name
            ? "border rounded border-red-500"
            : "border-blueGray-300"
        }`}
      >
        <ReactTailwindSelect
          primaryColor={primaryColor}
          value={value}
          options={options}
          onChange={onChange}
        />
      </div>

      {error && error?.field === rest.name && (
        <div className="text-red-500">{error?.message}</div>
      )}
    </div>
  );
};

export default Select;

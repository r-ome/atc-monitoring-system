import { Control, Controller, RegisterOptions } from "react-hook-form";
import { InputNumber, InputNumberProps } from "antd";

interface RHFInputProps extends InputNumberProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  placeholder?: string;
  onChange?: (e: any) => void;
  type?: "number" | "text";
  disabled?: boolean;
  defaultValue?: number | string;
}

const RHFInputNumber: React.FC<RHFInputProps> = ({
  name,
  control,
  rules,
  onChange,
  placeholder,
  defaultValue,
  ...rest
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { invalid, error } }) => (
        <div>
          <InputNumber
            {...field}
            {...rest}
            defaultValue={defaultValue}
            status={invalid ? "error" : ""}
            className="w-full"
            onChange={(...params) => {
              onChange ? onChange(...params) : field.onChange(...params);
            }}
            placeholder={placeholder}
            size="large"
          />
          {invalid && <div className="text-red-500">{error?.message}</div>}
        </div>
      )}
    />
  );
};

export default RHFInputNumber;

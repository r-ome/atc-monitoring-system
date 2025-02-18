import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Input, InputNumber } from "antd";

interface InputProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  placeholder?: string;
  onChange?: (e: any) => void;
  type?: "number" | "text";
  disabled?: boolean;
}

const RHFInput: React.FC<InputProps> = ({
  name,
  control,
  rules,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { invalid, error } }) => (
        <div>
          {type === "number" ? (
            <InputNumber
              {...field}
              status={invalid ? "error" : ""}
              className="w-full"
              onChange={(...params) => {
                onChange ? onChange(...params) : field.onChange(...params);
              }}
              placeholder={placeholder}
              size="large"
            />
          ) : (
            <Input
              {...field}
              disabled={disabled}
              status={invalid ? "error" : ""}
              onChange={(...params) => {
                onChange ? onChange(...params) : field.onChange(...params);
              }}
              placeholder={placeholder}
              size="large"
            />
          )}

          {invalid && <div className="text-red-500">{error?.message}</div>}
        </div>
      )}
    />
  );
};

export default RHFInput;

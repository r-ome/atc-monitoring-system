import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Input, InputProps } from "antd";

interface RHFInputPasswordProps extends InputProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  placeholder?: string;
  onChange?: (e: any) => void;
  disabled?: boolean;
}

const RHFInputPassword: React.FC<RHFInputPasswordProps> = ({
  name,
  control,
  rules,
  onChange,
  placeholder,
  defaultValue,
  type = "text",
  disabled = false,
  ...rest
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState: { invalid, error } }) => (
        <div>
          <Input.Password
            {...field}
            {...rest}
            defaultValue={defaultValue}
            disabled={disabled}
            status={invalid ? "error" : ""}
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

export default RHFInputPassword;

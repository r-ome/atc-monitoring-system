import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Input } from "antd";
import { TextAreaProps } from "antd/es/input";

interface RHFTextAreaProps extends TextAreaProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  placeholder?: string;
  onChange?: (e: any) => void;
  type?: "number" | "text";
  disabled?: boolean;
  defaultValue?: number | string;
}

const RHFTextArea: React.FC<RHFTextAreaProps> = ({
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
      render={({ field, fieldState: { invalid, error } }) => (
        <div>
          <Input.TextArea
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

export default RHFTextArea;

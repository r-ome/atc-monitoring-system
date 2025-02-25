import { Control, Controller, RegisterOptions } from "react-hook-form";
import { DatePicker } from "antd";

interface RHFDatePickerProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}

const RHFDatePicker: React.FC<RHFDatePickerProps> = ({
  name,
  control,
  rules,
  placeholder,
  defaultValue,
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
          <Controller
            control={control}
            name={name}
            disabled={disabled}
            rules={rules}
            render={({ field, fieldState: { invalid, error } }) => (
              <div>
                <DatePicker
                  {...field}
                  placeholder={placeholder}
                  status={invalid ? "error" : ""}
                  format="MMMM DD, YYYY"
                  className="w-full"
                  size="large"
                />
                {invalid && (
                  <div className="text-red-500">{error?.message}</div>
                )}
              </div>
            )}
          />
        </div>
      )}
    />
  );
};

export default RHFDatePicker;

import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Select, SelectProps } from "antd";

interface RHFSelectProps extends SelectProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
}

const RHFSelect: React.FC<RHFSelectProps> = ({
  name,
  control,
  rules,
  onChange,
  placeholder,
  options,
  disabled = false,
  filterOption,
  showSearch,
  ...rest
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={rest.defaultValue}
      render={({ field, fieldState: { invalid, error } }) => (
        <div>
          <Select
            {...field}
            {...rest}
            showSearch={showSearch ? showSearch : false}
            className="w-full"
            options={options}
            disabled={disabled}
            status={invalid ? "error" : ""}
            filterOption={filterOption ? filterOption : false}
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

export default RHFSelect;

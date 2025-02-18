import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Flex, Radio, RadioGroupProps } from "antd";

type RadioOption = { label: string; value: string | number };

interface RHFRadioProps extends RadioGroupProps {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
  options: RadioOption[];
}

const RHFRadioGroup: React.FC<RHFRadioProps> = ({
  name,
  control,
  rules,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { invalid, error } }) => (
        <Flex vertical gap="middle">
          <Radio.Group
            size="large"
            buttonStyle="solid"
            {...field}
            disabled={disabled}
            onChange={(...params) => {
              onChange ? onChange(...params) : field.onChange(...params);
            }}
          >
            {options.map((item: RadioOption, i: number) => (
              <Radio.Button key={i} value={item.value}>
                {item.label}
              </Radio.Button>
            ))}
          </Radio.Group>

          {invalid && <div className="text-red-500">{error?.message}</div>}
        </Flex>
      )}
    />
  );
};

export default RHFRadioGroup;

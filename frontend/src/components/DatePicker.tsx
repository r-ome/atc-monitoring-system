import DatePicker, { DatePickerProps } from "react-datepicker";
import { Controller, RegisterOptions, useFormContext } from "react-hook-form";
import { findInputErrors, isFormInvalid } from "../lib/utils";
import moment from "moment";

type CustomDatePickerProps = DatePickerProps & {
  label?: string;
  error?: { field: string; message: string } | null | undefined;
  name: string;
  validations?: RegisterOptions;
  placeholderText?: string;
  className?: string;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  name,
  validations,
  id,
  placeholderText = "Select Date",
  ...rest
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const inputError = findInputErrors(errors, name);
  const isInvalid = isFormInvalid(inputError);

  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={validations}
        render={({ field }) => (
          <div className="mb-3 pt-0 flex flex-col">
            <label htmlFor={id} className="text-2xl">
              {label}
            </label>

            <DatePicker
              placeholderText={placeholderText}
              onChange={(date) =>
                field.onChange(
                  moment(date?.toString()).format("YYYY-MM-DD HH:mm:ss")
                )
              }
              selected={field.value}
              className={`bg-white mt-2 p-4 border rounded w-full cursor-pointer ${rest.className}`}
              dateFormat="MMMM dd, YYYY"
            />
            {isInvalid && (
              <div className="text-red-500">{inputError?.error.message}</div>
            )}
          </div>
        )}
      />
    </>
  );
};

export default CustomDatePicker;

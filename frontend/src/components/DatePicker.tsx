import React, { useState } from "react";
import DatePicker, { DatePickerProps } from "react-datepicker";

// postponed, typescript error regarding the library

type CustomDatePickerProps = DatePickerProps & {
  label?: string;
  error?: { field: string; message: string } | null | undefined;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  className,
  error,
  label,
  ...rest
}) => {
  const [selected, setStartDate] = useState<Date | null>(null);
  return (
    <div className="flex flex-col">
      {label && <label>{label}</label>}
      {/* @ts-ignore */}
      <DatePicker
        selected={selected}
        className={`min-h-[46px] w-full ${className}`}
        onChange={(date: Date | null) => setStartDate(date)}
        {...rest}
      />
      {error && error.field === rest.name && (
        <div className="text-red-500">{error.message}</div>
      )}
    </div>
  );
};

export default CustomDatePicker;

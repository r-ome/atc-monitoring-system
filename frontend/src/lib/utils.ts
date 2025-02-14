import { FieldErrors } from "react-hook-form";

export const formatNumberPadding = (num: string, padding: number = 3) =>
  num?.toString().padStart(padding, "0");

export const sanitizeBarcode = (barcode: string) => {
  const parts = barcode.split("-");
  parts[1] = formatNumberPadding(parts[1]);
  if (parts.length > 2) parts[2] = formatNumberPadding(parts[2], 4);

  return parts.join("-");
};

export const formatNumberToCurrency = (num: string | number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(num));
};

export const convertToNumber = (amount: string): number => {
  return parseInt(
    amount
      .replace(/,/g, "")
      .replace("₱", "")
      .replace(".00", "")
      .replace("%", ""),
    10
  );
};

export const findInputErrors = (errors: FieldErrors, name: string): any => {
  const filtered = Object.keys(errors)
    .filter((key) => key.includes(name))
    .reduce((cur, key) => {
      return Object.assign(cur, { error: errors[key] });
    }, {});
  return filtered;
};

export const isFormInvalid = (err: {}) => {
  if (Object.keys(err).length > 0) return true;
  return false;
};

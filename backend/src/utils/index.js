export const formatNumberPadding = (num, padding = 3) =>
  num?.toString().padStart(padding, "0");

export const sanitizeBarcode = (barcode) => {
  const parts = barcode.split("-");
  parts[1] = formatNumberPadding(parts[1]);
  if (parts.length > 2) parts[2] = formatNumberPadding(parts[2], 4);

  return parts.join("-");
};

export const formatNumberToCurrency = (num) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(num));
};

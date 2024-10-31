import React from "react";
import { format } from "date-fns";

interface TableInteface {
  columnHeaders: string[];
  loading: boolean;
  data: any[];
  rowKeys: string[];
  onRowClick?: (data: any) => void;
}

const Table: React.FC<TableInteface> = ({
  columnHeaders,
  data,
  loading,
  rowKeys,
  onRowClick = () => {},
}) => {
  return loading ? (
    <>loading...</>
  ) : (
    <table className="w-full text-sm text-left text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          {columnHeaders.map((columnHeader, i) => (
            <th key={i} scope="col" className="px-6 py-3">
              {columnHeader}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((data, i: number) => {
          return (
            <tr
              key={i}
              className="bg-white even:bg-gray-100 hover:bg-gray-300 cursor-pointer"
              onClick={() => onRowClick(data)}
            >
              {rowKeys.map((rowKey) => {
                return (
                  <td key={rowKey} className="px-6 py-4">
                    {rowKey.includes("updated_at")
                      ? format(
                          new Date(data[rowKey]),
                          "MMM dd, yyyy hh:mm:ss a"
                        )
                      : rowKey.includes("created_at") ||
                        rowKey.includes("_date") ||
                        rowKey.includes("eta") ||
                        rowKey.includes("telegraphic_transferred")
                      ? data[rowKey]
                        ? format(new Date(data[rowKey]), "MMM dd, yyyy")
                        : "---"
                      : data[rowKey]
                      ? data[rowKey]
                      : "---"}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;

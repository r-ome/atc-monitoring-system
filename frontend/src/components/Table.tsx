import React from "react";

interface TableInteface {
  columnHeaders: string[];
  loading: boolean;
  data: any[];
  rowKeys: string[];
  hasCount?: boolean;
  onRowClick?: (data: any) => void;
}

const Table: React.FC<TableInteface> = ({
  columnHeaders,
  data,
  loading,
  rowKeys,
  onRowClick,
  hasCount,
}) => {
  const getValue = (obj: any, keyPath: string): any => {
    return keyPath.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  if (hasCount) {
    columnHeaders = ["#"].concat(columnHeaders);
  }

  return loading ? (
    <>loading...</>
  ) : (
    <div className="min-h-[700px] max-h-[700px] overflow-scroll">
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
                className={`${onRowClick ? "cursor-pointer" : null} ${
                  data?.remarks === "INVALID_ROW"
                    ? "bg-red-400 text-white"
                    : "bg-white"
                }`}
                onClick={() => (onRowClick ? onRowClick(data) : null)}
              >
                {hasCount ? <td className="px-6 py-4">{i + 1}</td> : null}
                {rowKeys.map((rowKey, i) => {
                  return (
                    <td
                      key={i}
                      className={`px-6 py-4 ${
                        rowKey === "status"
                          ? data[rowKey] === "PAID"
                            ? "text-green-500"
                            : "text-red-500"
                          : ""
                      }`}
                    >
                      {getValue(data, rowKey)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

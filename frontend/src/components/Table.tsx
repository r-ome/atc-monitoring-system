import React from "react";

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
  onRowClick,
}) => {
  const getValue = (obj: any, keyPath: string): any => {
    return keyPath.split(".").reduce((acc, key) => acc?.[key], obj);
  };

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
              className={`bg-white even:bg-gray-100 hover:bg-gray-300 ${
                onRowClick ? "cursor-pointer" : null
              }`}
              onClick={() => (onRowClick ? onRowClick(data) : null)}
            >
              {rowKeys.map((rowKey) => {
                return (
                  <td key={rowKey} className="px-6 py-4">
                    {getValue(data, rowKey)}
                    {/* {!["", null, undefined].includes(data[rowKey])
                      ? getValue(data, rowKey)
                      : "---"} */}
                    {/* // {rowKey.includes("updated_at")
                    //   ? format(
                    //       new Date(data[rowKey]),
                    //       "MMM dd, yyyy hh:mm:ss a"
                    //     )
                    //   : rowKey.includes("created_at") ||
                    //     rowKey.includes("_date") ||
                    //     rowKey.includes("eta") ||
                    //     rowKey.includes("telegraphic_transferred")
                    //   ? data[rowKey]
                    //     ? format(new Date(data[rowKey]), "MMM dd, yyyy")
                    //     : "---"
                    //   : data[rowKey]
                    //   ? data[rowKey]
                    //   : "---"} */}
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

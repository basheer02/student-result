// TableComponent.jsx
import React from 'react';
import { useReactTable, flexRender, getCoreRowModel } from '@tanstack/react-table';

const TableComponent = ({ columns, data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto overflow-y-auto w-full mt-3 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                  style={{ fontFamily: 'Liberation Mono, monospace' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-300">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-700 break-words"
                  style={{ fontFamily: 'Liberation Mono, monospace' }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;







/* <div className="flex flex-col w-full overflow-auto max-w-md mt-3"> 
                    <div className="grid grid-cols-6 gap-6 mb-3 border-b border-gray-300 font-bold pb-2">
                        {headers.map((header, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <div key={index} className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{header}</div>
                        ))}
                    </div>
                    {data.map((item) => (
                        <div key={item.id} className="grid grid-cols-6 gap-6 mb-3 border-b border-gray-300 pb-2">
                            <div className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.id}</div>
                            <div className="text-center max-w-s" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.name}</div>
                            <div className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.fiqh}</div>
                            <div className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.tariq}</div>
                            <div className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.lisan}</div>
                            <div className="text-center" style={{fontFamily: 'Liberation Mono, monospace', fontWeight: "inherit"}}>{item.tajvidh}</div>
                        </div>
                    ))}                                                                                                                                           
                    </div>
                </div>*/
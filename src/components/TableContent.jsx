// TableComponent.jsx
import React from 'react';
import { useReactTable, flexRender, getCoreRowModel } from '@tanstack/react-table';

const TableComponent = ({ columns, data }) => {

  data.sort((a, b) => {
    // Handle 'failed' ranks by moving them to the end
    if (a.rank === 'failed') return 1;
    if (b.rank === 'failed') return -1;
    
    // Otherwise, sort by rank
    return a.rank - b.rank;
  });

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
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 bg-gray-50 uppercase tracking-wider"
                  style={{ fontFamily: 'Liberation Mono, monospace', position: 'sticky', zIndex:1, top: 0 }}
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
import React from 'react';

export default function Table({
  columns = [], // [{ header: 'Name', accessor: 'name', render?: (row) => ... }]
  data = [],
  keyField = 'id',
  emptyMessage = 'No records available.',
  onRowClick,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-gov ${className}`}>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-400 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowKey = row[keyField] || row._id || row.id || rowIdx;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`py-3 px-3.5 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

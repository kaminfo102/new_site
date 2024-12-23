import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { format } from 'date-fns-jalali';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface User {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
  last_login: string | null;
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper<User>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'نام کاربری',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('is_admin', {
        header: 'نقش',
        cell: info => (
          <span className={clsx(
            'px-2 py-1 rounded-full text-sm',
            info.getValue() ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
          )}>
            {info.getValue() ? 'مدیر' : 'کاربر'}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'تاریخ ثبت نام',
        cell: info => format(new Date(info.getValue()), 'yyyy/MM/dd'),
      }),
      columnHelper.accessor('last_login', {
        header: 'آخرین ورود',
        cell: info => info.getValue() ? format(new Date(info.getValue()!), 'yyyy/MM/dd HH:mm') : '-',
      }),
      columnHelper.display({
        id: 'actions',
        header: 'عملیات',
        cell: props => (
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={() => onEdit(props.row.original)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(props.row.original.id)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ),
      }),
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b dark:border-gray-700">
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full md:w-72 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="جستجو..."
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t dark:border-gray-700">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            قبلی
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            بعدی
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              نمایش{' '}
              <span className="font-medium">{table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1}</span>
              {' '}تا{' '}
              <span className="font-medium">
                {Math.min(
                  table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
                  table.getFilteredRowModel().rows.length
                )}
              </span>
              {' '}از{' '}
              <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>
              {' '}نتیجه
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px space-x-reverse" aria-label="Pagination">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                قبلی
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                بعدی
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from 'react';
import Skeleton from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';

/**
 * Reusable table.
 *   columns: [{ key, header, render?(row), align?, width? }]
 *   rows:    array of row objects with stable `id`
 *   search:  string — filtered against every column's text value when provided
 *   pageSize: number — defaults to 8
 *   loading: boolean — shows skeleton rows
 *   empty:   { title, description, icon, action } for EmptyState
 *   actions: function(row) → ReactNode rendered in the trailing actions cell
 */
export default function Table({
  columns,
  rows,
  search = '',
  pageSize = 8,
  loading = false,
  empty,
  actions,
}) {
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const needle = search.trim().toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => {
        const value = col.render ? col.render(row) : row[col.key];
        if (typeof value === 'string' || typeof value === 'number') {
          return String(value).toLowerCase().includes(needle);
        }
        return false;
      }),
    );
  }, [columns, rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  if (!loading && filtered.length === 0 && empty) {
    return <EmptyState {...empty} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-ink-100 bg-ink-50/60 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
              {actions && <th scope="col" className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 text-ink-800">
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[160px]" />
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        <Skeleton className="ml-auto h-4 w-12" />
                      </td>
                    )}
                  </tr>
                ))
              : pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-ink-50/60"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''}`}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(row)}</td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > pageSize && (
        <div className="flex items-center justify-between border-t border-ink-100 bg-white px-4 py-3 text-xs text-ink-500">
          <p>
            Showing <span className="font-semibold text-ink-800">{safePage * pageSize + 1}</span>–
            <span className="font-semibold text-ink-800">
              {Math.min(filtered.length, (safePage + 1) * pageSize)}
            </span>{' '}
            of <span className="font-semibold text-ink-800">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-lg border border-ink-200 px-2.5 py-1 text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-40"
            >
              ←
            </button>
            <span className="px-2">
              {safePage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded-lg border border-ink-200 px-2.5 py-1 text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

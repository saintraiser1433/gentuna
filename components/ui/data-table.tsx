"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react"

interface DataTableProps<T> {
  data: T[]
  columns: {
    header: string
    accessor: keyof T | ((row: T) => React.ReactNode)
    searchable?: boolean
  }[]
  searchPlaceholder?: string
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  pageSize?: number
  actions?: (row: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  emptyIcon,
  pageSize = 10,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search.trim()) return data

    return data.filter((row) =>
      columns.some((col) => {
        if (!col.searchable) return false
        const value = typeof col.accessor === "function"
          ? String(col.accessor(row))
          : String(row[col.accessor])
        return value.toLowerCase().includes(search.toLowerCase())
      })
    )
  }, [data, search, columns])

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1)
  }, [search])

  const defaultEmptyIcon = <Inbox className="size-12 text-muted-foreground" />

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {emptyIcon || defaultEmptyIcon}
          <p className="mt-4 text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="text-left p-3 font-semibold text-sm"
                      >
                        {col.header}
                      </th>
                    ))}
                    {actions && <th className="text-right p-3 font-semibold text-sm">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                      {columns.map((col, idx) => (
                        <td key={idx} className="p-3">
                          {typeof col.accessor === "function"
                            ? col.accessor(row)
                            : String(row[col.accessor] ?? "")}
                        </td>
                      ))}
                      {actions && (
                        <td className="p-3 text-right">{actions(row)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
                {filteredData.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}




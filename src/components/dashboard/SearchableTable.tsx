
import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface SearchableTableProps<T extends Record<string, any>> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
  }[];
  searchKey: string;
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  pageSize?: number;
}

export function SearchableTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  onSearch,
  isLoading = false,
  emptyState,
  pageSize = 10,
}: SearchableTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Calcular datos filtrados localmente si no hay onSearch
  const filteredData = onSearch
    ? data
    : data.filter(item =>
        String(item[searchKey])
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase())
      );

  // Paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Efecto para manejar búsquedas externas
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
    // Resetear a la primera página cuando cambia la búsqueda
    setCurrentPage(1);
  }, [debouncedSearchTerm, onSearch]);

  // Renderizar filas de esqueleto durante la carga
  const renderSkeletonRows = () => {
    return Array.from({ length: pageSize }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((column, colIndex) => (
          <TableCell key={`skeleton-cell-${colIndex}`} className="py-3">
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="search"
          placeholder="Buscar..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeletonRows()
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={`row-${index}`}>
                  {columns.map((column) => (
                    <TableCell key={`cell-${column.key}-${index}`}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  {emptyState || (
                    <div className="text-muted-foreground">
                      No se encontraron resultados
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="flex items-center">
            {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}


import { useState, useEffect } from "react";

/**
 * Hook personalizado para debounce que retrasa la actualización de un valor
 * Útil para búsquedas y otros eventos que pueden dispararse frecuentemente
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un temporizador para actualizar el valor después del retraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia antes de que se complete el retraso
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

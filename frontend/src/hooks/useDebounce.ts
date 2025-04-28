import { useState, useEffect } from 'react'

/**
 * Возвращает debounced-версию value:
 * обновляется не чаще чем раз в ms миллисекунд
 */
export function useDebounce<T>(value: T, ms: number): T {
    const [debounced, setDebounced] = useState<T>(value)
    useEffect(() => {
        const handle = setTimeout(() => setDebounced(value), ms)
        return () => clearTimeout(handle)
    }, [value, ms])
    return debounced
}

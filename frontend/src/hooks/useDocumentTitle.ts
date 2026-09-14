import { useEffect } from 'react'

export function useDocumentTitle(page: string) {
  useEffect(() => {
    document.title = `Swimplan - ${page}`
  }, [page])
}

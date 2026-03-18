import { useState, useEffect } from 'react'
import type { ToolStatus } from '../../../shared/types'

export function useToolStatus() {
  const [status, setStatus] = useState<ToolStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api
      .detectTools()
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const allReady = status !== null && status.ffmpeg.found && status.imagemagick.found

  return { status, loading, allReady }
}

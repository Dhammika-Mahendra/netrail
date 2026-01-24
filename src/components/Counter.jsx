import React, { useEffect, useState } from 'react'

export default function Counter() {
  const [value, setValue] = useState(1)

  useEffect(() => {
    const id = setInterval(() => {
      setValue(prev => {
        if (prev >= 100) {
          return 1
        }
        return prev + 1
      })
    }, 500)

    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-between w-full h-full">
      <span className="text-lg font-semibold text-gray-800">{value}</span>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

export default function Nav() {

  const {count, setCount} = useAppContext()
  const [isAutoIncrement, setIsAutoIncrement] = useState(false)

  // Auto-increment function that loops from 0-1200
  useEffect(() => {
    if (isAutoIncrement) {
      const interval = setInterval(() => {
        setCount((prevCount) => (prevCount + 1) % 1201)
      }, 100) // Increment every 100ms

      return () => clearInterval(interval)
    }
  }, [isAutoIncrement, setCount])

  return (
    <div className='w-[20%] h-full bg-white shadow-lg shadow-black-500/50'>
      <h4>set count</h4>
      <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
      <button 
        onClick={() => setIsAutoIncrement(!isAutoIncrement)}
        className='mt-2 px-4 py-2 bg-blue-500 text-white rounded'
      >
        {isAutoIncrement ? 'Stop' : 'Start'} Auto Increment
      </button>
    </div>
  )
}

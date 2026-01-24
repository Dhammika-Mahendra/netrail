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
    <div className="flex flex-col items-center justify-between w-full">
      <div className='flex justify-between items-center'>
        <svg class="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
        </svg>
        <div 
          className="h-[40px] w-[150px] text-lg text-center font-semibold text-gray-800 border rounded-md border-gray-300"
        >{value}
        </div>
        <svg class="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clip-rule="evenodd"/>
        </svg>
      </div>

      {/* Scale Slider */}
      <div className="w-32 flex flex-col items-center w-full mt-4">
            <div className='flex justify-between w-full px-2 mb-1'>
                <svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10 16 4-4-4-4"/>
                </svg>
                <svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 16 4-4-4-4m6 8 4-4-4-4"/>
                </svg>
            </div>
            <input
                type="range"
                min={1}
                max={15}
                step={1}
                style={{ width: '140px', height: '4px', cursor: 'pointer' }}
            /> 
        </div>
    </div>
  )
}

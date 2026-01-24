import React from 'react'
import Counter from './Counter'

export default function Nav() {
  return (
    <div className='w-[20%] h-full bg-white shadow-lg shadow-black-500/50'>
      {/* Counter */}
      <div className='p-4 h-[50px] w-full border-b border-gray-200'>
        <Counter />
      </div>
    </div>
  )
}

import { useState } from 'react'
import './index.css'
import { AppProvider } from './context/AppContext'


function App() {

  return (
    <AppProvider>
      <div className="relative flex">
       <h1 className="absolute top-4 left-4 text-2xl font-bold">NetRail</h1>
      </div>
    </AppProvider>
  )
}

export default App

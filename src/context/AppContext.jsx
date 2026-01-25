import React, { createContext, useContext, useState } from 'react'
import { useEffect } from 'react'

// Create the context
const AppContext = createContext()

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Context provider component
export const AppProvider = ({ children }) => {

  const [trains, setTrains] = useState([
      { id: 1, key: 'path-1', indices: [0], speedMs: 250, stepKm: 0.5, direction: 'forward', loop: true },
      { id: 2, key: 'path-2', indices: [1], speedMs: 250, stepKm: 0.5, direction: 'backward', loop: true },
  ])
  
  const value = {
    trains,
    setTrains
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

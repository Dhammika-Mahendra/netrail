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
      { key: 'path-1', indices: [2], speedMs: 50, stepKm: 0.5, direction: 'forward', loop: false },
      { key: 'path-2', indices: [1], speedMs: 50, stepKm: 0.5, direction: 'backward', loop: false },
      { key: 'path-1-2', indices: [0, 1], speedMs: 50, stepKm: 0.5, direction: 'forward', loop: false }            
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

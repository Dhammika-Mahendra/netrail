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

  const [count, setCount] = useState(1)

  const [trains, setTrains] = useState([
     {
        "id":3,
        "basePath":[2],
        "start":10,
        "end":100,
        "direction":"forward",
        "speedMs": 150
    },
    {
        "id":4,
        "basePath":[1],
        "start":0,
        "end":100,
        "direction":"backward",
        "speedMs": 50
    }
  ])
  
  const value = {
    trains,
    setTrains,
    count,
    setCount
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

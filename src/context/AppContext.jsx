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
     {
        "id":3,
        "basePath":[2],
        "start":10,
        "end":50,
        "direction":"forward",
        "speedMs": 150
    },
    {
        "id":4,
        "basePath":[1],
        "start":5,
        "end":120,
        "direction":"backward",
        "speedMs": 50
    },
    {
        "id":5,
        "basePath":[0,1],
        "start":15,
        "end":30,
        "direction":"forward",
        "speedMs": 30 
    }
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

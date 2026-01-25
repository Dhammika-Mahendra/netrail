import './index.css'
import { AppProvider } from './context/AppContext'
import Nav from './components/Nav'
import Map from './components/Map'


function App() {

  return (
    <AppProvider>
      <div className="relative flex w-full h-screen">
       <Nav></Nav>
       <Map></Map>
      </div>
    </AppProvider>
  )
}

export default App

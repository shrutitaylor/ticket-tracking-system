import { useState } from 'react'
import Dashboard from './pages/dashboard'
import './index.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <div className='bg-black font-spaceGrotesk min-h-screen flex'>
        <Dashboard/>
     </div>
        
    </>
  )
}

export default App

import React from 'react'
import Home from "./screen/home.jsx" 
import { Routes,Route } from 'react-router'
import Admin from './screen/admin.jsx'
export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/admin' element={<Admin />}/>
      </Routes>
    </div>
  )
}

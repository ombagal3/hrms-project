import React from 'react'
import Home from "./screen/home.jsx" 
import { Routes,Route } from 'react-router'
export default function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  )
}

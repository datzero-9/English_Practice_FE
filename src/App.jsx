import React from 'react'
import Footer from './component/footer/Footer'
import Header from './component/header/Header'
import Main from './component/content/Main'
import Test from './component/content/test'
import Login from './account/Login'
import Register from './account/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <div className='w-full'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Main />} />
          <Route path="/test" element={<Test />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App;

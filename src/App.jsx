import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './account/Login';
import Register from './account/Register';
import MainLayout from './MainLayout';
import Main from './component/content/Main';
import Practice from './component/content/Practice';
import AddVocabulary from './component/content/AddVocabulary';
import Fix from './component/content/Fix';
import PrivateRoute from './account/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Các trang cần đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route path="/home" element={<Main />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/addvocabulary" element={<AddVocabulary />} />
            <Route path="/Fix" element={<Fix />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

// src/helper/PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../helper/firebase'; // Đường dẫn firebase của bạn
import { useAuthState } from 'react-firebase-hooks/auth';

const PrivateRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="text-center py-10">Đang kiểm tra đăng nhập...</div>;
  }

  // Nếu chưa đăng nhập → chuyển về trang đăng nhập
  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;

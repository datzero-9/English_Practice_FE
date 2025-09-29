import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from '../helper/firebase';
import axios from 'axios';
import { api } from '../helper/api'
const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User info:", user);

      // 1. Lưu vào Firestore (tuỳ chọn, nếu dùng song song Firebase)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });

      // 2. Gửi thông tin user về API backend
      await axios.post(`${api}/user`, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });

      alert("Đăng nhập thành công!");
      navigate("/home");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Lỗi đăng nhập!");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    alert('Đăng nhập bằng tài khoản thành công (demo)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6 tracking-wide">
          Đăng nhập
        </h2>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2.5 rounded-lg shadow-sm transition duration-200 mb-6"
        >
          <FcGoogle size={24} />
          Đăng nhập bằng Google
        </button>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <FaUserAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                className="w-full outline-none"
                placeholder="Nhập tên tài khoản"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 transition">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                className="w-full outline-none"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow transition duration-200"
          >
            Đăng nhập
          </button>
        </form>

        {/* Link to register */}
        <p className="text-sm text-center mt-6 text-gray-600">
          Chưa có tài khoản?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline cursor-pointer font-medium"
          >
            Đăng ký
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

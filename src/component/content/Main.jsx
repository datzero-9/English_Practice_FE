import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../helper/firebase';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Đăng xuất thành công!");
      navigate("/"); // quay về trang login
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  const selectItems = [
    { label: 'Leo hạng' },
    { label: 'Flash card' },
    { label: 'Cạnh tranh' },
  ];

  const buttonClass =
    "cursor-pointer text-sm bg-blue-500 hover:bg-blue-600 text-white " +
    "font-semibold px-6 py-3 rounded-xl shadow transition-colors duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div className="flex justify-center">
      <div className="container h-[400px] p-4 bg-blue-50 flex flex-col items-center justify-center gap-6 rounded-2xl shadow-sm">
        <div className="flex gap-4">
          {selectItems.map((item, index) => (
            <button key={index} className={buttonClass}>
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Main;

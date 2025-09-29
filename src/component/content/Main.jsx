import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../helper/firebase'; // đúng đường dẫn auth của bạn nhé
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Đăng xuất thành công!");
      navigate("/home"); // quay về trang login
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
    "cursor-pointer text-sm bg-green-300 hover:bg-green-400 font-semibold px-6 py-3 rounded-xl shadow";

  return (
    <div className="flex justify-center">
      <div className="container h-[400px] p-2 bg-green-100 flex flex-col items-center justify-center gap-6">
        <div className="flex gap-4">
          {selectItems.map((item, index) => (
            <button key={index} className={buttonClass}>
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Main;

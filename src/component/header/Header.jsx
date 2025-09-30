import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: '🏠 Trang chủ', navigation: '/home' },
    { label: '🏋️‍♀️ Luyện tập', navigation: '/practice' },
    { label: '➕ Thêm từ vựng', navigation: '/addvocabulary' },
    { label: '📊 Bảng xếp hạng', navigation: '/Fix' },
    { label: '⚙️ Cài đặt', navigation: '/Fix' },
  ];

  const baseItem =
    "px-4 py-3 text-sm font-semibold rounded-md transition-colors duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer select-none";

  const inactive =
    "text-blue-700 hover:bg-blue-100";
  const active =
    "bg-blue-600 text-white hover:bg-blue-600";

  return (
    <header className="bg-blue-50 border-b border-blue-100">
      <nav className="container mx-auto px-3">
        <div className="flex gap-2 items-center justify-between overflow-x-auto py-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.navigation;
            return (
              <button
                key={idx}
                type="button"
                className={`${baseItem} ${isActive ? active : inactive}`}
                onClick={() => navigate(item.navigation)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;

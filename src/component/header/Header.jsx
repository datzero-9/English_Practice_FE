import React from 'react'
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate();

  const styleItem = "cursor-pointer p-3 font-semibold text-sm rounded-sm hover:bg-green-400";

  const menuItems = [
    { label: '🏠 Trang chủ', navigation: '/home' },
    { label: '🏋️‍♀️ Luyện tập', navigation: '/test' },
    { label: '➕ Thêm từ vựng', navigation: '/' },
    { label: '📊 Bảng xếp hạng', navigation: '/' },
    { label: '⚙️ Cài đặt', navigation: '/' },
  ];
  return (
    <div className='bg-green-300 flex justify-center mb-2'>
      <nav className="container">
        <div className="flex justify-between">
          {menuItems.map((item, index) => (
            <a
              key={index}
              className={styleItem}
              onClick={() => { navigate(item.navigation) }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Header;

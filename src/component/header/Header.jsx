import React from 'react'

const Header = () => {
  return (
    <div>
       <nav className="bg-green-300">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-center sm:justify-between gap-4">
        <a href="#" className="flex items-center gap-2 font-semibold text-sm">
          🏠 Trang chủ
        </a>
        <a href="#" className="flex items-center gap-2 font-semibold text-sm">
          🏋️‍♀️ Luyện tập
        </a>
        <a href="#" className="flex items-center gap-2 font-semibold text-sm">
          ➕ Thêm từ vựng
        </a>
        <a href="#" className="flex items-center gap-2 font-semibold text-sm">
          📊 Bảng xếp hạng
        </a>
        <a href="#" className="flex items-center gap-2 font-semibold text-sm">
          ⚙️ Cài đặt
        </a>
      </div>
    </nav>
    </div>
  )
}

export default Header;

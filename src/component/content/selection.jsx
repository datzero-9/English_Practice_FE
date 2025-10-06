import React from "react";
import { useNavigate } from "react-router-dom";

const Selection = () => {
  const navigate = useNavigate();

  const handleGoToMemory = () => navigate("/memory");
  const handleGoToSystem = () => navigate("/practice");

  return (
    <div className=" flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="bg-white shadow-lg rounded-3xl p-6 w-full max-w-sm text-center border border-gray-100">
        <h1 className="text-xl font-bold text-gray-700 mb-6">
          🌷 Chọn chế độ học
        </h1>

        <div className="flex flex-col gap-4">
          {/* Ôn tập từ vựng */}
          <button
            onClick={handleGoToMemory}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-pink-400 bg-pink-50 text-pink-600 font-medium hover:bg-pink-100 hover:shadow-md transition-all"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              🧠
            </span>
            <span>Ôn tập từ vựng</span>
            <p className="text-xs opacity-70">Luyện lại từ đã hoặc chưa thuộc</p>
          </button>

          {/* Học từ hệ thống */}
          <button
            onClick={handleGoToSystem}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-blue-400 bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 hover:shadow-md transition-all"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">
              📘
            </span>
            <span>Từ vựng hệ thống</span>
            <p className="text-xs opacity-70">Học toàn bộ từ trong hệ thống</p>
          </button>
        </div>

        <p className="mt-6 text-gray-400 text-xs">
          🌸 Học vui – nhớ lâu – nhẹ nhàng mỗi ngày 🌸
        </p>
      </div>
    </div>
  );
};

export default Selection;

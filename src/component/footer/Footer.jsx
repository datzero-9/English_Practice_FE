import React from 'react';

const Footer = () => {
  return (
    <div className="flex justify-center items-end">
      <div className="w-full max-w-3xl text-center rounded-2xl mt-4 px-4 py-4
                      bg-blue-50 border border-blue-100 shadow-sm">
        <p className="text-blue-700 font-semibold uppercase tracking-wide">
          Tích tiểu thành đại
        </p>
        <p className="text-blue-600 text-sm">
          Chỉ cần 5 từ mỗi ngày, sau 1 năm bạn đã có 1.825 từ vựng!
        </p>
      </div>
    </div>
  );
};

export default Footer;

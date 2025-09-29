import React from 'react';
// import { useNavigate } from 'react-router-dom';
const Main = () => {
  // const navigate = useNavigate();
  const selectItems = [
    { label: 'Leo hạng' },
    { label: 'Flash card' },
    { label: 'Cạnh tranh' },
  ]
  const className = "cursor-pointer text-sm bg-green-300 hover:bg-green-400 font-semibold px-6 py-3 rounded-xl shadow"
  return (
    <div className="flex justify-center">
      <div className="container h-[400px] p-2 bg-green-100 flex items-center justify-center gap-6">
        {
          selectItems.map((item, index) => (
            <button key={index} className={className}>
              {item.label}
            </button>
          ))
        }
        
      </div>
    </div>
  );
};

export default Main;

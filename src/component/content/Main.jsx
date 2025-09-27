import React from 'react'

const Main = () => {
  return (
    <div>
      <main className="flex-1 flex flex-col items-center justify-center bg-white">

        <div
          className="w-full max-w-3xl bg-cover bg-center flex flex-col items-center justify-center py-10 px-4"
          style={{
            backgroundImage:
              "url('/ant-bg.jpg')", // đổi path này thành ảnh bạn muốn (kiến nâng gỗ)
          }}
        >
          <h6>Xin chao mọi ngươi đây la phân test của minh cũng theo dõi minh nhé ./......</h6>
        </div>

       


      </main>
    </div>
  )
}

export default Main

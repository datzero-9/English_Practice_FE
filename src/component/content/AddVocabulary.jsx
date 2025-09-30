import React, { useState } from "react";
import { auth } from "../../helper/firebase";
import { api } from "../../helper/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddVocabulary = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    english: "",
    vietnamese: "",
    exampleEn: "",
    exampleVi: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      navigate("/");
      return;
    }

    const english = form.english.trim();
    const vietnamese = form.vietnamese.trim();
    const exampleEn = form.exampleEn.trim();
    const exampleVi = form.exampleVi.trim();

    if (!english || !vietnamese) {
      alert("Vui lòng nhập đầy đủ: Từ tiếng Anh và Nghĩa tiếng Việt.");
      return;
    }

    const payload = {
      english,
      vietnamese,
      exampleEn,
      exampleVi,
      createdById: user.uid,
      createdByName: user.displayName || user.email || "Unknown",
    };

    try {
      setLoading(true);
      const res = await axios.post(`${api}/addVocabulary`, payload);

      if (res?.data?.status) {
        alert("✅ Đã thêm từ vựng thành công!");
        setForm({ english: "", vietnamese: "", exampleEn: "", exampleVi: "" });
      } else {
        const msg = res?.data?.message || "Không rõ lỗi từ server.";
        alert("❌ Lỗi thêm từ vựng: " + msg);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể kết nối đến server!";
      alert("❌ " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-start justify-center bg-gray-50 px-4 py-6 sm:py-8">
      <div className="w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
        <div className="bg-white rounded-2xl shadow-lg px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 text-center">
            Thêm Từ Vựng Mới
          </h2>
          <p className="mt-2 text-center text-gray-500 text-sm">
            Điền tối thiểu 2 trường bắt buộc: <span className="font-medium">Từ tiếng Anh</span> và{" "}
            <span className="font-medium">Nghĩa tiếng Việt</span>.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Từ tiếng Anh */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ tiếng Anh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="english"
                value={form.english}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[44px] outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. abandon"
                required
                disabled={loading}
              />
            </div>

            {/* Nghĩa tiếng Việt */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghĩa tiếng Việt <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vietnamese"
                value={form.vietnamese}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[44px] outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. bỏ rơi"
                required
                disabled={loading}
              />
            </div>

            {/* Câu mẫu tiếng Anh (span 2 cột ở md+) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câu mẫu tiếng Anh
              </label>
              <textarea
                name="exampleEn"
                value={form.exampleEn}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder="He decided to abandon his car in the storm."
                disabled={loading}
              />
            </div>

            {/* Câu mẫu tiếng Việt (span 2 cột ở md+) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Câu mẫu tiếng Việt
              </label>
              <textarea
                name="exampleVi"
                value={form.exampleVi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder="Anh ấy quyết định bỏ lại chiếc xe trong cơn bão."
                disabled={loading}
              />
            </div>

            {/* Nút lưu (span 2 cột ở md+) */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full min-h-[44px] font-semibold rounded-lg shadow transition text-white ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Đang lưu..." : "Lưu Từ Mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVocabulary;

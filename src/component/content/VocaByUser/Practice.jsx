import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../../helper/api";
import { auth } from "../../../helper/firebase";

const Practice = () => {
  const user = auth.currentUser;

  // ---- STATE ----
  const [allItems, setAllItems] = useState([]); // danh sách toàn bộ từ (chỉ load 1 lần)
  const [questions, setQuestions] = useState([]); // danh sách câu hỏi hiện tại
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // số lượng từ cần luyện
  const [desired, setDesired] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("size");
    const n = Number(raw);
    return !raw || Number.isNaN(n) || n <= 0 ? 20 : n;
  });

  const [deleting, setDeleting] = useState(false);

  // ---- HÀM TRỢ GIÚP ----
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ---- TẠO DANH SÁCH CÂU HỎI ----
  const buildQuestions = (subset, fullPool) => {
    const viPool = fullPool.map((i) => i.vietnamese).filter(Boolean); // pool toàn bộ để làm nhiễu
    const raw = subset
      .map((it) => {
        const correct = it.vietnamese;
        const distractors = shuffle(
          viPool.filter((v) => v && v !== correct)
        ).slice(0, 3);
        const options = shuffle([correct, ...distractors]);
        return {
          id: String(it._id),
          english: it.english,
          createdByName: it.createdByName,
          createdById: it.createdById,
          correct,
          options,
          exampleEn: it.exampleEn || "",
          exampleVi: it.exampleVi || "",
        };
      })
      .filter((q) => q.id && q.english && q.correct && q.options?.length);
    return shuffle(raw);
  };

  const resetRun = () => {
    setIdx(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
  };

  // ---- TẠO CÂU HỎI TỪ LOCAL (KHÔNG GỌI API) ----
  const rebuildFromLocal = () => {
    if (!allItems.length) return;
    const subset = allItems.slice(0, Number(desired) || 1);
    const qs = buildQuestions(subset, allItems);
    setQuestions(qs);
    resetRun();
  };

  // ---- LẦN ĐẦU: GỌI API 1 LẦN ----
  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");
      // lấy nhiều hơn 1 chút (vd 200) để người dùng thoải mái chọn
      const res = await axios.get(`${api}/getRandomVocabularies`, {
        params: { size: 200 },
      });
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setAllItems(data);
      const subset = data.slice(0, desired);
      const qs = buildQuestions(subset, data);
      setQuestions(qs);
      resetRun();
    } catch (e) {
      console.error(e);
      setErr("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---- QUIZ LOGIC ----
  const current = useMemo(() => questions[idx], [questions, idx]);
  const isCorrect = (opt) => opt === current?.correct;
  const isLast = idx === questions.length - 1;

  const pick = (opt) => {
    if (!current || selected) return;
    setSelected(opt);
    setShowExplanation(true);

    if (opt === current.correct) {
      setScore((s) => s + 1);
    } else {
      // sai thì đẩy câu đó về cuối
      setQuestions((prev) => [...prev, current]);
    }
  };

  const next = () => {
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
      setSelected(null);
      setShowExplanation(false);
    }
  };

  const restart = () => {
    resetRun();
  };

  // ---- XỬ LÝ FORM GỬI ----
  const onSubmitDesired = (e) => {
    e.preventDefault();
    rebuildFromLocal(); // ❌ không gọi lại API
  };

  // ---- XOÁ TỪ ----
  const deleteVocabulary = async (voca, user) => {
    if (deleting) return;
    setDeleting(true);
    try {
      if (!voca?.id || !user?.uid) {
        alert("⚠️ Thiếu dữ liệu từ hoặc người dùng!");
        return;
      }
      const info = { id: voca.id, createdById: user.uid };
      const res = await axios.post(`${api}/deleteVocabulary`, info);
      if (res.status === 200 && res.data?.status !== false) {
        alert("✅ Xóa thành công!");
        window.location.reload();
      } else {
        alert(`⚠️ ${res.data?.message || "Không thể xóa từ!"}`);
      }
    } catch (err) {
      console.error("❌ Lỗi khi xóa từ:", err);
      alert("Có lỗi xảy ra khi xóa từ!");
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkAsLearned = async (current, userId) => {
    try {
      const res = await axios.post(`${api}/markAsMemorized`, {
        userId,
        vocabId: current.id,
      });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi đánh dấu từ này!");
    }
  };

  // ---- UI ----
  if (loading)
    return (
      <Shell>
        <Box>Đang tải dữ liệu…</Box>
      </Shell>
    );

  if (err)
    return (
      <Shell>
        <Box>
          <p className="text-red-600">{err}</p>
        </Box>
      </Shell>
    );

  if (!current)
    return (
      <Shell>
        <Box>
          <p className="text-gray-700">Không có câu hỏi nào.</p>
        </Box>
      </Shell>
    );

  return (
    <Shell>
      <Box>
        {/* Form nhập số lượng */}
        <form
          onSubmit={onSubmitDesired}
          className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4"
        >
          <label className="text-sm text-gray-700">Số lượng câu:</label>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="number"
              value={desired}
              onChange={(e) => setDesired(e.target.value)}
              className="flex-1 sm:w-24 border rounded-lg px-3 py-2"
              placeholder="VD: 50"
              min={1}
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Gửi
            </button>
          </div>
        </form>

        <div className="flex justify-end">
          <span className="text-sm text-gray-600">{user.displayName}</span>
        </div>

        {/* Tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Câu {idx + 1}/{questions.length}
            <button
              onClick={() => deleteVocabulary(current, user)}
              disabled={deleting}
              className="p-1 mx-1 bg-red-600 text-white text-[10px] rounded"
            >
              {deleting ? "Đang xóa..." : "Xóa từ"}
            </button>
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Điểm: {score}</span>
            {showExplanation && idx < questions.length - 1 && (
              <button
                onClick={next}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Câu tiếp theo
              </button>
            )}
          </div>
        </div>

        {/* Câu hỏi */}
        <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
          Nghĩa đúng của từ:{" "}
          <span className="text-blue-600 font-bold">
            {current.english
              ? current.english.charAt(0).toUpperCase() +
                current.english.slice(1)
              : ""}
          </span>{" "}
          <span className="text-[10px]">(by {current.createdByName})</span>
          <button
            onClick={() => handleMarkAsLearned(current, user.uid)}
            className="p-1 mx-1 bg-blue-600 text-white text-[10px] rounded"
          >
            Đã thuộc
          </button>
        </h3>

        {/* Đáp án */}
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={!!selected}
              className={[
                "text-left border rounded-lg px-4 py-2 sm:py-3 transition min-h-[44px]",
                "break-words",
                selected === opt
                  ? isCorrect(opt)
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700"
                  : selected && isCorrect(opt)
                  ? "bg-green-50 border-green-400"
                  : "hover:bg-blue-50",
              ].join(" ")}
            >
              <strong className="mr-1">{String.fromCharCode(65 + i)}.</strong>{" "}
              {opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : ""}
            </button>
          ))}
        </div>

        {/* Giải thích */}
        <div className="mt-6 space-y-2">
          <p className="text-gray-800">
            <strong>Câu ví dụ (EN):</strong> {current.exampleEn || "—"}
          </p>
          {showExplanation && (
            <>
              <p className="text-gray-800">
                <strong>Nghĩa đúng:</strong> {current.correct}
              </p>
              <p className="text-gray-600">
                <strong>Giải thích (VI):</strong> {current.exampleVi || "—"}
              </p>
              {selected !== current.correct && (
                <p className="text-red-600 text-sm italic">
                  ❌ Sai rồi — câu này sẽ xuất hiện lại ở cuối bài!
                </p>
              )}
            </>
          )}
        </div>

        {/* Điều hướng */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          {!showExplanation && (
            <button
              onClick={() => setShowExplanation(true)}
              className="w-full sm:w-auto text-blue-600 hover:underline"
            >
              Xem giải thích
            </button>
          )}
          {showExplanation && isLast && (
            <button
              onClick={restart}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900"
            >
              Làm lại (tập hiện tại)
            </button>
          )}
        </div>
      </Box>
    </Shell>
  );
};

// ----- COMPONENT KHUNG -----
const Shell = ({ children }) => (
  <div className="bg-gray-50">
    <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {children}
    </div>
  </div>
);

const Box = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">{children}</div>
);

export default Practice;

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../../helper/api";
import { auth } from "../../../helper/firebase";

const Practice = () => {

  const user = auth.currentUser;

  // ---- STATE CHÍNH ----
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [desired, setDesired] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("size");
    const n = Number(raw);
    return !raw || Number.isNaN(n) || n <= 0 ? 20 : n;
  });

  // ---- HÀM TRỢ GIÚP ----
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // TẠO DANH SÁCH CÂU HỎI
  const buildQuestions = (items, desiredCount) => {
    const viPool = items.map((i) => i.vietnamese).filter(Boolean);

    const raw = items
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

    return shuffle(raw).slice(0, Math.min(desiredCount, raw.length));
  };

  // GỌI API LẤY DỮ LIỆU
  const fetchData = async (n) => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${api}/getRandomVocabularies`, {
        params: { size: n },
      });
      const items = Array.isArray(res?.data?.data) ? res.data.data : [];
      const qs = buildQuestions(items, n);

      setQuestions(qs);
      setIdx(0);
      setSelected(null);
      setShowExplanation(false);
      setScore(0);
    } catch (e) {
      console.error(e);
      setErr("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // CHẠY LÚC ĐẦU TIÊN
  useEffect(() => {
    fetchData(desired);
  }, []);

  // ---- XỬ LÝ CHÍNH ----
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
      // Trả lời sai thì cho câu này xuất hiện lại cuối danh sách
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
    setIdx(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
  };

  const onSubmitDesired = async (e) => {
    e.preventDefault();
    const n = Number(desired);
    const safe = Number.isNaN(n) || n <= 0 ? 20 : n;
    await fetchData(safe);
  };

  const [deleting, setDeleting] = useState(false);

  const deleteVocabulary = async (voca, user) => {
    if (deleting) return; // tránh spam
    setDeleting(true);

    try {
      // 🧩 Kiểm tra dữ liệu
      if (!voca?.id || !user?.uid) {
        alert("⚠️ Thiếu dữ liệu từ vựng hoặc thông tin người dùng!");
        setDeleting(false);
        return;
      }

      // 📤 Gửi request tới API
      const info = { id: voca.id, createdById: user.uid };
      const res = await axios.post(`${api}/deleteVocabulary`, info, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("📦 Phản hồi BE:", res.data);

      // ✅ Thành công
      if (res.status === 200 && res.data?.status !== false) {
        alert("✅ Xóa từ vựng thành công!");
        window.location.reload();
      }
      else {
        alert(`⚠️ ${res.data?.message || "Không thể xóa từ vựng!"}`);
      }

    } catch (err) {
      // ❌ Lỗi phía server hoặc quyền
      console.error("❌ Lỗi khi xóa từ vựng:", err);

      const status = err.response?.status;
      const msg = err.response?.data?.message || "Lỗi khi xóa từ vựng!";

      if (status === 403) {
        alert("🚫 Bạn không có quyền xóa từ vựng này!");
      } else if (status === 404) {
        alert("❌ Không tìm thấy từ vựng cần xóa!");
      } else if (status === 400) {
        alert("⚠️ Thiếu dữ liệu gửi lên server!");
      } else {
        alert(`⚠️ ${msg}`);
      }

    } finally {
      // 🔄 Luôn reset trạng thái
      setDeleting(false);
    }
  };


  const handleMarkAsLearned = async (current, user) => {
    try {
      // 📨 Gửi request và đợi backend trả về kết quả
      const res = await axios.post(`${api}/markAsMemorized`, {
        userId: user,
        vocabId: current.id,
      });

      // 🧾 In ra response đầy đủ
      console.log("📩 Response từ server:", res.data);
      alert(res.data.message);
    } catch (err) {
      console.error("❌ Lỗi khi đánh dấu Đã thuộc:", err);
      alert("Có lỗi xảy ra khi đánh dấu từ này!");
    }
  };




  // ---- UI ----
  if (loading) return <Shell><Box>Đang tải dữ liệu…</Box></Shell>;
  if (err) return <Shell><Box><p className="text-red-600">{err}</p></Box></Shell>;
  if (!current)
    return (
      <Shell>
        <Box>

          <p className="text-gray-700">
            Không còn câu hỏi nào để luyện. Hãy nhập số mới để bắt đầu lại.
          </p>
        </Box>
      </Shell>
    );

  return (
    <Shell>
      <Box>
        <div>
          <form
            onSubmit={onSubmitDesired}
            className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4"
          >
            <label className="text-sm text-gray-700">Số lượng câu</label>
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
        </div>

        <div className="flex justify-end">
          <span className="text-sm text-gray-600">{user.displayName}</span>
        </div>
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
            {showExplanation && !isLast && (
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
          Chọn nghĩa đúng của từ:{" "}
          <span className="text-blue-600 font-bold">
            {current.english
              ? current.english.charAt(0).toUpperCase() + current.english.slice(1)
              : ""}
          </span>
          <span className="text-[10px]"> (by {current.createdByName})</span>


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
                  ❌ Bạn trả lời sai — Câu này sẽ xuất hiện lại ở cuối bài!
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

// ----- COMPONENT NHỎ -----


const Shell = ({ children }) => (
  <div className=" bg-gray-50">
    <div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {children}
    </div>
  </div>
);

const Box = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">{children}</div>
);

export default Practice;

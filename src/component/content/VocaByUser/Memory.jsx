import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { api } from "../../../helper/api";
import { auth } from "../../../helper/firebase";

const Memory = () => {
  const user = auth.currentUser;

  // ---- STATE ----
  const [mode, setMode] = useState("unmemorized");
  const [items, setItems] = useState([]); // toàn bộ danh sách vocab (theo mode)
  const [limit, setLimit] = useState(20);

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
    const viPool = fullPool.map((i) => i.vietnamese).filter(Boolean); // ❗ pool toàn bộ list
    const raw = subset
      .map((it) => {
        const correct = it.vietnamese;
        const distractors = shuffle(
          viPool.filter((v) => v && v !== correct)
        ).slice(0, 3); // chọn 3 nghĩa ngẫu nhiên khác nhau từ toàn bộ
        const options = shuffle([correct, ...distractors]);

        return {
          id: String(it._id),
          english: it.english,
          createdByName: it.createdByName,
          correct,
          options,
          exampleEn: it.exampleEn || "",
          exampleVi: it.exampleVi || "",
        };
      })
      .filter((q) => q.id && q.english && q.correct && q.options?.length);

    return shuffle(raw); // random thứ tự câu hỏi trong nhóm
  };

  const resetRun = () => {
    setIdx(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
  };

  const rebuildFromLocal = () => {
    const subset = (items || []).slice(0, Number(limit) || 1);
    const qs = buildQuestions(subset, items); // ✅ pool distractors lấy từ toàn bộ items
    setQuestions(qs);
    resetRun();
  };

  const fetchData = async (type) => {
    try {
      setLoading(true);
      setErr("");
      const res = await axios.get(`${api}/getAllVocabulariesByUser/${user.uid}`);
      console.log("Fetched vocabularies:", res.data);
      const data = res.data?.data || {};
      const base = type === "memorized" ? data.memorized : data.unmemorized;

      setItems(base || []);
      const subset = (base || []).slice(0, Number(limit) || 1);
      const qs = buildQuestions(subset, base || []);
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
    if (user?.uid) fetchData(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, user?.uid]);

  // ---- LOGIC QUIZ ----
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
      setQuestions((prev) => [...prev, current]); // sai -> đẩy về cuối
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

  // ---- MARK / UNMARK ----
  const handleMarkAsLearned = async (current, userId) => {
    try {
      const res = await axios.post(`${api}/markAsMemorized`, {
        userId,
        vocabId: current.id,
      });
      alert(res.data.message);
      fetchData(mode);
    } catch (err) {
      console.error("❌ Lỗi khi đánh dấu Đã thuộc:", err);
      alert("Có lỗi xảy ra khi đánh dấu từ này!");
    }
  };

  const handleUnmarkAsLearned = async (current, userId) => {
    try {
      const res = await axios.post(`${api}/unmarkAsMemorized`, {
        userId,
        vocabId: current.id,
      });
      alert(res.data.message);
      fetchData(mode);
    } catch (err) {
      console.error("❌ Lỗi khi bỏ đánh dấu:", err);
      alert("Có lỗi xảy ra khi bỏ đánh dấu từ này!");
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
          <HeaderBar
            mode={mode}
            setMode={setMode}
            limit={limit}
            setLimit={setLimit}
            total={items.length}
            onApply={rebuildFromLocal}
          />
          <p className="text-gray-700 mt-4">
            Không có câu hỏi nào trong chế độ này.
          </p>
        </Box>
      </Shell>
    );

  return (
    <Shell>
      <Box>
        {/* Thanh chọn chế độ + nhập số lượng + Gửi */}
        <HeaderBar
          mode={mode}
          setMode={setMode}
          limit={limit}
          setLimit={setLimit}
          total={items.length}
          onApply={rebuildFromLocal}
        />

        {/* Tiêu đề */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Câu {idx + 1}/{questions.length}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Đang luyện: {questions.length} từ · Điểm: {score}
            </span>
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
          Nghĩa đúng của từ:{" "}
          <span className="text-blue-600 font-bold">
            {current.english?.charAt(0).toUpperCase() + current.english?.slice(1)}
          </span>
          {mode === "unmemorized" ? (
            <button
              onClick={() => handleMarkAsLearned(current, user.uid)}
              className="p-1 mx-1 bg-blue-600 text-white text-[10px] rounded"
            >
              ✅ Đã thuộc
            </button>
          ) : (
            <button
              onClick={() => handleUnmarkAsLearned(current, user.uid)}
              className="p-1 mx-1 bg-yellow-600 text-white text-[10px] rounded"
            >
              ❌ Chưa thuộc
            </button>
          )}
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
                  ❌ Sai rồi — Câu này sẽ xuất hiện lại ở cuối bài!
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

// ----- COMPONENT PHỤ: Thanh điều khiển đầu trang -----
const HeaderBar = ({ mode, setMode, limit, setLimit, total, onApply }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
    <div className="flex gap-2">
      <button
        onClick={() => setMode("unmemorized")}
        className={`px-4 py-2 rounded-lg text-sm ${
          mode === "unmemorized"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        Học từ chưa thuộc
      </button>
      <button
        onClick={() => setMode("memorized")}
        className={`px-4 py-2 rounded-lg text-sm ${
          mode === "memorized"
            ? "bg-green-600 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        Ôn từ đã thuộc
      </button>
    </div>

    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Số lượng từ:</label>
      <input
        type="number"
        min={1}
        max={Math.max(1, total || 1)}
        value={limit}
        onChange={(e) => {
          const v = Number(e.target.value);
          setLimit(Number.isFinite(v) ? v : 20);
        }}
        onKeyDown={(e) => e.key === "Enter" && onApply()}
        className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="20"
      />
      <button
        onClick={onApply}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
        title={`Hiện có ${total ?? 0} từ trong danh sách`}
        disabled={!total}
      >
        Gửi
      </button>
    </div>
  </div>
);

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

export default Memory;

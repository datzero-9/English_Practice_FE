import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { api } from "../../helper/api";

/**
 * Practice (responsive + không hiển thị tổng số từ)
 * - Nhập n -> GET ${api}/getRandomVocabularies?size=n
 * - FE random thứ tự câu + 4 đáp án (1 đúng + 3 sai)
 * - Không lặp từ đã hỏi (_id trong seenIds); nghĩa VI của từ đã hỏi vẫn dùng làm nhiễu
 * - Gửi số lượng mới: reset & clear seenIds
 */

const Practice = () => {
  // ---- state chính ----
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // số lượng mong muốn (mặc định lấy từ ?size= nếu có, không thì 20)
  const [desired, setDesired] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get("size");
    const n = Number(raw);
    return !raw || Number.isNaN(n) || n <= 0 ? 20 : n;
  });

  // Track các _id đã hỏi (để không hỏi lại)
  const seenIdsRef = useRef(new Set());

  // ---- helpers ----
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Xây câu hỏi (loại item đã seen; viPool dùng cả seen & unseen)
  const buildQuestions = (itemsFromBE, desiredCount) => {
    const seen = seenIdsRef.current;
    const viPool = itemsFromBE.map((i) => i.vietnamese).filter(Boolean);

    const candidates = itemsFromBE.filter((it) => it?._id && !seen.has(String(it._id)));

    const raw = candidates
      .map((it) => {
        const correct = it.vietnamese;
        const distractors = shuffle(
          viPool.filter((v) => v && v !== correct)
        ).slice(0, 3);
        const options = shuffle([correct, ...distractors]).slice(0, 4);
        return {
          id: String(it._id),
          english: it.english,
          correct,
          options,
          exampleEn: it.exampleEn || "",
          exampleVi: it.exampleVi || "",
        };
      })
      .filter((q) => q.id && q.english && q.correct && q.options?.length);

    return shuffle(raw).slice(0, Math.min(desiredCount || 0, raw.length));
  };

  // ---- API ----
  const fetchData = async (n) => {
    try {
      setLoading(true);
      setErr("");

      const res = await axios.get(`${api}/getRandomVocabularies`, { params: { size: n } });
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

  // ---- effects ----
  useEffect(() => {
    fetchData(desired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- handlers ----
  const current = useMemo(() => questions[idx], [questions, idx]);
  const isCorrect = (opt) => opt === current?.correct;
  const isLast = idx === questions.length - 1;

  const pick = (opt) => {
    if (!current || selected) return;
    setSelected(opt);
    setShowExplanation(true);
    if (opt === current.correct) setScore((s) => s + 1);
    if (current.id) seenIdsRef.current.add(current.id); // đánh dấu đã hỏi
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

  // Gửi số lượng mới: reset + clear seenIds
  const onSubmitDesired = async (e) => {
    e.preventDefault();
    const n = Number(desired);
    const safe = Number.isNaN(n) || n <= 0 ? 20 : n;
    seenIdsRef.current = new Set(); // xóa lịch sử
    await fetchData(safe);
  };

  // ---- UI trạng thái ----
  if (loading) return <Shell><Box>Đang tải dữ liệu…</Box></Shell>;
  if (err) return <Shell><Box><p className="text-red-600">{err}</p></Box></Shell>;
  if (!current) {
    return (
      <Shell>
        <Box>
          <form onSubmit={onSubmitDesired} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <label className="text-sm text-gray-700">Số lượng muốn lấy</label>
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

          <p className="text-gray-700">
            Không còn câu hỏi nào để luyện (hoặc số lượng yêu cầu vượt dữ liệu chưa dùng). Hãy nhập số mới để bắt đầu lại.
          </p>
        </Box>
      </Shell>
    );
  }

  return (
    <Shell>
      <Box>
        {/* Form nhập số lượng (responsive) */}
        <form onSubmit={onSubmitDesired} className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <label className="text-sm text-gray-700">Số lượng muốn lấy</label>
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

        {/* Header: Câu x/y + Điểm + Câu tiếp theo (responsive) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Câu {idx + 1}/{questions.length}
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
          <span className="text-blue-600 break-words">{current.english}</span>
        </h3>

        {/* Lựa chọn đáp án (full width trên mobile) */}
        <div className="grid grid-cols-1 gap-2 sm:gap-3">
          {current.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(opt)}
              disabled={!!selected}
              className={[
                "text-left border rounded-lg px-4 py-2 sm:py-3 transition min-h-[44px]",
                "break-words", // xuống dòng nếu dài
                selected === opt
                  ? isCorrect(opt)
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700"
                  : selected && isCorrect(opt)
                  ? "bg-green-50 border-green-400"
                  : "hover:bg-blue-50",
              ].join(" ")}
            >
              <strong className="mr-1">{String.fromCharCode(65 + i)}.</strong> {opt}
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
            </>
          )}
        </div>

        {/* Điều hướng dưới (mobile-friendly) */}
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

/* Lớp vỏ: đảm bảo padding, safe area và canh giữa theo màn hình */
const Shell = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-screen-md lg:max-w-screen-lg px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {children}
    </div>
  </div>
);

/* Hộp khung nội dung */
const Box = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">{children}</div>
);

export default Practice;

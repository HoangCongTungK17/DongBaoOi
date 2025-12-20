import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSosRequest } from "../Redux/SOS/Action";
import { getSafetyTips } from "../Redux/SafetyTips/Action"; // Cần import action này
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Send, Loader2, Info } from "lucide-react";

// Danh sách khớp với Backend
const disasterTypes = [
  "LŨ LỤT", "ĐỘNG ĐẤT", "SẠT LỞ ĐẤT", "BÃO/SIÊU BÃO",
  "HỐ SỤT ĐẤT", "TRIỀU CƯỜNG", "CHÁY RỪNG", "MƯA ĐÁ", "CHÁY NHÀ"
];

function ReportPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Lấy dữ liệu từ Store
  const safetyTipStore = useSelector((store) => store.safetyTipStore); // Giả định bạn đã có Reducer này
  
  const [form, setForm] = useState({
    message: "",
    disasterType: "",
  });
  const [loading, setLoading] = useState(false);

  // Khi người dùng chọn loại thảm họa, gọi API lấy hướng dẫn an toàn tương ứng
  useEffect(() => {
    if (form.disasterType) {
      // Gọi action lấy safety tips (Bạn cần đảm bảo đã tạo action này trong Redux)
      // dispatch(getSafetyTips(form.disasterType)); 
      // *Lưu ý: Nếu chưa có Redux cho SafetyTip, phần hiển thị bên dưới sẽ tạm ẩn*
    }
  }, [form.disasterType, dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.message || !form.disasterType) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị!");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const reqData = {
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        dispatch(createSosRequest(reqData))
          .then(() => {
            toast.success("Đã gửi SOS! Hãy giữ an toàn.");
            navigate("/sos");
          })
          .catch(() => toast.error("Lỗi gửi tin."))
          .finally(() => setLoading(false));
      },
      () => {
        toast.error("Không thể lấy vị trí. Hãy bật GPS.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 justify-center">
      
      {/* Cột Trái: Form Báo Cáo */}
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center lg:justify-start gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            Báo cáo Khẩn cấp
          </h1>
          <p className="mt-2 text-slate-400">
            Gửi yêu cầu SOS kèm vị trí của bạn ngay lập tức.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300">Loại thảm họa</label>
              <select
                name="disasterType"
                value={form.disasterType}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-red-500"
              >
                <option value="">-- Chọn loại --</option>
                {disasterTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Mô tả tình huống</label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn tình trạng của bạn..."
                className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-8 py-4 text-lg font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
              GỬI YÊU CẦU CỨU TRỢ
            </button>
          </form>
        </div>
      </div>

      {/* Cột Phải: Hướng dẫn an toàn (Hiển thị khi chọn thảm họa) */}
      {form.disasterType && (
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-10 duration-500">
          <div className="rounded-2xl border border-blue-900/50 bg-blue-950/20 p-6">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-400 mb-4">
              <Info className="h-5 w-5" />
              Lời khuyên an toàn: {form.disasterType}
            </h3>
            
            {/* Nội dung tĩnh giả lập (sẽ thay bằng dữ liệu API thật) */}
            <ul className="space-y-3 text-slate-300 text-sm">
               {/* Logic: Mapping data từ safetyTipStore hoặc hiển thị mặc định */}
               <li className="flex gap-2">
                 <span className="text-blue-500 font-bold">•</span>
                 Giữ bình tĩnh và tìm nơi trú ẩn an toàn ngay lập tức.
               </li>
               <li className="flex gap-2">
                 <span className="text-blue-500 font-bold">•</span>
                 Ngắt nguồn điện và gas để phòng tránh cháy nổ.
               </li>
               <li className="flex gap-2">
                 <span className="text-blue-500 font-bold">•</span>
                 Lắng nghe thông báo từ chính quyền địa phương qua radio/loa.
               </li>
               <li className="flex gap-2">
                 <span className="text-blue-500 font-bold">•</span>
                 Không cố gắng di chuyển qua vùng nước chảy xiết hoặc khu vực sạt lở.
               </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createSosRequest } from "../../Redux/SOS/Action";
import { toast } from "sonner";
import { X, AlertTriangle, Send, MapPin, Loader2 } from "lucide-react";

const disasterTypes = [
  "LŨ LỤT",
  "ĐỘNG ĐẤT",
  "SẠT LỞ ĐẤT",
  "BÃO/SIÊU BÃO",
  "HỐ SỤT ĐẤT",
  "TRIỀU CƯỜNG",
  "CHÁY RỪNG",
  "MƯA ĐÁ",
  "CHÁY NHÀ",
  "KHÔNG XÁC ĐỊNH"
];

const AddSosModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    message: "",
    disasterType: "",
  });

  const handleClose = () => {
    setForm({ message: "", disasterType: "" });
    onClose();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.message || !form.disasterType) {
      toast.error("Vui lòng nhập đầy đủ thông tin (Loại thảm họa & Mô tả).");
      return;
    }

    setLoading(true);

    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        const reqData = {
          message: form.message,
          disasterType: form.disasterType,
          latitude: latitude,
          longitude: longitude,
        };

        dispatch(createSosRequest(reqData))
          .then(() => {
            toast.success("Đã gửi yêu cầu SOS thành công!");
            handleClose();
          })
          .catch(() => {
            toast.error("Gửi thất bại. Vui lòng thử lại.");
          })
          .finally(() => {
            setLoading(false);
          });
      },
      (error) => {
        console.error("Lỗi GPS:", error);
        toast.error("Không thể lấy vị trí. Hãy bật GPS và thử lại.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!open) return null;

  return (
    // --- SỬA ĐỔI QUAN TRỌNG TẠI ĐÂY: Thay z-50 thành z-[9999] ---
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/30 ring-1 ring-red-500/50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gửi tín hiệu SOS</h3>
              <p className="text-xs text-slate-400">Hỗ trợ khẩn cấp 24/7</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Loại sự cố / Thảm họa</label>
            <div className="relative">
              <select
                name="disasterType"
                value={form.disasterType}
                onChange={handleChange}
                className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
              >
                <option value="" disabled className="text-slate-500">-- Chọn loại sự cố --</option>
                {disasterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mô tả tình huống</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Ví dụ: Nước dâng cao, nhà có người già, cần thuốc men..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-blue-900/10 p-3 text-xs text-blue-400 ring-1 ring-blue-900/30">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Hệ thống sẽ tự động lấy <strong>tọa độ GPS chính xác</strong> của thiết bị khi bạn bấm gửi. Vui lòng cấp quyền truy cập vị trí.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-1/3 rounded-xl border border-slate-700 bg-transparent py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Hủy bỏ
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang định vị & gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  GỬI YÊU CẦU NGAY
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddSosModal;
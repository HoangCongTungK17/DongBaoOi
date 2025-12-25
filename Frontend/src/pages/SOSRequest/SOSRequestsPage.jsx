import React, { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Activity,
  CircleDot,
  Waves,
  AlertTriangle,
  MapPin,
  Info,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Mountain,
  Wind,
  Flame,
  CloudRain,
  Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import AddSosModal from "./AddSosModal.jsx";
import { useGetSosRequestsQuery, useUpdateSosStatusMutation } from "../../Redux/apiSlice";

// --- Cấu hình Icon Marker ---
const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const yellowIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const greenIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const blueIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const statusToIcon = (status) => {
  switch (status) {
    case "PENDING": return redIcon;
    case "HANDLING": return yellowIcon;
    case "COMPLETED": return greenIcon;
    case "CANCELLED": return blueIcon;
    default: return redIcon;
  }
};

const statusBadge = (status) => {
  const map = {
    PENDING: "bg-red-900/30 text-red-300 ring-red-700/40",
    HANDLING: "bg-yellow-900/30 text-yellow-300 ring-yellow-700/40",
    COMPLETED: "bg-green-900/30 text-green-300 ring-green-700/40",
    CANCELLED: "bg-blue-900/30 text-blue-300 ring-blue-700/40",
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${map[status] || ""}`;
};

const riskBadge = (level) => {
  const map = {
    HIGH: "bg-red-900/30 text-red-300 ring-red-700/40",
    MEDIUM: "bg-yellow-900/30 text-yellow-300 ring-yellow-700/40",
    LOW: "bg-green-900/30 text-green-300 ring-green-700/40",
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
    map[level] || "bg-slate-800 text-slate-300 ring-slate-700"
  }`;
};

const disasterIcon = (type) => {
  switch (type) {
    case "LŨ LỤT": return <Droplets className="h-4 w-4 text-blue-400" />;
    case "BÃO/SIÊU BÃO": return <Wind className="h-4 w-4 text-slate-400" />;
    case "CHÁY NHÀ": return <Flame className="h-4 w-4 text-orange-500" />;
    case "CHÁY RỪNG": return <Flame className="h-4 w-4 text-red-600" />;
    case "MƯA ĐÁ": return <CloudRain className="h-4 w-4 text-cyan-300" />;
    case "SẠT LỞ ĐẤT": return <Mountain className="h-4 w-4 text-yellow-600" />;
    case "ĐỘNG ĐẤT": return <Activity className="h-4 w-4 text-amber-700" />;
    case "HỐ SỤT ĐẤT": return <CircleDot className="h-4 w-4 text-slate-500" />;
    case "TRIỀU CƯỜNG": return <Waves className="h-4 w-4 text-blue-700" />;
    default: return <Info className="h-4 w-4 text-slate-300" />;
  }
};

export default function SOSRequestsPage() {
  const { isAdmin } = useSelector((store) => store.authStore);
  
  // 1. LUÔN KHAI BÁO TẤT CẢ HOOKS Ở TRÊN CÙNG (KHÔNG ĐƯỢC CÓ RETURN Ở TRÊN)
  const { data: rawSos = [], isLoading, isError, isFetching, refetch } = useGetSosRequestsQuery();
  const [updateSosStatusMutation] = useUpdateSosStatusMutation();
  const [localStatus, setLocalStatus] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [zoneNameFilter, setZoneNameFilter] = useState("");
  const [zoneIdFilter, setZoneIdFilter] = useState("");

  // 2. XỬ LÝ DỮ LIỆU BẰNG useMemo (Phải nằm trên các lệnh return điều kiện)
  const sos = useMemo(() => {
    // Kiểm tra an toàn nếu rawSos không phải là mảng
    if (!Array.isArray(rawSos)) return [];
    
    return rawSos.map((r) => ({
      id: r.id,
      userId: r.user_id || r.userId || "Unknown",
      message: r.message,
      latitude: r.latitude,
      longitude: r.longitude,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      status: r.sosStatus,
      zoneId: r.disasterZoneDto?.id || null,
      zoneName: r.disasterZoneDto?.name || "No Zone",
      disasterType: r.disasterType || r.disasterZoneDto?.disasterType || "UNKNOWN",
      dangerLevel: r.disasterZoneDto?.dangerLevel || "N/A",
    }));
  }, [rawSos]);

  // 3. SAU KHI GỌI HẾT HOOKS MỚI ĐƯỢC PHÉP DÙNG LỆNH RETURN ĐIỀU KIỆN
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-semibold">Lỗi 403: Không có quyền truy cập hoặc Token hết hạn.</p>
          <p className="text-sm text-slate-400">Vui lòng đăng xuất và đăng nhập lại.</p>
          <button 
            onClick={() => refetch()} 
            className="rounded-md bg-indigo-600 px-6 py-2 hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Modal logic  
  const handleCloseModal = () => {
    setShowAddModal(false);
    refetch(); // Làm mới dữ liệu sau khi thêm
  };

  // Filters State
  const statuses = ["PENDING", "COMPLETED", "HANDLING", "CANCELLED"];
  const typeOptions = ["", "LŨ LỤT", "ĐỘNG ĐẤT", "SẠT LỞ ĐẤT", "BÃO/SIÊU BÃO", "HỐ SỤT ĐẤT", "TRIỀU CƯỜNG", "CHÁY RỪNG", "MƯA ĐÁ", "CHÁY NHÀ", "KHÔNG XÁC ĐỊNH"];


  const hasZoneFilter = zoneNameFilter.trim() !== "" || zoneIdFilter.trim() !== "";

  const filtered = useMemo(
    () =>
      (sos || []).filter((r) => {
        const matchesZoneName = !zoneNameFilter || (r.zoneName || "").toLowerCase().includes(zoneNameFilter.toLowerCase());
        const matchesZoneId = !zoneIdFilter || String(r.zoneId || "") === zoneIdFilter.trim();

        if (zoneNameFilter && !matchesZoneName) return false;
        if (zoneIdFilter && !matchesZoneId) return false;

        const matchesType = hasZoneFilter ? true : !typeFilter || r.disasterType === typeFilter;
        const matchesStatus = !statusFilter || r.status === statusFilter;

        return matchesType && matchesStatus;
      }),
    [sos, typeFilter, statusFilter, zoneNameFilter, zoneIdFilter, hasZoneFilter]
  );

  // Pagination
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, zoneNameFilter, zoneIdFilter]);
  const paginated = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page]);

  // Functions
  const handleUpdateStatus = async (id, next) => {
    try {
      if (!isAdmin) {
        toast.error("Chỉ quản trị viên mới có quyền cập nhật");
        return;
      }
      
      // Optimistic Update
      setLocalStatus((prev) => ({ ...prev, [id]: next }));
      
      await updateSosStatusMutation({ id, status: next }).unwrap();
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      setLocalStatus((prev) => ({ ...prev, [id]: undefined })); // Rollback
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setZoneNameFilter("");
    setZoneIdFilter("");
  };

  // Analytics
  const byStatus = useMemo(() => statuses.map((s) => ({ name: s, value: filtered.filter((r) => r.status === s).length })), [filtered]);
  const statusTotal = byStatus.reduce((sum, s) => sum + s.value, 0) || 1;
  const statusBarData = byStatus.map((s) => ({ name: s.name, count: s.value, pct: Math.round((s.value / statusTotal) * 100) }));

  // Color mapping
  const barColorForStatus = (name) => ({ PENDING: "#ef4444", HANDLING: "#f59e0b", COMPLETED: "#10b981", CANCELLED: "#3b82f6" }[name] || "#94a3b8");

  // Loading View
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Yêu cầu SOS</h1>
            <p className="mt-1 text-sm text-slate-400">Xem tất cả các yêu cầu SOS trên toàn Việt Nam</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tải lại"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 shadow hover:bg-slate-700"
            >
              Thêm yêu cầu
            </button>
            <AddSosModal open={showAddModal} onClose={handleCloseModal} />
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
                value={zoneNameFilter}
                onChange={(e) => setZoneNameFilter(e.target.value)}
                placeholder="Tên khu vực"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <input
                value={zoneIdFilter}
                onChange={(e) => setZoneIdFilter(e.target.value)}
                placeholder="ID khu vực"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
            />
            <select
              value={hasZoneFilter ? "" : typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              disabled={hasZoneFilter}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none"
            >
              <option value="">Tất cả loại thảm họa</option>
              {typeOptions.filter(t => t !== "").map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none"
            >
                <option value="">Tất cả trạng thái</option>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={clearFilters} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                Đặt lại
            </button>
          </div>
        </section>

        {/* Map section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-4">
          <h2 className="text-slate-100 text-xl font-bold mb-3 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-400" /> Bản đồ cứu trợ
          </h2>
          <div className="h-[520px] rounded-lg overflow-hidden">
            <MapContainer center={[14.0583, 108.2772]} zoom={7} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              {filtered.map((r) => (
                <Marker key={r.id} position={[r.latitude, r.longitude]} icon={statusToIcon(localStatus[r.id] || r.status)}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{r.message}</div>
                      <div className="text-slate-700">Trạng thái: {localStatus[r.id] || r.status}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* List of SOS Requests */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-4">
          <h2 className="text-slate-100 text-xl font-bold mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-400" /> Danh sách yêu cầu
          </h2>
          <div className="space-y-3">
            {paginated.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-100 text-sm font-semibold">
                      {disasterIcon(r.disasterType)} <span>{r.message}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{r.zoneName} • {new Date(r.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={statusBadge(localStatus[r.id] || r.status)}>{localStatus[r.id] || r.status}</span>
                    {isAdmin && (
                        <select
                        value={localStatus[r.id] || r.status}
                        onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none"
                        >
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-slate-400 disabled:opacity-30">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-slate-300">Trang {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-slate-400 disabled:opacity-30">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
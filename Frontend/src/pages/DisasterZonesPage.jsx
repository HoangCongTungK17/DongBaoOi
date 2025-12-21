import React, { useEffect, useMemo, useState, useRef } from "react";
// --- [BẮT ĐẦU SỬA ĐỔI]: Thêm import cần thiết cho Map tương tác ---
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from "react-leaflet";
import { Plus, X, Pencil, Trash2, Filter, ChevronLeft, ChevronRight, Eye, MapPin, Search, Loader2, Crosshair, Target } from "lucide-react";
// --- [KẾT THÚC SỬA ĐỔI] ---
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDispatch, useSelector } from "react-redux";
import { createDisasterZone, deleteDisasterZone, getAllDisasterZones, udpateDisasterZone } from "../Redux/DisasterZone/Action.js";
import { toast } from "sonner";
import RestrictedButton from "../components/RestrictedButton.jsx";

// Ensure Leaflet default marker icons render in bundlers
function useLeafletDefaultIcon() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

const dangerBadgeClass = (level) => {
  const map = {
    HIGH: "bg-red-900/30 text-red-300 ring-red-700/40",
    MEDIUM: "bg-yellow-900/30 text-yellow-300 ring-yellow-700/40",
    LOW: "bg-green-900/30 text-green-300 ring-green-700/40",
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
    map[level] || "bg-slate-800 text-slate-300 ring-slate-700"
  }`;
};

const circleStyleForDanger = (level) => {
  switch (level) {
    case "HIGH": return { color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.3 };
    case "MEDIUM": return { color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.25 };
    case "LOW": return { color: "#10b981", fillColor: "#10b981", fillOpacity: 0.2 };
    default: return { color: "#64748b", fillColor: "#64748b", fillOpacity: 0.2 };
  }
};

// --- [BẮT ĐẦU SỬA ĐỔI]: CÁC COMPONENT HỖ TRỢ CHO FORM MAP MỚI ---

// 1. Tự động bay map đến tọa độ mới
function MapViewUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// 2. Marker có thể kéo thả (Draggable)
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setPosition(lat, lng);
        }
      },
    }), [setPosition]);

  return <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} />;
}

// 3. Xử lý sự kiện click vào bản đồ
function MapEventsHandler({ onLocationChange }) {
  useMapEvents({ click(e) { onLocationChange(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// 4. BỘ CHỌN VỊ TRÍ THÔNG MINH (Search + Map + Drag)
function SmartLocationPicker({ lat, lng, radius, dangerLevel, onLocationChange }) {
  useLeafletDefaultIcon();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const mapCenter = (lat && lng && !isNaN(lat) && !isNaN(lng)) ? [lat, lng] : [16.0471, 108.2068];
  const hasValidCoords = lat && lng && !isNaN(lat) && !isNaN(lng);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        onLocationChange(parseFloat(result.lat), parseFloat(result.lon));
        toast.success(`Đã tìm thấy: ${result.display_name.split(",")[0]}`);
      } else {
        toast.error("Không tìm thấy địa điểm này.");
      }
    } catch (error) {
      toast.error("Lỗi kết nối bản đồ.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Thanh tìm kiếm */}
      <div className="flex gap-2">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập địa danh (VD: Hồ Gươm)..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 pl-9 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
         </div>
         <button 
           type="button" 
           onClick={handleSearch} 
           disabled={isSearching} 
           className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50 transition-all flex items-center gap-2"
         >
           {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm"}
         </button>
      </div>

      {/* Bản đồ */}
      <div className="relative flex-1 min-h-[300px] w-full overflow-hidden rounded-xl border border-slate-700 shadow-inner">
        <MapContainer center={mapCenter} zoom={hasValidCoords ? 13 : 5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapViewUpdater center={mapCenter} />

          {hasValidCoords && (
             <>
               <DraggableMarker position={mapCenter} setPosition={onLocationChange} />
               <Circle center={mapCenter} radius={(parseFloat(radius) || 0) * 1000} pathOptions={circleStyleForDanger(dangerLevel)} />
             </>
          )}

          <MapEventsHandler onLocationChange={onLocationChange} />
        </MapContainer>
        
        {/* Overlay hướng dẫn */}
        <div className="absolute bottom-3 right-3 z-[999] bg-slate-900/90 backdrop-blur px-3 py-2 text-xs text-slate-300 rounded-lg border border-slate-700 shadow-xl flex flex-col gap-1">
           <span className="flex items-center gap-2"><MapPin className="h-3 w-3 text-red-500" /> Kéo thả marker để chọn tâm</span>
        </div>
      </div>
    </div>
  );
}
// --- [KẾT THÚC SỬA ĐỔI COMPONENT] ---

function MiniZoneMap({ lat, lng, radiusKm = 5, dangerLevel = "LOW" }) {
  useLeafletDefaultIcon();
  const position = [lat, lng];
  return (
    <div className="h-40 w-full overflow-hidden rounded-lg relative z-0">
      <MapContainer center={position} zoom={8} scrollWheelZoom={false} className="h-full w-full" style={{ zIndex: 1 }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          subdomains={["a", "b", "c"]}
        />
        <Marker position={position} />
        <Circle center={position} radius={radiusKm * 1000} pathOptions={circleStyleForDanger(dangerLevel)} />
      </MapContainer>
    </div>
  );
}

// --- [SỬA ĐỔI]: Modal được style lại rộng hơn để chứa map ---
function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            {children}
        </div>

        {footer && <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-slate-100 h-10 w-10 text-slate-300 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border h-10 w-10 ${
              page === currentPage
                ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                : "bg-slate-900 hover:bg-slate-800 hover:text-slate-100 border-slate-700 text-slate-300"
            } ${page === "..." ? "cursor-default" : "cursor-pointer"}`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-slate-100 h-10 w-10 text-slate-300 disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
  );
}

function DisasterZonesPage() {
  useLeafletDefaultIcon();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const disasterStore = useSelector((store) => store.disasterStore);
  const { isAdmin } = useSelector((store) => store.authStore);

  useEffect(() => {
    dispatch(getAllDisasterZones());
  }, [dispatch]);

  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (disasterStore?.allZones) {
      setZones(disasterStore.allZones);
    }
  }, [disasterStore.allZones]);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dangerFilter, setDangerFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeZone, setActiveZone] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    disasterType: "Lũ lụt",
    dangerLevel: "LOW",
    centerLatitude: "",
    centerLongitude: "",
    radius: "",
  });

  // --- [BẮT ĐẦU SỬA ĐỔI]: Hàm xử lý khi chọn vị trí trên Map ---
  const handleLocationChange = (lat, lng) => {
    // Làm tròn 6 số để gọn gàng nhưng vẫn chính xác
    setForm(prev => ({
      ...prev,
      centerLatitude: lat.toFixed(6),
      centerLongitude: lng.toFixed(6)
    }));
  };
  // --- [KẾT THÚC SỬA ĐỔI] ---

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const matchesSearch = z.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || z.disasterType === typeFilter;
      const matchesDanger = !dangerFilter || z.dangerLevel === dangerFilter;
      return matchesSearch && matchesType && matchesDanger;
    });
  }, [zones, search, typeFilter, dangerFilter]);

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, endIndex);

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setDangerFilter("");
    setCurrentPage(1);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, dangerFilter]);

  function openAdd() {
    setForm({ name: "", disasterType: "Lũ lụt", dangerLevel: "LOW", centerLatitude: "", centerLongitude: "", radius: "5" });
    setIsAddOpen(true);
  }
  function openEdit(zone) {
    setActiveZone(zone);
    setForm({
      name: zone.name,
      disasterType: zone.disasterType,
      dangerLevel: zone.dangerLevel,
      centerLatitude: String(zone.centerLatitude),
      centerLongitude: String(zone.centerLongitude),
      radius: String(zone.radius),
    });
    setIsEditOpen(true);
  }
  function openDelete(zone) {
    setActiveZone(zone);
    setIsDeleteOpen(true);
  }

  function handleSave() {
    // Validation
    if(!form.centerLatitude || !form.centerLongitude) {
        toast.error("Vui lòng chọn vị trí trên bản đồ hoặc nhập tọa độ!");
        return;
    }

    const newZone = {
      name: form.name.trim() || "Khu vực mới",
      disasterType: form.disasterType,
      dangerLevel: form.dangerLevel,
      centerLatitude: parseFloat(form.centerLatitude) || 0,
      centerLongitude: parseFloat(form.centerLongitude) || 0,
      radius: parseFloat(form.radius) || 1,
    };
    dispatch(createDisasterZone(newZone))
      .then(() => {
        dispatch(getAllDisasterZones());
        toast.success(`Khu vực "${newZone.name}" created successfully`);
        setIsAddOpen(false);
      })
      .catch((err) => {
        toast.error("Tạo khu vực thất bại. Vui lòng thử lại");
      });
  }

  function handleUpdate() {
    if (!activeZone) return;
    const updatedZone = {
      name: form.name.trim() || activeZone.name,
      disasterType: form.disasterType,
      dangerLevel: form.dangerLevel,
      centerLatitude: parseFloat(form.centerLatitude) || activeZone.centerLatitude,
      centerLongitude: parseFloat(form.centerLongitude) || activeZone.centerLongitude,
      radius: parseFloat(form.radius) || activeZone.radius,
    };

    dispatch(udpateDisasterZone({ zoneData: updatedZone, id: activeZone.id }))
      .then(() => {
        dispatch(getAllDisasterZones());
        toast.success(`Khu vực "${updatedZone.name}" updated successfully`);
        setIsEditOpen(false);
      })
      .catch((err) => {
        toast.error("Cập nhật khu vực thất bại. Vui lòng thử lại");
      });
  }

  function handleDelete() {
    if (!activeZone) return;
    dispatch(deleteDisasterZone(activeZone.id))
      .then(() => {
        dispatch(getAllDisasterZones());
        toast.success("Xóa khu vực thành công");
        setIsDeleteOpen(false);
      })
      .catch((error) => {
        toast.error("Xóa khu vực thất bại. Vui lòng thử lại");
      });
  }

  const typeOptions = ["", "LŨ LỤT", "ĐỘNG ĐẤT", "SẠT LỞ ĐẤT", "BÃO/SIÊU BÃO", "HỐ SỤT ĐẤT", "TRIỀU CƯỜNG", "CHÁY RỪNG", "MƯA ĐÁ", "CHÁY NHÀ", "KHÔNG XÁC ĐỊNH"];
  const dangerOptions = ["", "LOW", "MEDIUM", "HIGH"];

 

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Quản lí khu vực thảm họa</h1>
              <p className="mt-1 text-sm text-slate-400">Xem và quản lý các khu vực thảm họa</p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 shadow-lg p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <label className="sr-only">Tìm kiếm theo tên khu vực</label>
              <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus-within:ring-2 focus-within:ring-indigo-600">
                <Filter className="mr-2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên khu vực"
                  className="w-full bg-transparent outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            {/* ... Filters giữ nguyên ... */}
            <div>
              <label className="sr-only">Lọc theo loại thảm họa</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                {typeOptions.map((opt) => (<option key={opt} value={opt} className="bg-slate-900">{opt || "Lọc theo loại thảm họa"}</option>))}
              </select>
            </div>
            <div>
              <label className="sr-only">Lọc theo mức độ nguy hiểm</label>
              <select value={dangerFilter} onChange={(e) => setDangerFilter(e.target.value)} className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600">
                {dangerOptions.map((opt) => (<option key={opt} value={opt} className="bg-slate-900">{opt || "Lọc theo mức độ nguy hiểm"}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetFilters} className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Làm mới bộ lọc</button>
            </div>

            {isAdmin && (
              <div className="flex items-center justify-end lg:col-span-1">
                <button
                  onClick={openAdd}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Plus className="h-4 w-4" /> Khu vực mới
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Zones Grid */}
        {disasterStore?.allZonesError && <p className="text-red-500 text-center">Có lỗi xảy ra! Vui lòng làm mới trang</p>}
        {disasterStore?.allZonesLoading && <p className="text-center text-slate-400 py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/>Đang lấy tất cả các khu vực đang hoạt động…</p>}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedZones.map((z) => (
              <div key={z.id} className="group rounded-2xl border border-slate-800 bg-slate-900 shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-4">
                  <div
                    className="flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => navigate(`/zones/${z.id}`)}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{z.name}</div>
                      <div className="text-xs text-slate-400">{z.disasterType}</div>
                    </div>
                    <span className={dangerBadgeClass(z.dangerLevel)}>{z.dangerLevel}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <div className="text-slate-400">Tâm (vĩ độ, kinh độ)</div>
                      <div>{z.centerLatitude.toFixed(4)}, {z.centerLongitude.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Bán kính</div>
                      <div>{z.radius} km</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <MiniZoneMap lat={z.centerLatitude} lng={z.centerLongitude} radiusKm={z.radius} dangerLevel={z.dangerLevel} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    {isAdmin ? (
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(z)} className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700">
                          <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                        </button>
                        <button onClick={() => openDelete(z)} className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                          <Trash2 className="h-3.5 w-3.5" /> Xóa
                        </button>
                      </div>
                    ) : (<div />)}
                    <button onClick={() => navigate(`/zones/${z.id}`)} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                      <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </section>
      </main>

      {isAddOpen && (
        <Modal
          title="Thiết lập Khu vực Mới"
          onClose={() => setIsAddOpen(false)}
          footer={
            <>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all"
              >
                Hủy bỏ
              </button>
              <button onClick={handleSave} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all">
                {disasterStore?.createZoneLoading || disasterStore?.updateZoneLoading ? "Đang xử lý..." : "Tạo Khu Vực"}
              </button>
            </>
          }
        >
          {/* LAYOUT 2 CỘT: MAP (TRÁI) - FORM (PHẢI) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             
             {/* 1. CỘT TRÁI: BẢN ĐỒ */}
             <div className="flex flex-col h-full min-h-[350px]">
                <label className="mb-2 text-sm font-medium text-slate-300 flex items-center gap-2">
                   <Crosshair className="h-4 w-4 text-indigo-400" /> Vị trí & Phạm vi
                </label>
                <SmartLocationPicker 
                    lat={parseFloat(form.centerLatitude)} 
                    lng={parseFloat(form.centerLongitude)} 
                    radius={form.radius}
                    dangerLevel={form.dangerLevel}
                    onLocationChange={handleLocationChange} 
                />
             </div>

             {/* 2. CỘT PHẢI: FORM NHẬP LIỆU (ĐƯỢC VIẾT TRỰC TIẾP TẠI ĐÂY) */}
             <div className="space-y-5">
                {/* Tên Khu vực */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên Khu vực</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                      placeholder="VD: Vùng ngập lụt xã Nam Phương Tiến" 
                    />
                </div>

                {/* Loại & Mức độ */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Loại thảm họa</label>
                        <select value={form.disasterType} onChange={(e) => setForm({ ...form, disasterType: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-indigo-500 transition-all appearance-none">
                            {typeOptions.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Mức độ rủi ro</label>
                        <select value={form.dangerLevel} onChange={(e) => setForm({ ...form, dangerLevel: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-indigo-500 transition-all appearance-none">
                            {dangerOptions.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                {/* Slider Bán kính */}
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                        <span>Bán kính ảnh hưởng</span>
                        <span className="text-indigo-400 font-mono font-bold">{form.radius} km</span>
                    </label>
                    <input 
                        type="range" min="0.5" max="100" step="0.5" 
                        value={form.radius} 
                        onChange={(e) => setForm({ ...form, radius: e.target.value })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    />
                </div>

                {/* Input Tọa độ (Cho phép nhập tay) */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Vĩ độ (Lat)</label>
                        <input 
                            type="number" step="any" 
                            value={form.centerLatitude} 
                            onChange={(e) => setForm({ ...form, centerLatitude: e.target.value })}
                            placeholder="VD: 21.028..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Kinh độ (Lng)</label>
                        <input 
                            type="number" step="any" 
                            value={form.centerLongitude} 
                            onChange={(e) => setForm({ ...form, centerLongitude: e.target.value })}
                            placeholder="VD: 105.85..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 italic">*Mẹo: Nhập tọa độ hoặc kéo marker trên bản đồ để cập nhật vị trí.</p>
             </div>
          </div>
        </Modal>
      )}
      {/* --- [KẾT THÚC SỬA ĐỔI] --- */}

      {isEditOpen && (
        <Modal
          title="Chỉnh sửa Khu vực"
          onClose={() => setIsEditOpen(false)}
          footer={
            <>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-all"
              >
                Hủy
              </button>
              <RestrictedButton
                onClick={handleUpdate}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all"
              >
                Cập nhật
              </RestrictedButton>
            </>
          }
        >
          {/* NỘI DUNG FORM EDIT (Giống hệt Add Modal để đồng bộ) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
             <div className="flex flex-col h-full min-h-[350px]">
                <label className="mb-2 text-sm font-medium text-slate-300 flex items-center gap-2">
                   <Crosshair className="h-4 w-4 text-indigo-400" /> Vị trí & Phạm vi
                </label>
                <SmartLocationPicker 
                    lat={parseFloat(form.centerLatitude)} 
                    lng={parseFloat(form.centerLongitude)} 
                    radius={form.radius}
                    dangerLevel={form.dangerLevel}
                    onLocationChange={handleLocationChange} 
                />
             </div>
             <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên Khu vực</label>
                    <input 
                      value={form.name} 
                      onChange={(e) => setForm({ ...form, name: e.target.value })} 
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Loại thảm họa</label>
                        <select value={form.disasterType} onChange={(e) => setForm({ ...form, disasterType: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-indigo-500 transition-all appearance-none">
                            {typeOptions.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Mức độ rủi ro</label>
                        <select value={form.dangerLevel} onChange={(e) => setForm({ ...form, dangerLevel: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white outline-none focus:border-indigo-500 transition-all appearance-none">
                            {dangerOptions.filter(Boolean).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-3">
                        <span>Bán kính ảnh hưởng</span>
                        <span className="text-indigo-400 font-mono font-bold">{form.radius} km</span>
                    </label>
                    <input 
                        type="range" min="0.5" max="100" step="0.5" 
                        value={form.radius} 
                        onChange={(e) => setForm({ ...form, radius: e.target.value })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Vĩ độ (Lat)</label>
                        <input 
                            type="number" step="any" 
                            value={form.centerLatitude} 
                            onChange={(e) => setForm({ ...form, centerLatitude: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Kinh độ (Lng)</label>
                        <input 
                            type="number" step="any" 
                            value={form.centerLongitude} 
                            onChange={(e) => setForm({ ...form, centerLongitude: e.target.value })}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                        />
                    </div>
                </div>
             </div>
          </div>
        </Modal>
      )}
      {/* --- [KẾT THÚC SỬA ĐỔI] --- */}

      {/* Delete Confirmation Modal (Giữ nguyên) */}
      {isDeleteOpen && (
        <Modal
          title="Xác nhận Xóa"
          onClose={() => setIsDeleteOpen(false)}
          footer={
            <>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </button>
              <RestrictedButton
                disabled={disasterStore?.deleteZoneLoading}
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
              >
                {disasterStore?.deleteZoneLoading ? "Processing" : "Confirm"}
              </RestrictedButton>
            </>
          }
        >
          <p className="text-sm text-slate-300">Bạn có chắc muốn xóa khu vực này ?</p>
        </Modal>
      )}
    </div>
  );
}

export default DisasterZonesPage;
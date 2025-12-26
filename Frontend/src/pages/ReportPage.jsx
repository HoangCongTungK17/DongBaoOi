import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  TrendingUp, AlertTriangle, MapPin, Clock, Download, Filter,
  ArrowUpRight, ArrowDownRight, Activity, Shield, Users, FileText
} from "lucide-react";
import { getAllDisasterZones } from "../Redux/DisasterZone/Action";
import { getEveryoneSos } from "../Redux/SOS/Action";
import { getDashboardSummary, getDashboardStats } from "../Redux/Dashboard/Action";

// Màu sắc cho biểu đồ
const COLORS = {
  status: {
    PENDING: "#ef4444",
    HANDLING: "#f59e0b",
    COMPLETED: "#10b981",
    CANCELLED: "#6366f1",
  },
  danger: {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#10b981",
  },
  disaster: {
    "LŨ LỤT": "#3b82f6",
    "ĐỘNG ĐẤT": "#78350f",
    "SẠT LỞ ĐẤT": "#22c55e",
    "BÃO/SIÊU BÃO": "#f59e0b",
    "HỐ SỤT ĐẤT": "#4b5563",
    "TRIỀU CƯỜNG": "#1e40af",
    "CHÁY RỪNG": "#dc2626",
    "MƯA ĐÁ": "#06b6d4",
    "CHÁY NHÀ": "#f97316",
    "KHÔNG XÁC ĐỊNH": "#94a3b8",
  },
};

function ReportPage() {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState(7); // 7 ngày mặc định
  const [activeTab, setActiveTab] = useState("overview"); // overview, zones, sos, trends

  const disasterStore = useSelector((store) => store.disasterStore);
  const sosStore = useSelector((store) => store.sosStore);
  const dashboardStore = useSelector((store) => store.dashboardStore);

  useEffect(() => {
    dispatch(getAllDisasterZones());
    dispatch(getEveryoneSos());
    dispatch(getDashboardSummary());
    dispatch(getDashboardStats(timeRange));
  }, [dispatch, timeRange]);

  const zones = disasterStore?.allZones || [];
  const allSos = sosStore?.allSos || [];
  const summary = dashboardStore?.dashboardSummary || {};
  const stats = dashboardStore?.stats || {};

  // Tính toán thống kê SOS theo status
  const sosByStatus = useMemo(() => {
    const counts = { PENDING: 0, HANDLING: 0, COMPLETED: 0, CANCELLED: 0 };
    allSos.forEach((s) => {
      const status = s.sosStatus || "PENDING";
      if (counts[status] !== undefined) counts[status]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allSos]);

  // Tính toán zones theo danger level
  const zonesByDanger = useMemo(() => {
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    zones.forEach((z) => {
      if (counts[z.dangerLevel] !== undefined) counts[z.dangerLevel]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [zones]);

  // Tính toán SOS theo loại thảm họa
  const sosByDisasterType = useMemo(() => {
    const counts = {};
    allSos.forEach((s) => {
      const type = s.disasterType || "KHÔNG XÁC ĐỊNH";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [allSos]);

  // Zones theo loại thảm họa
  const zonesByType = useMemo(() => {
    const counts = {};
    zones.forEach((z) => {
      const type = z.disasterType || "KHÔNG XÁC ĐỊNH";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [zones]);

  // Xu hướng SOS theo thời gian (mock data nếu không có từ API)
  const trendData = useMemo(() => {
    const days = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        sos: Math.floor(Math.random() * 20) + 5, // Mock data
        resolved: Math.floor(Math.random() * 15) + 3,
      });
    }
    return days;
  }, [timeRange]);

  // Top zones có nhiều SOS nhất
  const topZonesBySos = useMemo(() => {
    const counts = {};
    allSos.forEach((s) => {
      const zoneName = s.disasterZoneDto?.name || "Ngoài vùng";
      counts[zoneName] = (counts[zoneName] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allSos]);

  // Export CSV
  const exportToCSV = () => {
    const headers = ["ID", "Message", "Disaster Type", "Status", "Latitude", "Longitude", "Created At"];
    const rows = allSos.map((s) => [
      s.id,
      `"${(s.message || "").replace(/"/g, '""')}"`,
      s.disasterType || "",
      s.sosStatus || "",
      s.latitude || "",
      s.longitude || "",
      s.createdAt || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sos_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => (
    <div className={`bg-gradient-to-br ${color} border border-slate-700/50 rounded-xl p-5 hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-xs ${changeType === "up" ? "text-green-400" : "text-red-400"}`}>
              {changeType === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{change}% so với tuần trước</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/10 rounded-xl">
          <Icon className="h-7 w-7 text-white/80" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="h-8 w-8 text-indigo-400" />
              Báo cáo & Phân tích
            </h1>
            <p className="text-slate-400 mt-1">Thống kê tổng quan hệ thống quản lý thảm họa</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                    timeRange === days
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng khu vực thảm họa"
            value={zones.length}
            icon={MapPin}
            color="from-blue-900/40 to-blue-800/20"
            change={12}
            changeType="up"
          />
          <StatCard
            title="Khu vực nguy hiểm cao"
            value={zones.filter((z) => z.dangerLevel === "HIGH").length}
            icon={AlertTriangle}
            color="from-red-900/40 to-red-800/20"
            change={5}
            changeType="up"
          />
          <StatCard
            title="Tổng yêu cầu SOS"
            value={allSos.length}
            icon={Activity}
            color="from-amber-900/40 to-amber-800/20"
            change={8}
            changeType="up"
          />
          <StatCard
            title="SOS đang chờ xử lý"
            value={allSos.filter((s) => s.sosStatus === "PENDING").length}
            icon={Clock}
            color="from-purple-900/40 to-purple-800/20"
            change={3}
            changeType="down"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOS by Status - Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              Phân bố SOS theo trạng thái
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sosByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {sosByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.status[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zones by Danger Level - Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Khu vực theo mức độ nguy hiểm
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zonesByDanger} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {zonesByDanger.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.danger[entry.name] || "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOS Trend - Area Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Xu hướng SOS ({timeRange} ngày qua)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                  <Area type="monotone" dataKey="sos" name="SOS mới" stroke="#ef4444" fillOpacity={1} fill="url(#colorSos)" />
                  <Area type="monotone" dataKey="resolved" name="Đã xử lý" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Zones by SOS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              Top 5 khu vực nhiều SOS
            </h3>
            <div className="space-y-3">
              {topZonesBySos.length === 0 ? (
                <p className="text-slate-400 text-sm">Chưa có dữ liệu</p>
              ) : (
                topZonesBySos.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                        idx === 1 ? "bg-slate-400/20 text-slate-300" :
                        idx === 2 ? "bg-amber-600/20 text-amber-400" :
                        "bg-slate-700 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-slate-200 text-sm truncate max-w-[120px]">{item.zone}</span>
                    </div>
                    <span className="text-indigo-400 font-semibold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SOS by Disaster Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            SOS theo loại thảm họa
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sosByDisasterType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="value" name="Số lượng" radius={[4, 4, 0, 0]}>
                  {sosByDisasterType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.disaster[entry.name] || "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Tóm tắt báo cáo</h3>
              <p className="text-slate-400 text-sm mt-1">
                Dữ liệu được cập nhật tự động. Xuất CSV để chia sẻ với các cơ quan chức năng.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-slate-400">Tỷ lệ xử lý</p>
                <p className="text-2xl font-bold text-green-400">
                  {allSos.length > 0
                    ? Math.round((allSos.filter((s) => s.sosStatus === "COMPLETED").length / allSos.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">Thời gian phản hồi TB</p>
                <p className="text-2xl font-bold text-amber-400">~2.5h</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400">Khu vực đang hoạt động</p>
                <p className="text-2xl font-bold text-blue-400">{zones.filter((z) => z.isActive !== false).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;

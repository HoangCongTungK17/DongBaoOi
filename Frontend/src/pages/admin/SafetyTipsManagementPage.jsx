import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllSafetyTips, createSafetyTip, updateSafetyTip, deleteSafetyTip } from "../../Redux/SafetyTips/Action";
import { getAllDisasterZones } from "../../Redux/DisasterZone/Action";
import { toast } from "sonner";
import {
  Search,
  Shield,
  Lightbulb,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  Globe,
  MapPin,
} from "lucide-react";

const DISASTER_TYPES = [
  { value: "FLOOD", label: "LŨ LỤT" },
  { value: "EARTHQUAKE", label: "ĐỘNG ĐẤT" },
  { value: "LANDSLIDE", label: "SẠT LỞ ĐẤT" },
  { value: "TORNADO", label: "BÃO/SIÊU BÃO" },
  { value: "SINKHOLE", label: "HỐ SỤT ĐẤT" },
  { value: "TSUNAMI", label: "TRIỀU CƯỜNG" },
  { value: "WILDFIRE", label: "CHÁY RỪNG" },
  { value: "BLIZZARD", label: "MƯA ĐÁ" },
  { value: "HOUSE_FIRE", label: "HỎA HOẠN" },
  { value: "UNKNOWN", label: "KHÔNG XÁC ĐỊNH" },
];

function SafetyTipsManagementPage() {
  const dispatch = useDispatch();
  const { allSafetyTips, safetyTipsLoading, updateLoading } = useSelector((store) => store.safetyTipsStore);
  const { allZones } = useSelector((store) => store.disasterStore);
  const { isAdmin } = useSelector((store) => store.authStore);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    disasterType: "FLOOD",
    disasterZoneId: null,
  });

  useEffect(() => {
    dispatch(getAllSafetyTips());
    dispatch(getAllDisasterZones());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setSelectedTip(null);
    setFormData({
      title: "",
      description: "",
      disasterType: "FLOOD",
      disasterZoneId: null,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (tip) => {
    setSelectedTip(tip);
    setFormData({
      title: tip.title,
      description: tip.description,
      disasterType: tip.disasterType || "UNKNOWN", // Backend returns enum value directly
      disasterZoneId: tip.disasterZoneDto?.id || null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      disasterType: formData.disasterType,
      disasterZoneId: formData.disasterZoneId || null,
    };

    let result;
    if (selectedTip) {
      result = await dispatch(updateSafetyTip(selectedTip.id, payload));
    } else {
      result = await dispatch(createSafetyTip(payload));
    }

    if (result.success) {
      toast.success(selectedTip ? "Cập nhật thành công!" : "Tạo mới thành công!");
      setShowModal(false);
      dispatch(getAllSafetyTips());
    } else {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleDelete = async () => {
    if (!selectedTip) return;
    const result = await dispatch(deleteSafetyTip(selectedTip.id));
    if (result.success) {
      toast.success("Đã xóa hướng dẫn!");
      setShowDeleteDialog(false);
      setSelectedTip(null);
    } else {
      toast.error("Xóa thất bại!");
    }
  };

  // Helper function to get Vietnamese label from enum value
  const getDisasterTypeLabel = (enumValue) => {
    return DISASTER_TYPES.find((t) => t.value === enumValue)?.label || enumValue;
  };

  const filteredTips = allSafetyTips.filter((tip) => {
    const matchesSearch =
      tip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || tip.disasterType === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: allSafetyTips.length,
    global: allSafetyTips.filter((t) => !t.disasterZoneDto).length,
    zoneSpecific: allSafetyTips.filter((t) => t.disasterZoneDto).length,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mt-2">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Quản lý Hướng dẫn An toàn
          </h1>
          <p className="text-gray-600 mt-1">Quản lý các hướng dẫn an toàn cho người dùng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng số hướng dẫn</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hướng dẫn chung</p>
                <p className="text-2xl font-bold text-gray-800">{stats.global}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Theo vùng cụ thể</p>
                <p className="text-2xl font-bold text-gray-800">{stats.zoneSpecific}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Tất cả loại</option>
                {DISASTER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Thêm mới
              </button>
              <button
                onClick={() => dispatch(getAllSafetyTips())}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Làm mới"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${safetyTipsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Tips Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {safetyTipsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-3">Đang tải...</p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Không tìm thấy hướng dẫn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Mô tả
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Loại thảm họa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Vùng áp dụng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTips.map((tip) => (
                    <tr key={tip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-600">{tip.id}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800 max-w-xs truncate">{tip.title}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 max-w-md truncate">{tip.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <AlertTriangle className="h-3 w-3" />
                          {getDisasterTypeLabel(tip.disasterType)}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        {tip.disasterZoneDto ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <MapPin className="h-3 w-3" />
                            {tip.disasterZoneDto.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <Globe className="h-3 w-3" />
                            Áp dụng chung
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(tip)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTip(tip);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Hiển thị {filteredTips.length} / {allSafetyTips.length} hướng dẫn
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedTip ? "Chỉnh sửa hướng dẫn" : "Thêm hướng dẫn mới"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề hướng dẫn..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập nội dung hướng dẫn chi tiết..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại thảm họa *</label>
                <select
                  value={formData.disasterType}
                  onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {DISASTER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vùng áp dụng (để trống = áp dụng chung)</label>
                <select
                  value={formData.disasterZoneId || ""}
                  onChange={(e) => setFormData({ ...formData, disasterZoneId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Áp dụng chung (tất cả vùng)</option>
                  {allZones?.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} - {getDisasterTypeLabel(zone.disasterType)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateLoading ? "Đang xử lý..." : selectedTip ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa hướng dẫn "{selectedTip?.title}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedTip(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateLoading ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SafetyTipsManagementPage;

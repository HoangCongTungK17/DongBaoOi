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
  { value: "FLOOD", label: "LU LUT" },
  { value: "EARTHQUAKE", label: "DONG DAT" },
  { value: "LANDSLIDE", label: "SAT LO DAT" },
  { value: "TORNADO", label: "BAO/SIEU BAO" },
  { value: "SINKHOLE", label: "HO SUT DAT" },
  { value: "TSUNAMI", label: "TRIEU CUONG" },
  { value: "WILDFIRE", label: "CHAY RUNG" },
  { value: "BLIZZARD", label: "MUA DA" },
  { value: "HOUSE_FIRE", label: "HOA HOAN" },
  { value: "UNKNOWN", label: "KHONG XAC DINH" },
];

function SafetyTipsManagementPage() {
  const dispatch = useDispatch();
  const { allSafetyTips, safetyTipsLoading, updateLoading } = useSelector((store) => store.safetyTipsStore);
  const { zones } = useSelector((store) => store.disasterStore);
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
    // Find the enum value from the Vietnamese name
    const typeMatch = DISASTER_TYPES.find((t) => t.label === tip.disasterType);
    setFormData({
      title: tip.title,
      description: tip.description,
      disasterType: typeMatch?.value || "UNKNOWN",
      disasterZoneId: tip.disasterZoneDto?.id || null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Vui long dien day du thong tin");
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
      toast.success(selectedTip ? "Cap nhat thanh cong!" : "Tao moi thanh cong!");
      setShowModal(false);
      dispatch(getAllSafetyTips());
    } else {
      toast.error("Co loi xay ra!");
    }
  };

  const handleDelete = async () => {
    if (!selectedTip) return;
    const result = await dispatch(deleteSafetyTip(selectedTip.id));
    if (result.success) {
      toast.success("Da xoa huong dan!");
      setShowDeleteDialog(false);
      setSelectedTip(null);
    } else {
      toast.error("Xoa that bai!");
    }
  };

  const filteredTips = allSafetyTips.filter((tip) => {
    const matchesSearch =
      tip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tip.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || tip.disasterType === DISASTER_TYPES.find((t) => t.value === typeFilter)?.label;
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
          <h2 className="text-2xl font-bold text-gray-800">Truy cap bi tu choi</h2>
          <p className="text-gray-600 mt-2">Ban khong co quyen truy cap trang nay.</p>
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
            Quan ly Huong dan An toan
          </h1>
          <p className="text-gray-600 mt-1">Quan ly cac huong dan an toan cho nguoi dung</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tong so huong dan</p>
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
                <p className="text-sm text-gray-500">Huong dan chung</p>
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
                <p className="text-sm text-gray-500">Theo vung cu the</p>
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
                placeholder="Tim kiem theo tieu de hoac noi dung..."
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
                <option value="ALL">Tat ca loai</option>
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
                Them moi
              </button>
              <button
                onClick={() => dispatch(getAllSafetyTips())}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Lam moi"
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
              <p className="text-gray-500 mt-3">Dang tai...</p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="p-8 text-center">
              <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Khong tim thay huong dan nao</p>
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
                      Tieu de
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Mo ta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Loai tham hoa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Vung ap dung
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Thao tac
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
                          {tip.disasterType}
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
                            Ap dung chung
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(tip)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Chinh sua"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTip(tip);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Xoa"
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
          Hien thi {filteredTips.length} / {allSafetyTips.length} huong dan
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedTip ? "Chinh sua huong dan" : "Them huong dan moi"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tieu de *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhap tieu de huong dan..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mo ta *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhap noi dung huong dan chi tiet..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loai tham hoa *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Vung ap dung (de trong = ap dung chung)</label>
                <select
                  value={formData.disasterZoneId || ""}
                  onChange={(e) => setFormData({ ...formData, disasterZoneId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Ap dung chung (tat ca vung)</option>
                  {zones?.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} - {zone.disasterType}
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
                  Huy
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateLoading ? "Dang xu ly..." : selectedTip ? "Cap nhat" : "Tao moi"}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Xac nhan xoa</h3>
              <p className="text-gray-600 mb-6">
                Ban co chac chan muon xoa huong dan "{selectedTip?.title}"? Hanh dong nay khong the hoan tac.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedTip(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Huy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {updateLoading ? "Dang xoa..." : "Xoa"}
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

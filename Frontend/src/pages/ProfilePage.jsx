import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin, Phone, Mail, User, Edit2, Shield, Lock, Key,
  Calendar, Clock, AlertTriangle, CheckCircle, XCircle,
  Loader2, Eye, EyeOff, ChevronRight, MapPinned
} from "lucide-react";
import { toast } from "sonner";
import { getMyDetails, updateMyDetails } from "../Redux/Auth/Action";
import { mySos } from "../Redux/SOS/Action";
import { BASE_URL } from "../Redux/config";

// Status badge helper
const statusBadge = (status) => {
  const map = {
    PENDING: "bg-red-900/30 text-red-300 ring-red-700/40",
    HANDLING: "bg-yellow-900/30 text-yellow-300 ring-yellow-700/40",
    COMPLETED: "bg-green-900/30 text-green-300 ring-green-700/40",
    CANCELLED: "bg-slate-700/30 text-slate-300 ring-slate-600/40",
  };
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${map[status] || map.PENDING}`;
};

const statusIcon = (status) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case "CANCELLED":
      return <XCircle className="h-5 w-5 text-slate-400" />;
    case "HANDLING":
      return <Clock className="h-5 w-5 text-yellow-400" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
  }
};

function ProfilePage() {
  const dispatch = useDispatch();
  const authStore = useSelector((store) => store.authStore);
  const sosStore = useSelector((store) => store.sosStore);

  const { currentUser, currentUserLoading } = authStore;
  const { mySos: sosRequests, mySosLoading } = sosStore;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [form, setForm] = useState({ fullname: "", phoneNumber: "", address: "" });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    dispatch(getMyDetails());
    dispatch(mySos());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) {
      setForm({
        fullname: currentUser.fullname || "",
        phoneNumber: currentUser.phoneNumber || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    try {
      await dispatch(updateMyDetails(form));
      toast.success("Cập nhật thông tin thành công");
      dispatch(getMyDetails());
      setIsEditOpen(false);
    } catch {
      toast.error("Có lỗi xảy ra.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.errorMessage || "Đổi mật khẩu thất bại");
        return;
      }

      toast.success("Đổi mật khẩu thành công!");
      setIsPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (currentUserLoading || mySosLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold mb-4">
            {currentUser?.fullname?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h1 className="text-2xl font-bold text-white">{currentUser?.fullname || "User"}</h1>
          <p className="text-slate-400">{currentUser?.email}</p>
          <span className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            currentUser?.role === "ADMIN"
              ? "bg-amber-500/20 text-amber-300"
              : "bg-indigo-500/20 text-indigo-300"
          }`}>
            <Shield className="h-3 w-3" />
            {currentUser?.role}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Profile Info */}
          <div className="lg:col-span-1 space-y-6">

            {/* User Info Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  Thông tin cá nhân
                </h2>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" /> Sửa
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{currentUser?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{currentUser?.phoneNumber || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm">{currentUser?.address || "Chưa cập nhật"}</span>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-amber-400" />
                Bảo mật
              </h2>

              <button
                onClick={() => setIsPasswordOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Key className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">Đổi mật khẩu</p>
                    <p className="text-xs text-slate-400">Cập nhật mật khẩu đăng nhập</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
              </button>
            </div>

            {/* Stats Card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Thống kê của bạn</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{sosRequests?.length || 0}</p>
                  <p className="text-xs text-slate-400">SOS đã gửi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {sosRequests?.filter(s => s.sosStatus === "COMPLETED").length || 0}
                  </p>
                  <p className="text-xs text-slate-400">Đã xử lý</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: SOS History Timeline */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                Lịch sử yêu cầu SOS
              </h2>

              {sosRequests?.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {sosRequests.map((sos, index) => (
                    <div
                      key={sos.id}
                      className="relative pl-8 pb-4 border-l-2 border-slate-700 last:border-l-0 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          sos.sosStatus === "COMPLETED" ? "bg-green-500" :
                          sos.sosStatus === "HANDLING" ? "bg-yellow-500" :
                          sos.sosStatus === "CANCELLED" ? "bg-slate-500" :
                          "bg-red-500"
                        }`} />
                      </div>

                      {/* Content */}
                      <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {statusIcon(sos.sosStatus)}
                            <span className={statusBadge(sos.sosStatus)}>{sos.sosStatus}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(sos.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>

                        <p className="text-white text-sm font-medium mb-2">{sos.message}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {sos.disasterType}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinned className="h-3 w-3" />
                            {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)}
                          </span>
                          {sos.disasterZoneDto && (
                            <span className="flex items-center gap-1 text-indigo-400">
                              <MapPin className="h-3 w-3" />
                              {sos.disasterZoneDto.name}
                            </span>
                          )}
                        </div>

                        {sos.updatedAt !== sos.createdAt && (
                          <p className="text-xs text-slate-500 mt-2">
                            Cập nhật: {new Date(sos.updatedAt).toLocaleString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Bạn chưa gửi yêu cầu SOS nào</p>
                  <p className="text-xs text-slate-500 mt-1">Các yêu cầu SOS của bạn sẽ hiển thị ở đây</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Chỉnh sửa thông tin</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Địa chỉ</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="pt-2 text-xs text-slate-500">
                <p>Email: {currentUser?.email} (không thể thay đổi)</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                Đổi mật khẩu
              </h2>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordOpen(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

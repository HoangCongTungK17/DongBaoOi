import { useState } from "react";
import { Lock, Mail, KeyRound, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL } from "../../Redux/config";

// Các bước trong flow: REQUEST_OTP -> VERIFY_OTP -> SUCCESS
const STEPS = {
  REQUEST_OTP: "REQUEST_OTP",
  VERIFY_OTP: "VERIFY_OTP",
  SUCCESS: "SUCCESS",
};

function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(STEPS.REQUEST_OTP);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Bước 1: Gửi yêu cầu reset password (nhận OTP qua email)
  const handleRequestOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.errorMessage || "Email không tồn tại trong hệ thống");
        return;
      }

      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep(STEPS.VERIFY_OTP);
    } catch (error) {
      console.error("Request OTP error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP và đặt mật khẩu mới
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: email.trim(),
          oneTimePassword: parseInt(otp.trim()),
          context: "RESET_PASSWORD",
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.errorMessage || "Mã OTP không đúng hoặc đã hết hạn");
        return;
      }

      toast.success("Đặt lại mật khẩu thành công!");
      setStep(STEPS.SUCCESS);
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        toast.success("Mã OTP mới đã được gửi!");
      } else {
        toast.error("Không thể gửi lại OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-slate-950">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=1920&auto=format&fit=crop"
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl p-6">

        {/* Step 1: Nhập Email */}
        {step === STEPS.REQUEST_OTP && (
          <>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow">
                <KeyRound className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-xl font-bold text-slate-100">Quên mật khẩu?</h1>
              <p className="mt-1 text-sm text-slate-400 text-center">
                Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleRequestOtp}>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-slate-100 outline-none placeholder-slate-500 bg-slate-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg px-4 py-2.5 mt-2 text-white font-medium shadow flex items-center justify-center gap-2 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sm text-blue-400 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </button>
            </div>
          </>
        )}

        {/* Step 2: Nhập OTP và mật khẩu mới */}
        {step === STEPS.VERIFY_OTP && (
          <>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow">
                <Lock className="h-6 w-6" />
              </div>
              <h1 className="mt-3 text-xl font-bold text-slate-100">Xác thực OTP</h1>
              <p className="mt-1 text-sm text-slate-400 text-center">
                Nhập mã OTP đã gửi đến <span className="text-blue-400">{email}</span>
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Mã OTP (6 chữ số)</label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-2xl tracking-[0.5em] text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-green-600 focus:outline-none"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-green-600 focus:outline-none"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-green-600 focus:outline-none"
                  minLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg px-4 py-2.5 mt-2 text-white font-medium shadow flex items-center justify-center gap-2 ${
                  loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep(STEPS.REQUEST_OTP)}
                className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-blue-400 hover:underline disabled:opacity-50"
              >
                Gửi lại OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: Thành công */}
        {step === STEPS.SUCCESS && (
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-500/20 text-green-400 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Đặt lại mật khẩu thành công!</h1>
            <p className="mt-2 text-sm text-slate-400">
              Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
            </p>
            <button
              type="button"
              onClick={onBackToLogin}
              className="mt-6 w-full rounded-lg px-4 py-2.5 text-white font-medium shadow bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

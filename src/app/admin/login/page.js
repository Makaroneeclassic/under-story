"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login error", err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEAE3] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full border border-[#9C8B72]/20 pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full border border-[#9C8B72]/20 pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo Lockup */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/logo_understory_authentic.webp"
              alt="Understory Logo"
              width={220}
              height={90}
              className="h-14 w-auto mx-auto object-contain"
              priority
            />
          </Link>
          <div className="h-[1px] w-16 bg-[#9C8B72]/40 mx-auto mt-4 mb-3"></div>
          <h2 className="font-serif text-2xl font-bold text-[#000000] tracking-wide">
            Admin Authentication
          </h2>
          <p className="text-xs text-[#665340] mt-1">
            ระบบจัดการข้อมูลและควบคุมหลังบ้าน Understory
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF]/90 backdrop-blur-md p-8 sm:p-10 rounded-2xl border border-[#9C8B72]/30 shadow-xl">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-base text-red-600">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Username */}
            <div>
              <label className="block font-semibold text-[#4A4742] mb-1.5 uppercase tracking-wider text-[11px]">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8B72] text-sm">
                  person
                </span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="adminunderstory"
                  className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg pl-10 pr-4 py-3 text-xs text-[#000000] focus:outline-none focus:border-[#665340] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-[#4A4742] mb-1.5 uppercase tracking-wider text-[11px]">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8B72] text-sm">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg pl-10 pr-11 py-3 text-xs text-[#000000] focus:outline-none focus:border-[#665340] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C8B72] hover:text-[#000000] cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] hover:bg-[#665340] text-white py-3.5 rounded-lg font-semibold text-xs tracking-widest uppercase transition-all shadow-md mt-3 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#665340] hover:text-[#000000] underline transition-colors"
          >
            ← กลับสู่หน้าหลัก Understory
          </Link>
        </div>
      </div>
    </div>
  );
}

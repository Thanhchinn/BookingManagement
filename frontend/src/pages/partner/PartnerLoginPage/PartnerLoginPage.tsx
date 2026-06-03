import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  User,
  Hash,
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';

interface PartnerLoginPageProps {
  onLoginSuccess: (partnerName: string) => void;
  onBackToClient: () => void;
  onGoToAuth?: () => void;
}

type PageState = 'checking' | 'not_logged_in' | 'register_form' | 'pending' | 'active';

interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

interface PartnerProfile {
  id: string;
  status: string;
  businessName: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  createdAt: string;
}

export const PartnerLoginPage: React.FC<PartnerLoginPageProps> = ({
  onLoginSuccess,
  onBackToClient,
  onGoToAuth,
}) => {
  const [pageState, setPageState] = useState<PageState>('checking');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);

  // Form fields
  const [businessName, setBusinessName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === KHỞI TẠO: Kiểm tra trạng thái đăng nhập & hồ sơ đối tác ===
  useEffect(() => {
    const init = async () => {
      // 1. Kiểm tra có đăng nhập tài khoản user chưa
      const savedUserInfo = localStorage.getItem('user_info');
      if (!savedUserInfo) {
        setPageState('not_logged_in');
        return;
      }

      let parsed: UserInfo;
      try {
        parsed = JSON.parse(savedUserInfo);
      } catch {
        setPageState('not_logged_in');
        return;
      }

      setUserInfo(parsed);

      // 2. Gọi API kiểm tra hồ sơ đối tác theo userId
      try {
        const res = await fetch(
          `http://localhost:3000/partners/user/${parsed.id}`,
        );
        const data = await res.json();

        if (!data) {
          // Chưa có hồ sơ → hiển thị form đăng ký
          setPageState('register_form');
        } else {
          setPartnerProfile(data);
          const status = data.status?.toUpperCase();
          if (status === 'ACTIVE') {
            setPageState('active');
          } else {
            // PENDING, SUSPENDED, ...
            setPageState('pending');
          }
        }
      } catch {
        // Lỗi kết nối → mặc định hiển thị form
        setPageState('register_form');
      }
    };

    init();
  }, []);

  // Khi đã được duyệt → tự đăng nhập vào Partner dashboard
  useEffect(() => {
    if (pageState === 'active' && partnerProfile) {
      const timer = setTimeout(() => {
        onLoginSuccess(partnerProfile.businessName);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [pageState, partnerProfile, onLoginSuccess]);

  // Polling tự động kiểm tra trạng thái duyệt hồ sơ mỗi 3 giây khi ở trạng thái Chờ duyệt
  useEffect(() => {
    if (pageState !== 'pending' || !userInfo?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3000/partners/user/${userInfo.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPartnerProfile(data);
            if (data.status?.toUpperCase() === 'ACTIVE') {
              setPageState('active');
              toast.success('Hồ sơ đối tác của bạn đã được Admin phê duyệt thành công!', {
                description: 'Đang chuyển hướng vào bảng điều khiển...',
              });
            }
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái đối tác:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pageState, userInfo?.id]);

  // === XỬ LÝ GỬI HỒ SƠ ĐĂNG KÝ ===
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error('Vui lòng nhập tên tổ hợp sân / doanh nghiệp.');
      return;
    }
    if (!userInfo?.id) {
      toast.error('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:3000/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          businessName: businessName.trim(),
          taxCode: taxCode.trim() || undefined,
          businessLicenseUrl: businessLicenseUrl.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gửi hồ sơ thất bại.');
      }

      setPartnerProfile(data);
      setPageState('pending');
      toast.success('Hồ sơ đăng ký đối tác đã được gửi thành công!', {
        description: 'Chúng tôi sẽ xem xét và phản hồi trong vòng 1-3 ngày làm việc.',
      });
    } catch (err: any) {
      toast.error(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================================================
  // RENDER THEO TRẠNG THÁI
  // ===================================================

  const renderContent = () => {
    // --- TRẠNG THÁI 0: ĐANG KIỂM TRA ---
    if (pageState === 'checking') {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Đang kiểm tra thông tin tài khoản...</p>
        </div>
      );
    }

    // --- TRẠNG THÁI 1: CHƯA ĐĂNG NHẬP ---
    if (pageState === 'not_logged_in') {
      return (
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 mx-auto">
            <User className="w-9 h-9 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Bạn cần đăng nhập trước</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              Để đăng ký trở thành Đối tác chủ sân, bạn cần có tài khoản Thành viên SportZone và đăng nhập trước.
            </p>
          </div>

          {/* Lợi ích đối tác */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Đặc quyền Đối tác SportZone</p>
            {[
              'Quản lý & đăng sân thể thao trực tuyến',
              'Tiếp cận hàng nghìn khách hàng tiềm năng',
              'Nhận đặt lịch tự động 24/7',
              'Bảng điều khiển doanh thu chuyên nghiệp',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onGoToAuth || onBackToClient}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-lg shadow-amber-500/20"
          >
            <LogIn className="w-4.5 h-4.5" />
            Đăng nhập / Đăng ký Tài khoản
          </button>
        </div>
      );
    }

    // --- TRẠNG THÁI 2: FORM ĐĂNG KÝ HỒ SƠ ĐỐI TÁC ---
    if (pageState === 'register_form') {
      return (
        <div className="space-y-6">
          {/* Chào mừng user */}
          <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đăng nhập với tài khoản</p>
              <p className="text-sm font-black text-white">{userInfo?.fullName}</p>
              <p className="text-[11px] text-slate-500 font-mono">{userInfo?.email}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white">Đăng ký làm Đối tác</h3>
            <p className="text-xs text-slate-400">Điền thông tin tổ hợp sân của bạn để gửi hồ sơ xét duyệt.</p>
          </div>

          <form onSubmit={handleSubmitRegistration} className="space-y-4">

            {/* Tên doanh nghiệp */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Tên tổ hợp sân / Doanh nghiệp *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="VD: Tổ hợp thể thao Bình Lợi Pro..."
                required
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-amber-500 text-sm text-white px-4 py-3 rounded-xl focus:outline-none placeholder-slate-700 font-medium transition-colors"
              />
            </div>

            {/* Mã số thuế */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Mã số thuế <span className="text-slate-600 normal-case font-normal">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={taxCode}
                onChange={(e) => setTaxCode(e.target.value)}
                placeholder="VD: 0315482361..."
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-amber-500 text-sm text-white px-4 py-3 rounded-xl focus:outline-none placeholder-slate-700 font-medium font-mono transition-colors"
              />
            </div>

            {/* Giấy phép kinh doanh */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Link ảnh giấy phép kinh doanh <span className="text-slate-600 normal-case font-normal">(tùy chọn)</span>
              </label>
              <input
                type="url"
                value={businessLicenseUrl}
                onChange={(e) => setBusinessLicenseUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-amber-500 text-sm text-white px-4 py-3 rounded-xl focus:outline-none placeholder-slate-700 font-medium transition-colors"
              />
              <p className="text-[10px] text-slate-600">Bạn có thể cập nhật sau khi được phê duyệt.</p>
            </div>

            {/* Thông báo điều khoản */}
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <p className="text-[11px] text-amber-400/80 leading-relaxed">
                ⚠️ Bằng cách gửi hồ sơ, bạn đồng ý với <strong>Điều khoản Đối tác SportZone</strong>. Hồ sơ sẽ được đội ngũ kiểm duyệt trong vòng 1–3 ngày làm việc.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-black rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi hồ sơ...</span>
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span>Gửi Hồ Sơ Đăng Ký Đối Tác</span>
                </>
              )}
            </button>
          </form>
        </div>
      );
    }

    // --- TRẠNG THÁI 3: ĐANG CHỜ DUYỆT ---
    if (pageState === 'pending') {
      return (
        <div className="text-center space-y-6">
          <div className="relative inline-flex mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-9 h-9 text-amber-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Hồ sơ đang được xét duyệt</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              Cảm ơn bạn đã đăng ký! Đội ngũ AdminSportZone đang xem xét hồ sơ của bạn.
            </p>
          </div>

          {/* Chi tiết hồ sơ */}
          {partnerProfile && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Thông tin hồ sơ đã gửi</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Tên doanh nghiệp</span>
                  <span className="text-xs font-bold text-white">{partnerProfile.businessName}</span>
                </div>
                {partnerProfile.taxCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Mã số thuế</span>
                    <span className="text-xs font-mono text-slate-300">{partnerProfile.taxCode}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Trạng thái</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                    ⏳ Đang chờ phê duyệt
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
            {[
              'Thời gian xét duyệt: 1 – 3 ngày làm việc',
              'Bạn sẽ nhận thông báo qua email khi được duyệt',
              'Liên hệ hỗ trợ: support@sportzone.vn',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-400">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onBackToClient}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về Trang chủ
          </button>
        </div>
      );
    }

    // --- TRẠNG THÁI 4: ĐÃ ĐƯỢC DUYỆT → TỰ ĐĂNG NHẬP ---
    if (pageState === 'active') {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mx-auto">
            <CheckCircle2 className="w-9 h-9 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Tài khoản Đối tác đã được kích hoạt!</h3>
            <p className="text-sm text-slate-400">
              Đang tự động chuyển vào bảng điều khiển của{' '}
              <strong className="text-emerald-400">{partnerProfile?.businessName}</strong>...
            </p>
          </div>

          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative font-sans text-slate-100 px-4 overflow-hidden">

      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Khung chính */}
      <div className="relative w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-3xl p-7 sm:p-10 shadow-2xl backdrop-blur-md">

        {/* Nút quay lại */}
        <button
          onClick={onBackToClient}
          className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors duration-150 cursor-pointer bg-transparent border-0 flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-4 text-xl">
            🏆
          </div>
          <h2 className="text-lg font-black text-white m-0 uppercase tracking-wider">
            SportZone Partner
          </h2>
          <p className="text-[10px] text-slate-500 m-0 mt-1 uppercase font-bold tracking-widest">
            Cổng đăng ký & quản lý dành cho Chủ Sân
          </p>
        </div>

        {/* Nội dung theo trạng thái */}
        {renderContent()}
      </div>
    </div>
  );
};

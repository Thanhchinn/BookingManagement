import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Percent,
  Search
} from 'lucide-react';
import { PromotionFormModal } from './PromotionFormModal';
import { toast } from 'sonner';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
}

export const PromotionManagement: React.FC = () => {
  // Mock State để cho phép tương tác đầy đủ trên giao diện
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      code: 'DONGGIA50K',
      description: 'Giảm 25% giá trị ca đặt sân cầu lông hoặc bóng đá bóng rổ toàn sàn chi nhánh.',
      discountPercent: 25,
      maxDiscountAmount: 50000,
      minOrderValue: 200000,
      startDate: '2026-05-01',
      endDate: '2026-06-30',
      usageLimit: 100,
      usedCount: 42
    },
    {
      id: '2',
      code: 'SPORT20',
      description: 'Khuyến mãi đặc biệt mùa hè giảm cực mạnh 20% cho hóa đơn đặt kèm nước suối.',
      discountPercent: 20,
      maxDiscountAmount: 80000,
      minOrderValue: 150000,
      startDate: '2026-05-15',
      endDate: '2026-06-15',
      usageLimit: 50,
      usedCount: 15
    },
    {
      id: '3',
      code: 'NHAPHOI26',
      description: 'Mã tri ân khách hàng vãng lai đá ca đêm sau 20h00.',
      discountPercent: 10,
      maxDiscountAmount: 30000,
      minOrderValue: 100000,
      startDate: '2026-04-01',
      endDate: '2026-05-25', // Hết hạn
      usageLimit: 200,
      usedCount: 200
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [percent, setPercent] = useState(15);
  const [maxDiscount, setMaxDiscount] = useState(50000);
  const [minOrder, setMinOrder] = useState(150000);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [limit, setLimit] = useState(100);

  const filteredPromotions = promotions.filter(p => 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kiểm tra coupon còn hiệu lực hay không
  const isPromoActive = (p: Promotion) => {
    const today = new Date().toISOString().split('T')[0];
    const afterStart = today >= p.startDate;
    const beforeEnd = today <= p.endDate;
    const underLimit = p.usageLimit === 0 || p.usedCount < p.usageLimit;
    return afterStart && beforeEnd && underLimit;
  };

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setCode('');
    setDesc('');
    setPercent(15);
    setMaxDiscount(50000);
    setMinOrder(150000);
    setStart(new Date().toISOString().split('T')[0]);
    setEnd(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]); // 30 ngày sau
    setLimit(100);
    setShowAddModal(true);
  };

  // Thêm mới coupon
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: Promotion = {
      id: String(promotions.length + 1),
      code: code.trim().toUpperCase(),
      description: desc,
      discountPercent: Number(percent),
      maxDiscountAmount: Number(maxDiscount),
      minOrderValue: Number(minOrder),
      startDate: start,
      endDate: end,
      usageLimit: Number(limit),
      usedCount: 0
    };

    setPromotions([...promotions, newPromo]);
    setShowAddModal(false);
    toast.success(`Đã khởi tạo ưu đãi ${newPromo.code}`);
  };

  // Mở modal sửa
  const handleOpenEdit = (p: Promotion) => {
    setSelectedPromo(p);
    setCode(p.code);
    setDesc(p.description);
    setPercent(p.discountPercent);
    setMaxDiscount(p.maxDiscountAmount);
    setMinOrder(p.minOrderValue);
    setStart(p.startDate);
    setEnd(p.endDate);
    setLimit(p.usageLimit);
    setShowEditModal(true);
  };

  // Cập nhật coupon
  const handleEditPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromo) return;

    setPromotions(prev => prev.map(p => {
      if (p.id === selectedPromo.id) {
        return {
          ...p,
          code: code.trim().toUpperCase(),
          description: desc,
          discountPercent: Number(percent),
          maxDiscountAmount: Number(maxDiscount),
          minOrderValue: Number(minOrder),
          startDate: start,
          endDate: end,
          usageLimit: Number(limit)
        };
      }
      return p;
    }));

    setShowEditModal(false);
    setSelectedPromo(null);
    toast.success('Cập nhật mã giảm giá thành công');
  };

  // Xóa coupon
  const handleDeletePromo = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này? Người dùng sẽ không thể sử dụng mã này được nữa.')) {
      setPromotions(prev => prev.filter(p => p.id !== id));
      toast.info('Đã gỡ bỏ mã giảm giá');
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Quản Lý Chương Trình Khuyến Mãi (Voucher)
          </h3>
          <p className="text-xs text-slate-400 m-0">Thiết lập các mã coupon giảm giá nhằm thu hút khách hàng đặt sân vào khung giờ vàng/giờ thấp điểm</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white border-0 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" /> Phát Hành Voucher Mới
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã coupon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-750 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 outline-none transition"
          />
        </div>
      </div>

      {/* Grid Danh sách mã giảm giá */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map(p => {
          const active = isPromoActive(p);
          return (
            <div 
              key={p.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/30 transition duration-200"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                      <Percent className="w-4.5 h-4.5" />
                    </span>
                    <strong className="text-base font-mono font-black text-white tracking-wider">{p.code}</strong>
                  </div>

                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                      title="Sửa coupon"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                      title="Xóa coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-bold block uppercase tracking-wider">Ưu đãi:</span>
                    <strong className="text-emerald-400">Giảm {p.discountPercent}% (Tối đa -{p.maxDiscountAmount.toLocaleString()}đ)</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 m-0 leading-relaxed truncate-2-lines min-h-[32px]">
                    {p.description}
                  </p>
                </div>

                {/* Trạng thái sử dụng */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2 text-[10px] text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Trạng thái:</span>
                    {active ? (
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase">Đang hiệu lực</span>
                    ) : (
                      <span className="text-[8px] bg-slate-950 text-slate-650 border border-slate-850 px-1.5 py-0.5 rounded font-bold uppercase">Hết hạn / Đủ lượt</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Số lượt dùng:</span>
                    <strong className="text-slate-200 font-mono">{p.usedCount} / {p.usageLimit === 0 ? 'Vô hạn' : p.usageLimit} lượt</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Đơn tối thiểu:</span>
                    <strong className="text-slate-300 font-mono">{p.minOrderValue.toLocaleString()}đ</strong>
                  </div>
                </div>
              </div>

              {/* Hạn dùng */}
              <div className="border-t border-slate-850 pt-3 flex justify-between items-center text-[9px] text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> Hạn dùng:</span>
                <span>{p.startDate} ~ {p.endDate}</span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Dialog Modals */}
      <PromotionFormModal
        isOpen={showAddModal}
        isEdit={false}
        code={code}
        setCode={setCode}
        percent={percent}
        setPercent={setPercent}
        maxDiscount={maxDiscount}
        setMaxDiscount={setMaxDiscount}
        minOrder={minOrder}
        setMinOrder={setMinOrder}
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        limit={limit}
        setLimit={setLimit}
        desc={desc}
        setDesc={setDesc}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPromo}
      />

      <PromotionFormModal
        isOpen={showEditModal}
        isEdit={true}
        code={code}
        setCode={setCode}
        percent={percent}
        setPercent={setPercent}
        maxDiscount={maxDiscount}
        setMaxDiscount={setMaxDiscount}
        minOrder={minOrder}
        setMinOrder={setMinOrder}
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        limit={limit}
        setLimit={setLimit}
        desc={desc}
        setDesc={setDesc}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPromo(null);
        }}
        onSubmit={handleEditPromo}
      />

    </div>
  );
};

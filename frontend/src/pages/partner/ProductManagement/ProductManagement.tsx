import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, RefreshCw, ArrowLeft, Save, Package, Coffee, Wrench, MoreHorizontal, Building2, Tag, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { PartnerFilterBar } from '../components/PartnerFilterBar';

const API = 'http://localhost:3000';

interface LocationItem { id: string; name: string; }
interface ProductItem {
  id: string; name: string; category: string;
  description?: string; price: number; imageUrl?: string; isAvailable: boolean;
}

interface ProductCategoryItem {
  id: string;
  name: string;
  icon: string;
}

const COMMON_EMOJIS = ['💧', '🍿', '🏸', '👕', '📦', '🥤', '❄️', '🍕', '🍔', '💵', '👟', '🧴', '🍎', '🥐', '🔋'];

export const ProductManagement: React.FC = () => {
  const token = localStorage.getItem('user_token');

  // Trạng thái view: 'select' | 'list' | 'add' | 'edit' | 'categories'
  const [view, setView] = useState<'select' | 'list' | 'add' | 'edit' | 'categories'>('select');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states cho Sản phẩm
  const [fName, setFName] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fPrice, setFPrice] = useState(10000);
  const [fDesc, setFDesc] = useState('');
  const [fImageUrl, setFImageUrl] = useState('');
  const [fAvailable, setFAvailable] = useState(true);

  // Form states cho Danh mục
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Load danh mục sản phẩm từ DB
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/product-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
      // Đặt mặc định nếu chưa chọn category trong form
      if (list.length > 0 && !fCategory) {
        setFCategory(list[0].name);
      }
    } catch (err: any) {
      console.error('[Categories] fetch error:', err);
    }
  }, [token, fCategory]);

  // Load danh sách cơ sở
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/locations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((data: any[]) => {
        const mapped = data.map(l => ({ id: String(l.id), name: l.name }));
        setLocations(mapped);
        if (mapped.length === 1) { setSelectedLoc(mapped[0]); setView('list'); }
      })
      .catch(console.error);
    fetchCategories();
  }, [token, fetchCategories]);

  // Load sản phẩm theo cơ sở
  const fetchProducts = useCallback(async (locId: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/products/location/${locId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Lỗi tải sản phẩm', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (view === 'list' && selectedLoc) {
      fetchProducts(selectedLoc.id);
    }
  }, [view, selectedLoc, fetchProducts]);

  // Helpers hiển thị thông tin danh mục
  const getCatInfo = (catValue: string) => {
    const found = categories.find(c => c.name === catValue || c.id === catValue);
    if (found) return { label: found.name, icon: found.icon };
    
    // Legacy fallbacks
    if (catValue === 'DRINK') return { label: 'Nước uống / Giải khát', icon: '💧' };
    if (catValue === 'FOOD') return { label: 'Đồ ăn nhẹ', icon: '🍿' };
    if (catValue === 'EQUIPMENT') return { label: 'Thiết bị / Dụng cụ', icon: '🏸' };
    if (catValue === 'RENTAL') return { label: 'Cho thuê dụng cụ', icon: '👕' };
    if (catValue === 'OTHER') return { label: 'Dịch vụ khác', icon: '📦' };

    return { label: catValue, icon: '📦' };
  };

  const resetForm = () => {
    setFName('');
    setFCategory(categories.length > 0 ? categories[0].name : '');
    setFPrice(10000);
    setFDesc('');
    setFImageUrl('');
    setFAvailable(true);
  };

  const handleSelectLoc = (loc: LocationItem) => { setSelectedLoc(loc); setView('list'); };

  const handleOpenAdd = () => { setEditingId(null); resetForm(); setView('add'); };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setFName(p.name);
    setFCategory(p.category);
    setFPrice(Number(p.price));
    setFDesc(p.description || '');
    setFImageUrl(p.imageUrl || '');
    setFAvailable(p.isAvailable);
    setView('edit');
  };

  const handleBackToList = () => { setView('list'); if (selectedLoc) fetchProducts(selectedLoc.id); };

  // Xóa sản phẩm
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        toast.success('Đã xóa sản phẩm!');
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error('Xóa thất bại.');
      }
    } catch { toast.error('Lỗi kết nối.'); }
  };

  // Toggle có hàng/hết hàng nhanh
  const handleToggle = async (p: ProductItem) => {
    try {
      const res = await fetch(`${API}/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: !p.isAvailable })
      });
      if (res.ok) {
        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isAvailable: !p.isAvailable } : x));
        toast.success(!p.isAvailable ? 'Đã mở bán lại!' : 'Đã tạm dừng bán.');
      }
    } catch { toast.error('Lỗi kết nối.'); }
  };

  // Lưu sản phẩm
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) { toast.warning('Nhập tên sản phẩm.'); return; }
    if (fPrice <= 0) { toast.warning('Giá phải lớn hơn 0.'); return; }
    if (!selectedLoc) return;
    setIsSaving(true);
    try {
      const payload = {
        locationId: selectedLoc.id,
        name: fName.trim(),
        category: fCategory || (categories.length > 0 ? categories[0].name : 'OTHER'),
        description: fDesc.trim() || undefined,
        price: Number(fPrice),
        imageUrl: fImageUrl.trim() || undefined,
        isAvailable: fAvailable
      };
      const url = view === 'add' ? `${API}/products` : `${API}/products/${editingId}`;
      const method = view === 'add' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || `HTTP ${res.status}`);
      }
      toast.success(view === 'add' ? '✅ Đã thêm sản phẩm!' : '✅ Đã cập nhật!');
      handleBackToList();
    } catch (err: any) {
      toast.error('Lưu thất bại', { description: err.message });
    } finally { setIsSaving(false); }
  };

  // ─── CRUD DANH MỤC ──────────────────────────────────────────────────────
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) { toast.warning('Vui lòng nhập tên danh mục.'); return; }
    setIsSavingCat(true);
    try {
      const url = editingCatId ? `${API}/product-categories/${editingCatId}` : `${API}/product-categories`;
      const method = editingCatId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: catName.trim(), icon: catIcon })
      });
      if (!res.ok) throw new Error();
      toast.success(editingCatId ? 'Đã cập nhật danh mục!' : 'Đã thêm danh mục mới!');
      setCatName('');
      setCatIcon('📦');
      setEditingCatId(null);
      fetchCategories();
    } catch {
      toast.error('Lỗi khi lưu danh mục.');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleEditCat = (cat: ProductCategoryItem) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatIcon(cat.icon || '📦');
  };

  const handleDeleteCat = async (cat: ProductCategoryItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Các sản phẩm thuộc danh mục này sẽ giữ nguyên tên danh mục cũ.`)) return;
    try {
      const res = await fetch(`${API}/product-categories/${cat.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Đã xóa danh mục "${cat.name}"`);
        fetchCategories();
        if (editingCatId === cat.id) {
          setEditingCatId(null);
          setCatName('');
          setCatIcon('📦');
        }
      } else {
        toast.error('Không thể xóa danh mục này.');
      }
    } catch {
      toast.error('Lỗi kết nối.');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCatInfo(p.category).label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── VIEW: CHỌN CƠ SỞ ────────────────────────────────────────────────────
  if (view === 'select') return (
    <div className="space-y-6 text-left font-sans text-slate-100">
      <div>
        <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-500" /> Quản Lý Sản Phẩm Bán Kèm
        </h3>
        <p className="text-xs text-slate-400 m-0 mt-1">Chọn cơ sở để quản lý sản phẩm phụ trợ</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {locations.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs">
            Bạn chưa có cơ sở nào. Hãy tạo cơ sở trong mục Quản Lý Cơ Sở.
          </div>
        ) : locations.map(loc => (
          <button key={loc.id} onClick={() => handleSelectLoc(loc)}
            className="flex items-center gap-3 p-5 bg-slate-900/40 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left transition group cursor-pointer w-full">
            <Building2 className="w-8 h-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-black text-white m-0">{loc.name}</p>
              <p className="text-[10px] text-slate-400">Bấm để xem sản phẩm</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── VIEW: QUẢN LÝ DANH MỤC ───────────────────────────────────────────────
  if (view === 'categories') return (
    <div className="space-y-6 text-left font-sans text-slate-100 animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5">
        <button type="button" onClick={handleBackToList} className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-base font-black text-white m-0">🏷️ Quản Lý Danh Mục Sản Phẩm</h3>
          <p className="text-[11px] text-slate-400 m-0">Thêm, sửa, xóa các phân loại nước giải khát, dụng cụ cho thuê tại quầy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Form thêm/sửa danh mục */}
        <form onSubmit={handleSaveCategory} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-950 pb-2.5">
            {editingCatId ? '✏️ Sửa danh mục' : '✨ Thêm danh mục mới'}
          </h4>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-550 uppercase block">Tên danh mục *</label>
            <input type="text" value={catName} onChange={e => setCatName(e.target.value)} required placeholder="Ví dụ: Đồ ăn vặt, Khăn lạnh..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-550 uppercase block">Biểu tượng / Emoji</label>
            <div className="flex gap-2 mb-2">
              <span className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">{catIcon}</span>
              <input type="text" value={catIcon} onChange={e => setCatIcon(e.target.value)} maxLength={2} placeholder="📦"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none text-center font-bold" />
            </div>
            <div className="grid grid-cols-5 gap-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-900">
              {COMMON_EMOJIS.map(emoji => (
                <button key={emoji} type="button" onClick={() => setCatIcon(emoji)}
                  className={`p-1.5 hover:bg-slate-800 rounded text-center text-sm cursor-pointer border-0 transition ${catIcon === emoji ? 'bg-amber-500/20 scale-110' : 'bg-transparent'}`}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={isSavingCat}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl border-0 cursor-pointer transition flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10">
              <Check className="w-3.5 h-3.5" />
              {editingCatId ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
            {editingCatId && (
              <button type="button" onClick={() => { setEditingCatId(null); setCatName(''); setCatIcon('📦'); }}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-400 rounded-xl border border-slate-800 cursor-pointer">
                Hủy
              </button>
            )}
          </div>
        </form>

        {/* Danh sách danh mục hiện có */}
        <div className="md:col-span-2 bg-slate-900/20 border border-slate-850 rounded-3xl p-5 space-y-3">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-950">Danh mục hiện có ({categories.length})</h4>
          <div className="divide-y divide-slate-950">
            {categories.map(cat => (
              <div key={cat.id} className="py-3 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-center text-lg">{cat.icon}</span>
                  <div>
                    <span className="text-xs font-bold text-white block">{cat.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono">ID: {cat.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <button onClick={() => handleEditCat(cat)} className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 rounded-lg transition cursor-pointer" title="Chỉnh sửa">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteCat(cat)} className="p-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-405 rounded-lg transition cursor-pointer" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ── VIEW: FORM THÊM / SỬA SẢN PHẨM ───────────────────────────────────────
  if (view === 'add' || view === 'edit') return (
    <div className="space-y-6 text-left font-sans text-slate-100 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBackToList} className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-base font-black text-white m-0">{view === 'add' ? '✨ Thêm Sản Phẩm Mới' : `✏️ Sửa: ${fName}`}</h3>
            <p className="text-[11px] text-slate-400 m-0">Cơ sở: <span className="text-amber-400 font-bold">{selectedLoc?.name}</span></p>
          </div>
        </div>
        <button type="button" onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0">
          <Save className="w-4 h-4" /> {isSaving ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
        </button>
      </div>

      <div className="max-w-2xl bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 mx-auto">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase block">Tên sản phẩm *</label>
          <input type="text" value={fName} onChange={e => setFName(e.target.value)} autoFocus
            placeholder="Ví dụ: Nước Revive 500ml, Thuê vợt cầu lông..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block font-semibold flex items-center justify-between">
              <span>Danh mục</span>
              <button type="button" onClick={() => setView('categories')} className="text-amber-500 hover:text-amber-400 text-[8px] bg-transparent border-0 cursor-pointer p-0 underline">+ Quản lý danh mục</button>
            </label>
            <select value={fCategory} onChange={e => setFCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer font-bold">
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
              {categories.length === 0 && (
                <option value="">(Không có danh mục nào)</option>
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Đơn giá (đ) *</label>
            <input type="number" value={fPrice} min={0} onChange={e => setFPrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono font-bold text-amber-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850">
          <div>
            <span className="text-[10px] font-bold text-white block">Còn hàng / Sẵn sàng</span>
            <span className="text-[9px] text-slate-500">Sản phẩm này có đang sẵn sàng cung cấp?</span>
          </div>
          <input type="checkbox" checked={fAvailable} onChange={e => setFAvailable(e.target.checked)} className="w-4 h-4 accent-amber-500 cursor-pointer" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase block">Mô tả</label>
          <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Mô tả ngắn về sản phẩm..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 min-h-[65px] resize-none" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase block">URL Hình ảnh</label>
          <input type="url" value={fImageUrl} onChange={e => setFImageUrl(e.target.value)} placeholder="https://..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700" />
          {fImageUrl && <div className="mt-2 h-24 rounded-xl overflow-hidden border border-slate-800">
            <img src={fImageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>}
        </div>
      </div>
    </div>
  );

  // ── VIEW: DANH SÁCH SẢN PHẨM ─────────────────────────────────────────────
  return (
    <div className="space-y-6 text-left font-sans text-slate-100 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {locations.length > 1 && (
            <button type="button" onClick={() => setView('select')} className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-500" /> Quản Lý Sản Phẩm Bán Kèm
            </h3>
            <p className="text-xs text-slate-400 m-0">
              <span className="text-amber-400 font-bold">{selectedLoc?.name}</span>
              <span className="mx-1.5 text-slate-700">•</span>{products.length} sản phẩm
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('categories')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-450 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer">
            <Tag className="w-4 h-4 text-amber-500" />
            Quản Lý Danh Mục
          </button>
          <button onClick={() => selectedLoc && fetchProducts(selectedLoc.id)} disabled={isLoading}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-50" title="Làm mới">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition shadow-lg shadow-amber-500/10 cursor-pointer border-0">
            <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {locations.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {locations.map(loc => (
            <button key={loc.id} onClick={() => { setSelectedLoc(loc); fetchProducts(loc.id); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${selectedLoc?.id === loc.id ? 'bg-amber-500/10 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}>
              {loc.name}
            </button>
          ))}
        </div>
      )}

      <PartnerFilterBar mode="locations" searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400">Đang tải sản phẩm từ cơ sở dữ liệu...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="text-4xl">🛍️</div>
          <p className="text-sm font-bold text-slate-300">
            {searchTerm ? 'Không tìm thấy sản phẩm khớp.' : 'Chưa có sản phẩm nào.'}
          </p>
          {!searchTerm && <p className="text-xs text-slate-500">Nhấn "Thêm Sản Phẩm Mới" để bắt đầu.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const cat = getCatInfo(p.category);
            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 hover:border-slate-750 transition rounded-3xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        : <span>{cat.icon}</span>}
                    </div>
                    <button onClick={() => handleToggle(p)}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold border-0 cursor-pointer transition ${p.isAvailable ? 'bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-red-500/10 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                      title="Bấm để đổi trạng thái">
                      {p.isAvailable ? 'Còn hàng' : 'Tạm hết'}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white m-0 leading-tight">{p.name}</h4>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-850">{cat.icon} {cat.label}</span>
                    {p.description && <p className="text-[11px] text-slate-400 leading-relaxed m-0 pt-1 line-clamp-2">{p.description}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Đơn giá bán lẻ</span>
                    <strong className="text-base font-extrabold text-amber-400 font-mono">{(Number(p.price)).toLocaleString('vi-VN')}đ</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleOpenEdit(p)} className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-slate-400 hover:text-amber-400 transition cursor-pointer" title="Chỉnh sửa">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition cursor-pointer" title="Xóa">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

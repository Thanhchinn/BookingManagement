import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit3, ShoppingBag, RefreshCw, Package, Coffee, Wrench, MoreHorizontal, Tag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PartnerFilterBar } from '../components/PartnerFilterBar';

const API = 'http://localhost:3000';

interface ProductManagementPageProps {
  locationId: string;
  locationName: string;
  onBack: () => void;
}

interface ProductItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface ProductCategoryItem {
  id: string;
  name: string;
  icon: string;
}

const COMMON_EMOJIS = ['💧', '🍿', '🏸', '👕', '📦', '🥤', '❄️', '🍕', '🍔', '💵', '👟', '🧴', '🍎', '🥐', '🔋'];

export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  locationId,
  locationName,
  onBack
}) => {
  const token = localStorage.getItem('user_token');

  // Trạng thái view: 'list' | 'add' | 'edit' | 'categories'
  const [productView, setProductView] = useState<'list' | 'add' | 'edit' | 'categories'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<ProductCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states cho sản phẩm
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPrice, setProdPrice] = useState(10000);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);

  // Form states cho danh mục
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
      if (list.length > 0 && !prodCategory) {
        setProdCategory(list[0].name);
      }
    } catch (err: any) {
      console.error('[Categories] fetch error:', err);
    }
  }, [token, prodCategory]);

  const fetchProducts = useCallback(async () => {
    if (!token) {
      toast.error('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/products/location/${locationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Lỗi HTTP ${res.status}`);
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('[ProductMgmt] fetchProducts error:', err);
      toast.error('Không thể tải sản phẩm', { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [locationId, token]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Helpers hiển thị danh mục
  const getCategoryInfo = (catValue: string) => {
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
    setProdName('');
    setProdCategory(categories.length > 0 ? categories[0].name : '');
    setProdPrice(10000);
    setProdDesc('');
    setProdImageUrl('');
    setProdIsAvailable(true);
  };

  const handleOpenAdd = () => {
    setEditingProductId(null);
    resetForm();
    setProductView('add');
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(Number(p.price));
    setProdDesc(p.description || '');
    setProdImageUrl(p.imageUrl || '');
    setProdIsAvailable(p.isAvailable ?? true);
    setProductView('edit');
  };

  const handleBackToList = () => {
    setProductView('list');
    fetchProducts();
  };

  const handleDelete = async (prodId: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/products/${prodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Đã xóa sản phẩm "${name}"!`);
        setProducts(prev => prev.filter(p => p.id !== prodId));
      } else {
        const errBody = await res.json().catch(() => ({}));
        toast.error('Xóa thất bại', { description: errBody.message || `HTTP ${res.status}` });
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối máy chủ.', { description: err.message });
    }
  };

  const handleToggleAvailable = async (prod: ProductItem) => {
    try {
      const res = await fetch(`${API}/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isAvailable: !prod.isAvailable })
      });
      if (res.ok) {
        toast.success(!prod.isAvailable ? `"${prod.name}" đã có hàng trở lại!` : `"${prod.name}" đã tạm ngưng bán.`);
        setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, isAvailable: !prod.isAvailable } : p));
      } else {
        toast.error('Cập nhật thất bại.');
      }
    } catch {
      toast.error('Lỗi kết nối.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) { toast.warning('Vui lòng nhập tên sản phẩm.'); return; }
    if (prodPrice <= 0) { toast.warning('Đơn giá phải lớn hơn 0.'); return; }

    setIsSaving(true);
    try {
      const payload = {
        locationId,
        name: prodName.trim(),
        category: prodCategory || (categories.length > 0 ? categories[0].name : 'OTHER'),
        description: prodDesc.trim() || undefined,
        price: Number(prodPrice),
        imageUrl: prodImageUrl.trim() || undefined,
        isAvailable: prodIsAvailable
      };

      const url = productView === 'add'
        ? `${API}/products`
        : `${API}/products/${editingProductId}`;
      const method = productView === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Lỗi HTTP ${res.status}`);
      }

      toast.success(productView === 'add' ? '✅ Đã thêm sản phẩm mới!' : '✅ Đã cập nhật sản phẩm!');
      handleBackToList();
    } catch (err: any) {
      console.error('[ProductMgmt] save error:', err);
      toast.error('Lưu thất bại', { description: err.message });
    } finally {
      setIsSaving(false);
    }
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryInfo(p.category).label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── VIEW: QUẢN LÝ DANH MỤC ───────────────────────────────────────────────
  if (productView === 'categories') return (
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
                  <button onClick={() => handleDeleteCat(cat)} className="p-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer" title="Xóa">
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

  // ─── VIEW: FORM ADD / EDIT ────────────────────────────────────────────────
  if (productView === 'add' || productView === 'edit') {
    return (
      <div className="space-y-6 text-left font-sans text-slate-100 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h3 className="text-base font-black text-white m-0 tracking-tight">
                {productView === 'add' ? '✨ Thêm Sản Phẩm Mới' : `✏️ Chỉnh sửa: ${prodName}`}
              </h3>
              <p className="text-[11px] text-slate-400 m-0">
                Cơ sở: <span className="text-amber-400 font-bold">{locationName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Sản Phẩm'}</span>
          </button>
        </div>

        <div className="max-w-2xl bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 mx-auto">
          <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">🏷️</span>
            Thông tin sản phẩm
          </h4>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Tên sản phẩm / dịch vụ *</label>
            <input
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="Ví dụ: Nước Revive 500ml lạnh, Thuê áo thi đấu..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Danh mục */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block flex items-center justify-between">
                <span>Phân loại danh mục</span>
                <button type="button" onClick={() => setProductView('categories')} className="text-amber-500 hover:text-amber-400 text-[8px] bg-transparent border-0 cursor-pointer p-0 underline">+ Quản lý danh mục</button>
              </label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
                {categories.length === 0 && (
                  <option value="">(Không có danh mục nào)</option>
                )}
              </select>
            </div>

            {/* Giá */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Đơn giá (đ) *</label>
              <input
                type="number"
                value={prodPrice}
                min={0}
                onChange={(e) => setProdPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono font-bold text-amber-400"
              />
            </div>
          </div>

          {/* Toggle sẵn sàng */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850">
            <div>
              <span className="text-[10px] font-bold text-white block">Sẵn sàng cung cấp</span>
              <span className="text-[9px] text-slate-500 block">Sản phẩm có đang còn hàng / đang cho thuê?</span>
            </div>
            <button
              type="button"
              onClick={() => setProdIsAvailable(p => !p)}
              className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-0 ${prodIsAvailable ? 'bg-amber-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${prodIsAvailable ? 'left-5.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Mô tả sản phẩm</label>
            <textarea
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Mô tả ngắn về sản phẩm, thương hiệu, dung tích..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 min-h-[70px] resize-none"
            />
          </div>

          {/* Ảnh */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Đường dẫn ảnh (URL)</label>
            <input
              type="url"
              value={prodImageUrl}
              onChange={(e) => setProdImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700"
            />
            {prodImageUrl && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-slate-800">
                <img src={prodImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW: DANH SÁCH SẢN PHẨM ────────────────────────────────────────────
  return (
    <div className="space-y-6 text-left font-sans text-slate-100 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-base font-black text-white m-0 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
              Quản Lý Sản Phẩm Bán Kèm
            </h3>
            <p className="text-[11px] text-slate-400 m-0">
              Cơ sở: <span className="text-amber-400 font-bold">{locationName}</span>
              <span className="mx-1.5 text-slate-700">•</span>
              <span className="text-slate-400">{products.length} sản phẩm</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setProductView('categories')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-455 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer">
            <Tag className="w-4 h-4 text-amber-500" />
            Quản Lý Danh Mục
          </button>
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <PartnerFilterBar
        mode="locations"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Nội dung */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400">Đang tải sản phẩm...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center space-y-3">
          <div className="text-4xl">🛍️</div>
          <p className="text-sm font-bold text-slate-300">
            {searchTerm ? 'Không tìm thấy sản phẩm khớp với từ khóa.' : 'Cơ sở này chưa có sản phẩm bán kèm.'}
          </p>
          <p className="text-xs text-slate-500">
            {!searchTerm && 'Nhấn "Thêm Sản Phẩm" để khai báo nước uống, dụng cụ cho thuê...'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map(p => {
            const catInfo = getCategoryInfo(p.category);
            return (
              <div
                key={p.id}
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl overflow-hidden flex flex-col transition group"
              >
                {/* Ảnh */}
                <div className="h-36 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-slate-700" />
                  )}
                  {/* Badge trạng thái */}
                  <button
                    onClick={() => handleToggleAvailable(p)}
                    className={`absolute top-2.5 right-2.5 text-[8px] font-black px-2 py-0.5 rounded cursor-pointer border-0 transition ${
                      p.isAvailable
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/20 hover:bg-red-950/90 hover:text-red-400'
                        : 'bg-red-950/90 text-red-400 border border-red-500/20 hover:bg-emerald-950/90 hover:text-emerald-400'
                    }`}
                    title="Bấm để đổi trạng thái"
                  >
                    {p.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                  </button>
                </div>

                {/* Thông tin */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-black text-white leading-tight line-clamp-2">{p.name}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900">
                      {catInfo.icon}
                      {catInfo.label}
                    </span>
                    {p.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 italic">{p.description}</p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-950 flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {(Number(p.price) || 0).toLocaleString('vi-VN')}đ
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 rounded-lg transition cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

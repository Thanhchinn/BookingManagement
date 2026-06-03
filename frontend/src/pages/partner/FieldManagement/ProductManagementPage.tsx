import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Edit3, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ProductManagementPageProps {
  locationId: string;
  locationName: string;
  onBack: () => void;
}

export const ProductManagementPage: React.FC<ProductManagementPageProps> = ({
  locationId,
  locationName,
  onBack
}) => {
  const token = localStorage.getItem('user_token');

  // Trạng thái view nội bộ:
  // - 'list': hiển thị danh sách sản phẩm
  // - 'add': form thêm mới sản phẩm
  // - 'edit': form chỉnh sửa sản phẩm
  const [productView, setProductView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // States danh sách sản phẩm
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // States biểu mẫu (Product Form)
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('DRINK');
  const [prodPrice, setProdPrice] = useState(10000);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodIsAvailable, setProdIsAvailable] = useState(true);

  // Load danh sách sản phẩm của cơ sở
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/products/location/${locationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error('Lỗi tải danh sách sản phẩm');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [locationId, productView]);

  // Kích hoạt form thêm sản phẩm
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdName('');
    setProdCategory('DRINK');
    setProdPrice(10000);
    setProdDesc('');
    setProdImageUrl('');
    setProdIsAvailable(true);
    setProductView('add');
  };

  // Kích hoạt form chỉnh sửa sản phẩm
  const handleOpenEditProduct = async (product: any) => {
    setEditingProductId(product.id);
    setProdName(product.name);
    setProdCategory(product.category);
    setProdPrice(Number(product.price));
    setProdDesc(product.description || '');
    setProdImageUrl(product.imageUrl || '');
    setProdIsAvailable(product.isAvailable ?? true);
    setProductView('edit');
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (prodId: string, prodName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${prodName}" khỏi cơ sở?`)) {
      try {
        const res = await fetch(`http://localhost:3000/products/${prodId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success(`Đã xóa sản phẩm "${prodName}" thành công!`);
          fetchProducts();
        } else {
          toast.error('Lỗi khi xóa sản phẩm từ hệ thống.');
        }
      } catch (err) {
        toast.error('Lỗi kết nối máy chủ.');
      }
    }
  };

  // Lưu sản phẩm
  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prodName.trim()) {
      toast.warning('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (prodPrice <= 0) {
      toast.warning('Đơn giá sản phẩm phải lớn hơn 0.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        locationId,
        name: prodName,
        category: prodCategory,
        description: prodDesc,
        price: Number(prodPrice),
        imageUrl: prodImageUrl || undefined,
        isAvailable: prodIsAvailable
      };

      const url = productView === 'add'
        ? 'http://localhost:3000/products'
        : `http://localhost:3000/products/${editingProductId}`;
      const method = productView === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Không thể lưu thông tin sản phẩm.');

      toast.success(productView === 'add' ? 'Đã thêm sản phẩm mới!' : 'Đã cập nhật sản phẩm thành công!');
      setProductView('list');
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi lưu sản phẩm', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Trình bày danh mục sản phẩm thân thiện
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'DRINK': return 'Nước uống / Giải khát';
      case 'FOOD': return 'Đồ ăn nhanh';
      case 'RENTAL': return 'Cho thuê dụng cụ';
      case 'OTHER': return 'Dịch vụ khác';
      default: return cat;
    }
  };

  if (isLoading && productView === 'list') {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 font-bold"></div>
        <p className="text-xs text-slate-400 font-medium">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  // ---------------- VIEW 1: LIST PRODUCTS ----------------
  if (productView === 'list') {
    return (
      <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
        
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
              <h3 className="text-lg font-black text-white m-0 tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Quản Lý Sản Phẩm Bán Kèm
              </h3>
              <p className="text-[11px] text-slate-400 m-0">Cơ sở: <span className="text-amber-400 font-bold">{locationName}</span></p>
            </div>
          </div>
          <button
            onClick={handleOpenAddProduct}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white rounded-xl transition duration-150 shadow-lg shadow-amber-500/10 cursor-pointer border-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>

        {/* List of Products */}
        {products.length === 0 ? (
          <div className="py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
            🛍️ Cơ sở này chưa khai báo sản phẩm bán kèm (nước suối, khăn lạnh, thuê áo tập, vợt...). Nhấn "Thêm Sản Phẩm" để bắt đầu.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(p => (
              <div 
                key={p.id} 
                className="bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between transition group"
              >
                {/* Product Image */}
                <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-700 animate-pulse" />
                  )}
                  <div className="absolute top-3 right-3">
                    {p.isAvailable ? (
                      <span className="text-[8px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/20">Còn hàng</span>
                    ) : (
                      <span className="text-[8px] font-black text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-500/20">Hết hàng</span>
                    )}
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-black text-white">{p.name}</span>
                      <span className="text-[8px] font-extrabold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-900 shrink-0">
                        {getCategoryLabel(p.category)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 italic m-0">{p.description || 'Không có mô tả cho sản phẩm này.'}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-950 flex justify-between items-center">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Đơn giá bán / thuê</span>
                    <span className="text-xs font-black text-amber-400 font-mono">{(Number(p.price) || 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                {/* Product Actions */}
                <div className="px-5 pb-5 pt-0 flex gap-2">
                  <button
                    onClick={() => handleOpenEditProduct(p)}
                    className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-[10px] font-bold text-slate-300 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3 text-amber-500" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-2 bg-slate-950 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ---------------- VIEW 2: ADD / EDIT PRODUCT ----------------
  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100 animate-in fade-in duration-200">
      
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setProductView('list')}
            className="p-2 hover:bg-slate-900 hover:text-white text-slate-400 rounded-xl transition cursor-pointer border border-slate-800 bg-slate-950"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-lg font-black text-white m-0 tracking-tight">
              {productView === 'add' ? 'Thêm Sản Phẩm Mới' : `Chỉnh sửa sản phẩm: ${prodName}`}
            </h3>
            <p className="text-[11px] text-slate-400 m-0">Khai báo sản phẩm hoặc dịch vụ phụ trợ đi kèm tại cơ sở kinh doanh</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveProductForm}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-xs font-bold text-white rounded-xl transition cursor-pointer border-0 shadow-lg shadow-amber-500/10"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}</span>
        </button>
      </div>

      <div className="max-w-2xl bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 mx-auto">
        <h4 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-slate-950 pb-3 flex items-center gap-2">
          <span className="p-1 bg-amber-500/10 text-amber-500 rounded-lg">🏷️</span>
          Thông tin sản phẩm
        </h4>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Tên sản phẩm / dịch vụ *</label>
            <input 
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="Ví dụ: Nước uống Revive 500ml, Thuê áo Bib màu cam..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Phân loại danh mục</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="DRINK">Nước uống / Giải khát</option>
                <option value="FOOD">Đồ ăn nhanh</option>
                <option value="RENTAL">Cho thuê dụng cụ</option>
                <option value="OTHER">Dịch vụ khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase block">Đơn giá (đ) *</label>
              <input 
                type="number"
                value={prodPrice}
                onChange={(e) => setProdPrice(Number(e.target.value))}
                placeholder="Ví dụ: 15000"
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono font-bold text-amber-400"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-850">
            <div>
              <span className="text-[10px] font-bold text-white block">Sẵn sàng cung cấp</span>
              <span className="text-[9px] text-slate-500 block">Sản phẩm này có đang còn hàng hoặc sẵn sàng cho thuê?</span>
            </div>
            <input 
              type="checkbox"
              checked={prodIsAvailable}
              onChange={(e) => setProdIsAvailable(e.target.checked)}
              className="w-4 h-4 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Mô tả sản phẩm</label>
            <textarea 
              value={prodDesc}
              onChange={(e) => setProdDesc(e.target.value)}
              placeholder="Ví dụ: Nước bù khoáng Revive chai 500ml lạnh..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 min-h-[70px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-500 uppercase block">Đường dẫn ảnh sản phẩm (Image URL)</label>
            <input 
              type="text"
              value={prodImageUrl}
              onChange={(e) => setProdImageUrl(e.target.value)}
              placeholder="https://example.com/drink.jpg"
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none placeholder-slate-700 font-semibold"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

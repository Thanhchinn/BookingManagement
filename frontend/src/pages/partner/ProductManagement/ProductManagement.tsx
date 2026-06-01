import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Edit3, 
  Trash2, 
  Search
} from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';

interface Product {
  id: string;
  name: string;
  price: number;
  category: 'DRINK' | 'FOOD' | 'EQUIPMENT';
  description: string;
  isAvailable: boolean;
  image: string;
}

export const ProductManagement: React.FC = () => {
  // Mock state cho chủ sân quản lý sản phẩm phụ trợ
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Nước khoáng Revive Chanh Muối', price: 15000, category: 'DRINK', description: 'Chai 500ml bù khoáng, điện giải cực tốt khi chơi thể thao', isAvailable: true, image: '💧' },
    { id: '2', name: 'Nước tăng lực Sting Dâu', price: 15000, category: 'DRINK', description: 'Chai 330ml tăng cường năng lượng tức thì', isAvailable: true, image: '🥤' },
    { id: '3', name: 'Thuê Vợt Cầu Lông Pro Kennex', price: 30000, category: 'EQUIPMENT', description: 'Vợt căng sẵn 10.5kg lực căng cao, phù hợp người chơi khá', isAvailable: true, image: '🏸' },
    { id: '4', name: 'Thuê Bộ Áo Nhóm Bib (10 cái)', price: 40000, category: 'EQUIPMENT', description: 'Đủ màu cam, xanh lá bàng dễ dàng phân chia đội hình đấu', isAvailable: true, image: '👕' },
    { id: '5', name: 'Snack khoai tây Oishi', price: 12000, category: 'FOOD', description: 'Gói lớn ăn nhẹ tiếp thêm calo giải lao ca đấu', isAvailable: false, image: '🍿' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState(15000);
  const [category, setCategory] = useState<'DRINK' | 'FOOD' | 'EQUIPMENT'>('DRINK');
  const [desc, setDesc] = useState('');
  const [isAvail, setIsAvail] = useState(true);
  const [imageEmoji, setImageEmoji] = useState('💧');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mở modal thêm mới
  const handleOpenAdd = () => {
    setName('');
    setPrice(15000);
    setCategory('DRINK');
    setDesc('');
    setIsAvail(true);
    setImageEmoji('🥤');
    setShowAddModal(true);
  };

  // Thêm mới sản phẩm
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: String(products.length + 1),
      name,
      price: Number(price),
      category,
      description: desc,
      isAvailable: isAvail,
      image: imageEmoji
    };

    setProducts([...products, newProduct]);
    setShowAddModal(false);
    alert('Thêm sản phẩm dịch vụ mới thành công!');
  };

  // Mở modal sửa
  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setName(p.name);
    setPrice(p.price);
    setCategory(p.category);
    setDesc(p.description);
    setIsAvail(p.isAvailable);
    setImageEmoji(p.image);
    setShowEditModal(true);
  };

  // Cập nhật sản phẩm
  const handleEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          name,
          price: Number(price),
          category,
          description: desc,
          isAvailable: isAvail,
          image: imageEmoji
        };
      }
      return p;
    }));

    setShowEditModal(false);
    setSelectedProduct(null);
    alert('Cập nhật thông tin sản phẩm thành công!');
  };

  // Xóa sản phẩm
  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm/dịch vụ này khỏi kho quầy chi nhánh?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Đã xóa sản phẩm khỏi danh mục.');
    }
  };

  const getCategoryBadge = (cat: 'DRINK' | 'FOOD' | 'EQUIPMENT') => {
    switch (cat) {
      case 'DRINK':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-850">Nước giải khát</span>;
      case 'FOOD':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-850">Đồ ăn nhẹ</span>;
      case 'EQUIPMENT':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-850">Thuê dụng cụ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Quản Lý Sản Phẩm & Dịch Vụ Phụ Trợ
          </h3>
          <p className="text-xs text-slate-400 m-0">Đăng bán nước giải khát, đồ ăn nhẹ hoặc cho thuê giày vợt ngay tại quầy chi nhánh</p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white border-0 rounded-xl transition duration-150 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 outline-none transition"
          />
        </div>
      </div>

      {/* Grid danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
            <span className="text-3xl block">📦</span>
            <h4 className="text-sm font-bold text-white m-0">Không tìm thấy sản phẩm nào</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Chưa có sản phẩm nào phù hợp với bộ lọc tìm kiếm của bạn.</p>
          </div>
        ) : (
          filteredProducts.map(p => (
            <div 
              key={p.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-750 transition rounded-3xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                    {p.image}
                  </span>
                  
                  {p.isAvailable ? (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Còn hàng</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">Tạm hết</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white m-0 tracking-tight leading-tight">{p.name}</h4>
                  {getCategoryBadge(p.category)}
                  <p className="text-[11px] text-slate-450 leading-relaxed m-0 pt-1">{p.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                <div>
                  <span className="text-[9px] text-slate-550 block font-bold uppercase tracking-wider">Đơn giá bán lẻ</span>
                  <strong className="text-base font-extrabold text-amber-400 font-mono">{p.price.toLocaleString()}đ</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Dialog Modal */}
      <ProductFormModal
        isOpen={showAddModal}
        isEdit={false}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        category={category}
        setCategory={setCategory}
        desc={desc}
        setDesc={setDesc}
        isAvail={isAvail}
        setIsAvail={setIsAvail}
        imageEmoji={imageEmoji}
        setImageEmoji={setImageEmoji}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
      />

      <ProductFormModal
        isOpen={showEditModal}
        isEdit={true}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        category={category}
        setCategory={setCategory}
        desc={desc}
        setDesc={setDesc}
        isAvail={isAvail}
        setIsAvail={setIsAvail}
        imageEmoji={imageEmoji}
        setImageEmoji={setImageEmoji}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
      />

    </div>
  );
};

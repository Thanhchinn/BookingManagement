import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  RefreshCw, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  ClipboardCheck, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/Badge';

export const MatchmakingModeration: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING'); // PENDING, OPEN, REJECTED, ALL
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchPosts = async (page = 1, isBg = false) => {
    if (!isBg) setLoading(true);
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:3000/matchmaking/admin/posts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPosts(data.data || []);
        setTotalCount(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        setCurrentPage(data.meta?.page || 1);
      } else {
        const errData = await response.json();
        toast.error('Lỗi tải bài đăng', { description: errData.message || 'Không thể lấy dữ liệu.' });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      if (!isBg) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, false);
  }, [statusFilter]);

  const handleApprove = async (id: string, approve: boolean) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const actionText = approve ? 'phê duyệt' : 'từ chối';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} bài đăng này?`)) return;

    try {
      const response = await fetch(`http://localhost:3000/matchmaking/admin/posts/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: approve ? 'OPEN' : 'REJECTED'
        })
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      if (response.ok) {
        toast.success(`Đã ${actionText} bài đăng thành công!`);
        // Tải lại danh sách
        fetchPosts(currentPage, false);
      } else {
        const errData = await response.json();
        toast.error(`Lỗi khi ${actionText}`, { description: errData.message || 'Hành động thất bại.' });
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const handleDeletePost = async (id: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    if (!window.confirm('Bạn có chắc chắn muốn xóa bài đăng ghép đôi này không?')) return;

    try {
      const response = await fetch(`http://localhost:3000/matchmaking/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_profile');
        toast.error('Phiên đăng nhập hết hạn', { description: 'Vui lòng đăng nhập lại.' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }

      if (response.ok) {
        toast.success('Đã xóa bài đăng thành công!');
        fetchPosts(currentPage, false);
      } else {
        const errData = await response.json();
        toast.error('Lỗi khi xóa bài đăng', { description: errData.message || 'Hành động thất bại.' });
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  // Lọc cục bộ bằng từ khóa
  const filteredPosts = posts.filter(post => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query) ||
      post.hostName.toLowerCase().includes(query) ||
      post.courtName.toLowerCase().includes(query) ||
      post.sport.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 text-left relative font-sans text-slate-100">
      
      {/* 1. Tiêu đề và nút làm mới */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white m-0 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            Kiểm duyệt bài đăng ghép đôi
          </h2>
          <p className="text-xs text-slate-500 m-0">Quản lý và phê duyệt các yêu cầu đăng bài tìm đồng đội từ người dùng.</p>
        </div>

        <button
          onClick={() => fetchPosts(currentPage, false)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-xs font-bold text-slate-300 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* 2. Bộ lọc trạng thái (Tabs) */}
      <div className="flex border-b border-slate-800 gap-2">
        {[
          { id: 'PENDING', label: 'Chờ duyệt', countColor: 'text-amber-400' },
          { id: 'OPEN', label: 'Đang tuyển (Hoạt động)', countColor: 'text-emerald-400' },
          { id: 'FULL', label: 'Đã đủ người', countColor: 'text-blue-400' },
          { id: 'REJECTED', label: 'Bị từ chối', countColor: 'text-red-400' },
          { id: 'ALL', label: 'Tất cả bài đăng', countColor: 'text-slate-400' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 text-xs font-bold transition border-b-2 cursor-pointer border-none bg-transparent ${
              statusFilter === tab.id
                ? 'border-b-2 border-solid border-emerald-500 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Tìm kiếm nội dung */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Lọc nhanh trong trang theo tên host, tiêu đề, môn, sân đấu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 focus:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 outline-none transition"
        />
      </div>

      {/* 4. Danh sách các bài đăng (Table style) */}
      <div className="admin-table-container bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="admin-table-scroll overflow-x-auto">
          <table className="admin-table w-full border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider text-left border-b border-slate-800">
                <th className="p-4 w-44">Người đăng (Host)</th>
                <th className="p-4">Tiêu đề & mô tả</th>
                <th className="p-4 w-48">Thời gian & Địa điểm</th>
                <th className="p-4 w-32 text-center">Môn thể thao</th>
                <th className="p-4 w-28 text-center">Trạng thái</th>
                <th className="p-4 w-44 text-center">Thao tác duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Đang tải danh sách bài viết...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-slate-600" />
                      <span>Không tìm thấy bài đăng ghép đôi nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-950/40 transition">
                    
                    {/* Host */}
                    <td className="p-4 valign-top">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs select-none">
                          {post.hostAvatar}
                        </span>
                        <div className="text-left leading-tight">
                          <strong className="text-white block font-bold">{post.hostName}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">UID: {post.userId}</span>
                        </div>
                      </div>
                    </td>

                    {/* Content */}
                    <td className="p-4 text-left">
                      <div className="space-y-1 max-w-md">
                        <strong className="text-white text-xs block font-bold leading-snug">{post.title}</strong>
                        <p className="text-[11px] text-slate-400 m-0 leading-relaxed truncate">{post.description || 'Không có mô tả.'}</p>
                      </div>
                    </td>

                    {/* Time & Place */}
                    <td className="p-4 text-left text-[11px] text-slate-400 leading-normal">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{post.playDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{post.startTime} - {post.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[200px]">{post.courtName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="p-4 text-center">
                      <span className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded text-emerald-400 font-bold uppercase inline-block">
                        {post.sport}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      {post.status === 'PENDING' ? (
                        <Badge status="warning">Chờ duyệt</Badge>
                      ) : post.status === 'REJECTED' ? (
                        <Badge status="danger">Từ chối</Badge>
                      ) : post.status === 'FULL' ? (
                        <Badge status="info">Đủ người</Badge>
                      ) : (
                        <Badge status="success">Đang tuyển ({post.currentPlayers}/{post.maxPlayers})</Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2 items-center">
                        {post.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(post.id, true)}
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-none cursor-pointer flex items-center justify-center transition"
                              title="Phê duyệt bài đăng"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprove(post.id, false)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg border-none cursor-pointer flex items-center justify-center transition"
                              title="Từ chối bài đăng"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 bg-red-600/25 hover:bg-red-600/35 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg cursor-pointer flex items-center justify-center transition"
                          title="Xóa bài đăng ghép đôi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
          <span>Hiển thị trang {currentPage} / {totalPages} (Tổng {totalCount} bài đăng)</span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPosts(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              Trang trước
            </button>
            <button
              onClick={() => fetchPosts(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

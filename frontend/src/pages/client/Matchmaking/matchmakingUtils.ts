import type { MatchPost } from '../../../types';

export type SkillKey = MatchPost['skillLevel'];

/** Nhãn + màu cho trình độ yêu cầu (enum backend → nhãn hiển thị) */
export const SKILL_META: Record<SkillKey, { label: string; sub: string; className: string; bars: number }> = {
  ANY: { label: 'Mọi trình độ', sub: 'Ai cũng chơi được', className: 'text-zinc-300 border-zinc-600 bg-zinc-800/60', bars: 0 },
  BEGINNER: { label: 'Newbie', sub: 'Mới chơi', className: 'text-sky-300 border-sky-500/40 bg-sky-500/10', bars: 1 },
  INTERMEDIATE: { label: 'Bán chuyên', sub: 'Khá', className: 'text-amber-300 border-amber-500/40 bg-amber-500/10', bars: 2 },
  ADVANCED: { label: 'Pro', sub: 'Chuyên nghiệp', className: 'text-rose-300 border-rose-500/40 bg-rose-500/10', bars: 3 },
};

export const getSkillMeta = (level?: string) =>
  SKILL_META[(level as SkillKey) in SKILL_META ? (level as SkillKey) : 'ANY'];

/** Chuẩn hoá mã môn → tên + màu nhấn */
export const getSportMeta = (type?: string): { name: string; accent: string; ring: string; glow: string } => {
  const t = (type || '').toLowerCase().trim();
  if (['cau-long', 'badminton', 'cầu lông'].includes(t))
    return { name: 'Cầu Lông', accent: 'text-lime-300', ring: 'hover:border-lime-400/40', glow: 'from-lime-400/15' };
  if (['bong-da', 'football', 'soccer', 'bóng đá'].includes(t))
    return { name: 'Bóng Đá', accent: 'text-emerald-300', ring: 'hover:border-emerald-400/40', glow: 'from-emerald-400/15' };
  if (['tennis', 'quần vợt'].includes(t))
    return { name: 'Tennis', accent: 'text-yellow-300', ring: 'hover:border-yellow-400/40', glow: 'from-yellow-400/15' };
  if (t === 'pickleball')
    return { name: 'Pickleball', accent: 'text-cyan-300', ring: 'hover:border-cyan-400/40', glow: 'from-cyan-400/15' };
  if (['bong-ro', 'basketball', 'bóng rổ'].includes(t))
    return { name: 'Bóng Rổ', accent: 'text-orange-300', ring: 'hover:border-orange-400/40', glow: 'from-orange-400/15' };
  return { name: type || 'Thể thao', accent: 'text-zinc-200', ring: 'hover:border-zinc-500/40', glow: 'from-zinc-400/10' };
};

/** Thời điểm bắt đầu (giờ địa phương) của kèo */
export const getMatchStart = (m: Pick<MatchPost, 'playDate' | 'startTime'>): Date | null => {
  if (!m.playDate || !m.startTime) return null;
  const [y, mo, d] = m.playDate.split('-').map(Number);
  const [h, mi] = m.startTime.split(':').map(Number);
  if ([y, mo, d, h, mi].some(Number.isNaN)) return null;
  return new Date(y, mo - 1, d, h, mi, 0, 0);
};

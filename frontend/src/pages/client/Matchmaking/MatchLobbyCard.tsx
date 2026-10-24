import React from 'react';
import { MapPin, CalendarDays, Clock, Plus, Flame, Timer, Crown, Hourglass, Check, ChevronRight } from 'lucide-react';
import type { MatchPost, Participant } from '../../../types';
import { getSkillMeta, getSportMeta, getMatchStart } from './matchmakingUtils';

interface MatchLobbyCardProps {
  match: MatchPost;
  now: number;
  userName?: string;
  index: number;
  onOpen: (m: MatchPost) => void;
  onJoin: (m: MatchPost) => void;
}

const MAX_AVATARS = 6;
const MAX_EMPTY = 4;

const Avatar: React.FC<{ p: Pick<Participant, 'name' | 'avatar'>; isHost?: boolean; z: number }> = ({ p, isHost, z }) => {
  const src = p.avatar || '';
  const isImg = /^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:');
  const initial = (p.name || '?').trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || '?';
  return (
    <span
      title={isHost ? `${p.name} (Host)` : p.name}
      style={{ zIndex: z }}
      className={`relative w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 -ml-2 first:ml-0 ${
        isHost ? 'ring-2 ring-amber-400/80' : ''
      }`}
    >
      {isImg ? (
        <img src={src} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-[13px] font-black text-zinc-200">{src && src.length <= 2 ? src : initial}</span>
      )}
      {isHost && (
        <Crown className="absolute -top-0.5 -right-0.5 w-3 h-3 text-amber-400 fill-amber-400 drop-shadow" />
      )}
    </span>
  );
};

const formatCountdown = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (d > 0) return `${d}n ${pad(h)}:${pad(m)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const MatchLobbyCard: React.FC<MatchLobbyCardProps> = ({ match: m, now, userName, index, onOpen, onJoin }) => {
  const sport = getSportMeta(m.sport);
  const skill = getSkillMeta(m.skillLevel);

  const joined = (m.participants || []).filter(p => p.status === 'JOINED');
  const hostFirst = [...joined].sort((a, b) => (a.name === m.hostName ? -1 : b.name === m.hostName ? 1 : 0));
  const filled = Math.max(m.currentPlayers, joined.length);
  const missing = Math.max(0, m.maxPlayers - filled);

  const isHost = !!userName && m.hostName === userName;
  const isJoined = !!userName && joined.some(p => p.name === userName);
  const isPending = !!userName && (m.participants || []).some(p => p.name === userName && p.status === 'PENDING');

  const start = getMatchStart(m);
  const diff = start ? start.getTime() - now : null;
  const isPast = diff !== null && diff <= 0;
  const isSoon = diff !== null && diff > 0 && diff < 3 * 3600_000;
  const isFull = m.status === 'FULL' || missing === 0;
  const canJoin = !isFull && !isPast && !isHost && !isJoined && !isPending && m.status === 'OPEN';

  const visibleAvatars = hostFirst.slice(0, MAX_AVATARS);
  const hiddenAvatars = Math.max(0, filled - visibleAvatars.length);
  const visibleEmpty = Math.min(missing, MAX_EMPTY);
  const hiddenEmpty = missing - visibleEmpty;

  const fillPct = m.maxPlayers > 0 ? Math.round((filled / m.maxPlayers) * 100) : 0;

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canJoin) onJoin(m);
    else onOpen(m);
  };

  return (
    <article
      onClick={() => onOpen(m)}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className={`group relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 ${sport.ring} cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] animate-[lobbyIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both] ${
        isPast ? 'opacity-55' : ''
      }`}
    >
      {/* Ánh sáng màu bộ môn */}
      <div className={`pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full bg-gradient-to-br ${sport.glow} to-transparent blur-2xl opacity-70 group-hover:opacity-100 transition-opacity`} />

      {/* ── PHẦN TRÊN: thông tin kèo ── */}
      <div className="relative p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${sport.accent}`}>{sport.name}</span>
            <span className="text-zinc-700">/</span>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${skill.className}`}>
              <span className="flex items-end gap-[2px] h-2.5">
                {[1, 2, 3].map(b => (
                  <span key={b} className={`w-[3px] rounded-sm ${b <= skill.bars ? 'bg-current' : 'bg-current opacity-25'}`} style={{ height: `${b * 3 + 1}px` }} />
                ))}
              </span>
              {skill.label}
            </span>
          </div>

          {isFull ? (
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">Đủ người</span>
          ) : missing === 1 && !isPast ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-orange-200 bg-orange-500/15 border border-orange-500/40 px-2 py-1 rounded-md">
              <Flame className="w-3 h-3 animate-pulse" /> Thiếu 1
            </span>
          ) : m.status === 'PENDING' ? (
            <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md">Chờ duyệt</span>
          ) : null}
        </div>

        <h3 className="text-[17px] leading-snug font-black text-zinc-50 m-0 line-clamp-2 group-hover:text-white">
          {m.title}
        </h3>

        <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
          <div className="space-y-1.5 min-w-0 text-[12px]">
            <p className="m-0 flex items-center gap-1.5 text-zinc-300 font-semibold truncate">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{m.courtName}</span>
            </p>
            <p className="m-0 flex items-center gap-3 text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                {start ? start.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : m.playDate}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {m.startTime}–{m.endTime}
              </span>
            </p>
          </div>

          {/* Đồng hồ đếm ngược */}
          <div className={`text-right rounded-xl px-3 py-2 border ${
            isPast ? 'border-zinc-800 bg-zinc-950/60' : isSoon ? 'border-rose-500/40 bg-rose-500/10' : 'border-zinc-800 bg-zinc-950/60'
          }`}>
            <span className={`flex items-center justify-end gap-1 text-[9px] font-black uppercase tracking-wider ${isSoon ? 'text-rose-300' : 'text-zinc-500'}`}>
              {isPast ? <Hourglass className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
              {isPast ? 'Đã bắt đầu' : 'Bắt đầu sau'}
            </span>
            <span className={`block text-[15px] font-black font-mono tabular-nums leading-tight ${
              isPast ? 'text-zinc-500' : isSoon ? 'text-rose-200' : 'text-zinc-100'
            }`}>
              {diff === null ? '--:--' : isPast ? '00:00:00' : formatCountdown(diff)}
            </span>
          </div>
        </div>
      </div>

      {/* ── ĐƯỜNG XÉ VÉ ── */}
      <div className="relative h-0 mx-5 border-t border-dashed border-zinc-700/80">
        <span className="absolute -left-[30px] -top-[10px] w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800" />
        <span className="absolute -right-[30px] -top-[10px] w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800" />
      </div>

      {/* ── PHẦN DƯỚI: slot + chi phí + CTA ── */}
      <div className="relative p-5 pt-4 space-y-4 mt-auto">
        <div className="flex items-center justify-between gap-3">
          {/* Slot Visualizer */}
          <div className="flex items-center min-w-0">
            {visibleAvatars.map((p, i) => (
              <Avatar key={p.id || i} p={p} isHost={p.name === m.hostName} z={20 - i} />
            ))}
            {hiddenAvatars > 0 && (
              <span className="-ml-2 w-9 h-9 rounded-full border-2 border-zinc-900 bg-zinc-700 text-[10px] font-black text-zinc-100 flex items-center justify-center shrink-0">
                +{hiddenAvatars}
              </span>
            )}
            {Array.from({ length: visibleEmpty }).map((_, i) => (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={handleJoin}
                disabled={!canJoin}
                aria-label="Vị trí trống — tham gia"
                className={`ml-1.5 w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center shrink-0 transition-all duration-200 ${
                  canJoin
                    ? 'border-emerald-500/50 text-emerald-400 bg-transparent hover:bg-emerald-500/15 hover:border-emerald-400 hover:scale-110 cursor-pointer'
                    : 'border-zinc-700 text-zinc-600 bg-transparent cursor-default'
                } ${i === 0 && canJoin ? 'animate-[slotPulse_2.4s_ease-in-out_infinite]' : ''}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            ))}
            {hiddenEmpty > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-zinc-500 whitespace-nowrap">+{hiddenEmpty} trống</span>
            )}
          </div>

          <span className="shrink-0 text-right">
            <span className="block text-[15px] font-black font-mono tabular-nums text-zinc-100 leading-none">
              {filled}<span className="text-zinc-600">/{m.maxPlayers}</span>
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">thành viên</span>
          </span>
        </div>

        {/* Thanh lấp đầy */}
        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ${missing === 1 ? 'bg-orange-400' : isFull ? 'bg-zinc-500' : 'bg-emerald-400'}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-500">
              Share tiền sân {m.isCostEstimated ? '(ước tính)' : ''}
            </span>
            {m.costPerHead ? (
              <span className="block leading-tight">
                <span className="text-lg font-black font-mono tabular-nums text-emerald-300">{(m.costPerHead / 1000).toLocaleString('vi-VN')}k</span>
                <span className="text-[11px] font-semibold text-zinc-500"> /người</span>
                {m.courtCost ? (
                  <span className="text-[10px] text-zinc-600 font-mono"> · tổng {(m.courtCost / 1000).toLocaleString('vi-VN')}k</span>
                ) : null}
              </span>
            ) : (
              <span className="block text-sm font-bold text-zinc-400">Liên hệ host</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleJoin}
            className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wide border-0 cursor-pointer transition-all duration-200 active:scale-95 ${
              canJoin
                ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {isHost ? (<>Quản lý <ChevronRight className="w-3.5 h-3.5" /></>)
              : isJoined ? (<><Check className="w-3.5 h-3.5" /> Đã vào</>)
              : isPending ? (<><Hourglass className="w-3.5 h-3.5" /> Chờ duyệt</>)
              : canJoin ? (<>Tham gia ngay <ChevronRight className="w-3.5 h-3.5" /></>)
              : (<>Xem kèo <ChevronRight className="w-3.5 h-3.5" /></>)}
          </button>
        </div>
      </div>
    </article>
  );
};

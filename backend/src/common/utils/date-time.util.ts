export function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date('1970-01-01T00:00:00Z');
  d.setUTCHours(Number(hours), Number(minutes || 0), 0, 0);
  return d;
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

export function formatTime(timeVal: any): string {
  if (!timeVal) return '';
  if (timeVal instanceof Date) {
    try {
      return timeVal.toISOString().split('T')[1].substring(0, 5);
    } catch {
      const hours = timeVal.getUTCHours().toString().padStart(2, '0');
      const minutes = timeVal.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }
  if (typeof timeVal === 'string') {
    return timeVal.substring(0, 5);
  }
  return '';
}

export function parseTimeToLocal(timeStr: string): Date {
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
  return d;
}

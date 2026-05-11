import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return format(d, 'yyyy年M月d日', { locale: zhCN });
};

export const formatTime = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return format(d, 'HH:mm');
};

export const formatDateTime = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return format(d, 'yyyy年M月d日 HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
};

export const getTimePeriod = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  
  if (isToday(d)) {
    return `今天 ${format(d, 'HH:mm')}`;
  }
  
  if (isYesterday(d)) {
    return `昨天 ${format(d, 'HH:mm')}`;
  }
  
  if (isThisWeek(d)) {
    return format(d, 'EEEE HH:mm', { locale: zhCN });
  }
  
  return format(d, 'M月d日 HH:mm');
};

export const getDayOfWeek = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return format(d, 'EEEE', { locale: zhCN });
};

export const getMonthYear = (date: Date | string | number): string => {
  const d = typeof date === 'string' ? parseISO(date as string) : new Date(date);
  return format(d, 'yyyy年M月', { locale: zhCN });
};

export const isSameDay = (date1: Date | string | number, date2: Date | string | number): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1 as string) : new Date(date1);
  const d2 = typeof date2 === 'string' ? parseISO(date2 as string) : new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  return { start, end };
};

export interface TimeSlot {
  time: string; // HH:mm format, e.g., "09:30"
  label: string; // e.g., "09:30 AM"
  isBreak: boolean;
  isBooked: boolean;
}

function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function formatTimeLabel(timeStr: string): string {
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr.padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

export function generateDailySlots(
  workStart: string,
  workEnd: string,
  breakStart: string,
  breakEnd: string,
  durationMinutes: number,
  bookedTimes: string[]
): TimeSlot[] {
  const startMinutes = timeStringToMinutes(workStart || '09:00');
  const endMinutes = timeStringToMinutes(workEnd || '17:00');
  const breakStartMin = timeStringToMinutes(breakStart || '13:00');
  const breakEndMin = timeStringToMinutes(breakEnd || '14:00');
  const duration = durationMinutes > 0 ? durationMinutes : 30;

  const slots: TimeSlot[] = [];

  for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
    const isBreak = current >= breakStartMin && current < breakEndMin;
    const timeStr = minutesToTimeString(current);

    slots.push({
      time: timeStr,
      label: formatTimeLabel(timeStr),
      isBreak,
      isBooked: bookedTimes.includes(timeStr),
    });
  }

  return slots;
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDailySlots } from '@/lib/slots';
import { format, parseISO } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json({ error: 'Date query parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const profile = await prisma.doctorProfile.findFirst();
    if (!profile) {
      return NextResponse.json({ error: 'Clinic profile not configured' }, { status: 404 });
    }

    // Determine day of the week
    const dateObj = parseISO(dateStr);
    const dayOfWeek = format(dateObj, 'EEEE'); // e.g. "Monday", "Sunday"
    const activeDaysList = profile.activeDays.split(',').map((d) => d.trim());
    const isClosed = !activeDaysList.includes(dayOfWeek);

    if (isClosed) {
      return NextResponse.json({
        date: dateStr,
        dayOfWeek,
        isClosed: true,
        message: `${profile.clinicName} is closed on ${dayOfWeek}s.`,
        slots: [],
      });
    }

    // Fetch existing appointments on this date that are not cancelled
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: dateStr,
        status: { not: 'CANCELLED' },
      },
      select: {
        appointmentTime: true,
      },
    });

    const bookedTimes = bookedAppointments.map((a) => a.appointmentTime);

    const slots = generateDailySlots(
      profile.workStartHour,
      profile.workEndHour,
      profile.breakStartHour,
      profile.breakEndHour,
      profile.slotDurationMinutes,
      bookedTimes
    );

    return NextResponse.json({
      date: dateStr,
      dayOfWeek,
      isClosed: false,
      slotDurationMinutes: profile.slotDurationMinutes,
      slots,
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}

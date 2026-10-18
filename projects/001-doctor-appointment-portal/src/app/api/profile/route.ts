import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let profile = await prisma.doctorProfile.findFirst();
    if (!profile) {
      profile = await prisma.doctorProfile.create({
        data: {
          clinicName: 'CarePlus Family Health Clinic',
          doctorName: 'Dr. Sarah Jenkins, MD',
          specialty: 'Family Medicine & General Physician',
          bio: 'Board-certified family physician providing comprehensive care and preventive health checkups.',
          phone: '+1 (555) 234-5678',
          email: 'info@careplushealth.example',
          address: '452 Health Avenue, Suite 101, Medical District',
          consultationFee: '$60',
          slotDurationMinutes: 30,
          workStartHour: '09:00',
          workEndHour: '17:00',
          breakStartHour: '13:00',
          breakEndHour: '14:00',
          activeDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
          adminPin: '1234',
        },
      });
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let profile = await prisma.doctorProfile.findFirst();

    if (!profile) {
      profile = await prisma.doctorProfile.create({
        data: body,
      });
    } else {
      profile = await prisma.doctorProfile.update({
        where: { id: profile.id },
        data: {
          clinicName: body.clinicName ?? profile.clinicName,
          doctorName: body.doctorName ?? profile.doctorName,
          specialty: body.specialty ?? profile.specialty,
          bio: body.bio ?? profile.bio,
          phone: body.phone ?? profile.phone,
          email: body.email ?? profile.email,
          address: body.address ?? profile.address,
          consultationFee: body.consultationFee ?? profile.consultationFee,
          slotDurationMinutes: body.slotDurationMinutes ? Number(body.slotDurationMinutes) : profile.slotDurationMinutes,
          workStartHour: body.workStartHour ?? profile.workStartHour,
          workEndHour: body.workEndHour ?? profile.workEndHour,
          breakStartHour: body.breakStartHour ?? profile.breakStartHour,
          breakEndHour: body.breakEndHour ?? profile.breakEndHour,
          activeDays: body.activeDays ?? profile.activeDays,
          adminPin: body.adminPin ?? profile.adminPin,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

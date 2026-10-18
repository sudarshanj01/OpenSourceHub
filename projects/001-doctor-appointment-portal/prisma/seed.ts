import { PrismaClient } from '@prisma/client';
import { format, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding doctor appointment portal database...');

  // 1. Ensure Doctor Profile exists
  const existingProfile = await prisma.doctorProfile.findFirst();
  if (!existingProfile) {
    await prisma.doctorProfile.create({
      data: {
        clinicName: 'CarePlus Family Health Clinic',
        doctorName: 'Dr. Sarah Jenkins, MD',
        specialty: 'Family Medicine & General Physician',
        bio: 'Board-certified family physician with 12+ years of experience offering comprehensive care, preventive health screenings, and acute illness treatment.',
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
    console.log('✅ Created default Doctor Profile');
  }

  // 2. Check if appointments exist; if not, add realistic starter appointments
  const count = await prisma.appointment.count();
  if (count === 0) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const sampleAppointments = [
      {
        bookingRef: 'DOC-1001',
        patientName: 'Michael Chen',
        patientPhone: '+1 (555) 987-6543',
        patientEmail: 'm.chen@example.com',
        reason: 'Annual routine health checkup & blood pressure review',
        appointmentDate: today,
        appointmentTime: '09:00',
        status: 'COMPLETED',
        doctorNotes: 'Vitals stable. Recommended routine CBC & lipid profile tests.',
      },
      {
        bookingRef: 'DOC-1002',
        patientName: 'Emma Watson',
        patientPhone: '+1 (555) 876-5432',
        patientEmail: 'emma.w@example.com',
        reason: 'Persistent seasonal allergy and dry cough for 2 weeks',
        appointmentDate: today,
        appointmentTime: '10:00',
        status: 'IN_CONSULTATION',
        doctorNotes: 'Prescribed antihistamines. Follow-up in 10 days if symptoms persist.',
      },
      {
        bookingRef: 'DOC-1003',
        patientName: 'Robert Davis',
        patientPhone: '+1 (555) 765-4321',
        patientEmail: 'rdavis@example.com',
        reason: 'Lower back stiffness after moving heavy furniture',
        appointmentDate: today,
        appointmentTime: '11:30',
        status: 'CONFIRMED',
      },
      {
        bookingRef: 'DOC-1004',
        patientName: 'Sophia Rodriguez',
        patientPhone: '+1 (555) 654-3210',
        patientEmail: 'sophia.r@example.com',
        reason: 'Migraine headache consultation & prescription renewal',
        appointmentDate: today,
        appointmentTime: '14:30',
        status: 'CONFIRMED',
      },
      {
        bookingRef: 'DOC-1005',
        patientName: 'David Kim',
        patientPhone: '+1 (555) 543-2109',
        patientEmail: 'dkim@example.com',
        reason: 'Follow-up consultation for sprained ankle recovery',
        appointmentDate: tomorrow,
        appointmentTime: '10:30',
        status: 'CONFIRMED',
      },
    ];

    for (const appt of sampleAppointments) {
      await prisma.appointment.create({ data: appt });
    }
    console.log(`✅ Seeded ${sampleAppointments.length} sample appointments.`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

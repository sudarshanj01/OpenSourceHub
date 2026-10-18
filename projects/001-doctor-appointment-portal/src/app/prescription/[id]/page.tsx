import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, Stethoscope, Phone, Mail, MapPin } from 'lucide-react';
import PrintButton from './PrintButton';
import WhatsAppShareButton from './WhatsAppShareButton';

interface PrescriptionPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
  const { id } = params;

  const [appointment, profile] = await Promise.all([
    prisma.appointment.findUnique({ where: { id } }),
    prisma.doctorProfile.findFirst(),
  ]);

  if (!appointment) {
    notFound();
  }

  const clinic = profile || {
    clinicName: 'CarePlus Family Health Clinic',
    doctorName: 'Dr. Sarah Jenkins, MD',
    specialty: 'Family Medicine & General Physician',
    address: '452 Health Avenue, Suite 101, Medical District',
    phone: '+1 (555) 234-5678',
    email: 'info@careplushealth.example',
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 print:bg-white print:p-0">
      {/* Top Floating Action Bar (Hidden during Print) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>

        <div className="flex items-center gap-2">
          <WhatsAppShareButton
            phone={appointment.patientPhone}
            patientName={appointment.patientName}
            clinicName={clinic.clinicName}
            doctorName={clinic.doctorName}
            bookingRef={appointment.bookingRef}
          />
          <PrintButton />
        </div>
      </div>

      {/* Printable Prescription Slip (Standard Medical Letterhead) */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-8 print:max-w-none print:w-full">
        {/* Clinic & Doctor Letterhead Header */}
        <div className="border-b-2 border-teal-700 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {clinic.clinicName}
                </h1>
              </div>
              <h2 className="text-lg font-bold text-teal-800 mt-1">
                {clinic.doctorName}
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {clinic.specialty}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>{clinic.address}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>{clinic.phone}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>{clinic.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Details & Token Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <strong className="text-sm text-slate-900">{appointment.patientName}</strong>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Contact Phone</span>
              <strong className="text-sm text-slate-900">{appointment.patientPhone}</strong>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Date & Time</span>
              <strong className="text-sm text-slate-900">
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </strong>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-slate-400 block font-medium">Rx Token</span>
              <span className="font-mono font-bold text-sm text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 inline-block">
                {appointment.bookingRef}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-700">
            <span className="font-semibold text-slate-500">Chief Complaints / Reason for Visit: </span>
            <span className="font-medium text-slate-800">{appointment.reason}</span>
          </div>
        </div>

        {/* Traditional Rx Section */}
        <div className="min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-3xl font-extrabold text-teal-900 tracking-tighter">
                ℞
              </span>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Medical Prescription & Advice
              </span>
            </div>

            {appointment.doctorNotes ? (
              <div className="whitespace-pre-line text-sm leading-relaxed text-slate-800 font-sans pl-2 border-l-2 border-teal-200">
                {appointment.doctorNotes}
              </div>
            ) : (
              <div className="text-sm italic text-slate-400 pl-2">
                No medication or clinical notes logged for this consultation.
              </div>
            )}
          </div>

          {/* Prescription Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap justify-between items-end gap-4 text-xs">
            <div className="text-slate-400 max-w-sm space-y-1">
              <p className="font-medium text-slate-600">Instructions:</p>
              <p>• Take medications strictly as prescribed after food unless advised otherwise.</p>
              <p>• Please bring this prescription slip for follow-up review.</p>
            </div>

            <div className="text-right text-[11px] text-slate-400">
              <p className="font-semibold text-slate-700">{clinic.clinicName}</p>
              <p className="mt-0.5 text-slate-400">Digital Consultation Record</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

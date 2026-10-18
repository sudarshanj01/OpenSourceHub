'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppShareButtonProps {
  phone: string;
  patientName: string;
  clinicName: string;
  doctorName: string;
  bookingRef: string;
}

export default function WhatsAppShareButton({
  phone,
  patientName,
  clinicName,
  doctorName,
  bookingRef,
}: WhatsAppShareButtonProps) {
  const handleShare = () => {
    // Strip non-digits from patient phone for universal WhatsApp link
    const cleanPhone = phone.replace(/\D/g, '');
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const message = `Hello ${patientName}, here is your digital medical prescription from ${clinicName} (${doctorName}) for appointment ${bookingRef}.\n\n🔗 View / Print Prescription Slip:\n${currentUrl}\n\nWishing you good health!`;

    const encoded = encodeURIComponent(message);
    const waUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
      title="Open WhatsApp Web in new tab with patient prescription link"
    >
      <MessageCircle className="w-4 h-4" />
      Share on WhatsApp
    </button>
  );
}

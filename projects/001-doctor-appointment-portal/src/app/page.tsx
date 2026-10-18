'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  MapPin,
  DollarSign,
  ShieldCheck,
  Search,
  PlusCircle,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  CalendarDays,
  Lock,
} from 'lucide-react';

interface DoctorProfile {
  id: string;
  clinicName: string;
  doctorName: string;
  specialty: string;
  bio: string;
  phone: string;
  email: string;
  address: string;
  consultationFee: string;
  slotDurationMinutes: number;
  workStartHour: string;
  workEndHour: string;
  breakStartHour: string;
  breakEndHour: string;
  activeDays: string;
  adminPin: string;
}

interface Slot {
  time: string;
  label: string;
  isBreak: boolean;
  isBooked: boolean;
}

interface Appointment {
  id: string;
  bookingRef: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  doctorNotes?: string;
  createdAt: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'book' | 'check' | 'admin'>('book');
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Booking Tab State
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isClosed, setIsClosed] = useState(false);
  const [closedMessage, setClosedMessage] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Check Appointment Tab State
  const [checkQuery, setCheckQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchedAppointments, setSearchedAppointments] = useState<Appointment[] | null>(null);

  // Admin Portal State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState(false);
  const [adminAppointments, setAdminAppointments] = useState<Appointment[]>([]);
  const [adminDateFilter, setAdminDateFilter] = useState(todayStr);
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [loadingAdminAppts, setLoadingAdminAppts] = useState(false);

  // Modals inside Admin
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedApptForNotes, setSelectedApptForNotes] = useState<Appointment | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Walk-in state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinReason, setWalkinReason] = useState('Walk-in Consultation');
  const [walkinTime, setWalkinTime] = useState('09:00');
  const [submittingWalkin, setSubmittingWalkin] = useState(false);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<Partial<DoctorProfile>>({});
  const [savingSettings, setSavingSettings] = useState(false);

  // Load Doctor Profile
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSettingsForm(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Load Slots whenever selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        setBookingError(null);
        const res = await fetch(`/api/slots?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isClosed) {
            setIsClosed(true);
            setClosedMessage(data.message || 'Clinic is closed on this day.');
            setSlots([]);
          } else {
            setIsClosed(false);
            setSlots(data.slots || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate]);

  // Load Admin Appointments
  const fetchAdminAppointments = async () => {
    if (!isAdminAuthenticated) return;
    try {
      setLoadingAdminAppts(true);
      let url = `/api/appointments?date=${adminDateFilter}`;
      if (adminStatusFilter !== 'ALL') url += `&status=${adminStatusFilter}`;
      if (adminSearchQuery.trim()) url += `&query=${encodeURIComponent(adminSearchQuery.trim())}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAdminAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdminAppts(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminAppointments();
    }
  }, [isAdminAuthenticated, adminDateFilter, adminStatusFilter, adminSearchQuery]);

  // Handle Patient Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    try {
      setSubmittingBooking(true);
      setBookingError(null);
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientEmail,
          reason,
          appointmentDate: selectedDate,
          appointmentTime: selectedSlot,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to book appointment');
      }

      const bookedData: Appointment = await res.json();
      setBookingSuccess(bookedData);

      // Reset form
      setPatientName('');
      setPatientPhone('');
      setPatientEmail('');
      setReason('');
      setSelectedSlot(null);

      // Refresh slots
      const slotRes = await fetch(`/api/slots?date=${selectedDate}`);
      if (slotRes.ok) {
        const d = await slotRes.json();
        setSlots(d.slots || []);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Error booking appointment');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Search Patient Appointments
  const handleSearchAppointments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkQuery.trim()) return;
    try {
      setSearchLoading(true);
      const res = await fetch(`/api/appointments?query=${encodeURIComponent(checkQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchedAppointments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle PIN unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile && adminPinInput === profile.adminPin) {
      setIsAdminAuthenticated(true);
      setAdminPinError(false);
      setAdminPinInput('');
    } else {
      setAdminPinError(true);
    }
  };

  // Update Status
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchAdminAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Doctor Notes
  const handleSaveNotes = async () => {
    if (!selectedApptForNotes) return;
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/appointments/${selectedApptForNotes.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorNotes: notesInput }),
      });
      if (res.ok) {
        setSelectedApptForNotes(null);
        fetchAdminAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  // Walk-in booking submit
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingWalkin(true);
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: walkinName,
          patientPhone: walkinPhone,
          reason: walkinReason,
          appointmentDate: adminDateFilter,
          appointmentTime: walkinTime,
        }),
      });
      if (res.ok) {
        setShowWalkinModal(false);
        setWalkinName('');
        setWalkinPhone('');
        fetchAdminAppointments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingWalkin(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setShowSettingsModal(false);
        // Refresh slots if date selected
        const slotRes = await fetch(`/api/slots?date=${selectedDate}`);
        if (slotRes.ok) {
          const d = await slotRes.json();
          setSlots(d.slots || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSettings(false);
    }
  };

  // Date Quick Selector (Next 7 days)
  const quickDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(d, 'EEE'),
      displayDate: format(d, 'd MMM'),
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Confirmed</span>;
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <Activity className="w-3 h-3 text-amber-600" /> In Consultation
          </span>
        );
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Completed</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Cancelled</span>;
      case 'NO_SHOW':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">No Show</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900 leading-tight">
                  {profile ? profile.clinicName : 'CarePlus Clinic'}
                </h1>
                <p className="text-xs text-teal-700 font-medium">
                  {profile ? profile.doctorName : 'Medical Appointment Portal'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('book')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'book'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Slot</span>
              </button>

              <button
                onClick={() => setActiveTab('check')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'check'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>My Appointment</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Doctor Portal</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================================= */}
        {/* TAB 1: PATIENT BOOKING VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Doctor Profile Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 text-2xl font-bold flex-shrink-0">
                    {profile ? profile.doctorName.charAt(4) || 'D' : 'D'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {profile ? profile.doctorName : 'Dr. Sarah Jenkins, MD'}
                    </h2>
                    <p className="text-sm font-medium text-teal-600">
                      {profile ? profile.specialty : 'General Physician'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Accepting Appointments
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  {profile?.bio}
                </p>

                <div className="border-t border-slate-100 mt-5 pt-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <DollarSign className="w-4 h-4 text-teal-600" />
                    <span>Consultation Fee: <strong className="text-slate-900">{profile?.consultationFee}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Duration: <strong className="text-slate-900">{profile?.slotDurationMinutes} mins / patient</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>{profile?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-normal">{profile?.address}</span>
                  </div>
                </div>
              </div>

              {/* Patient Booking Tips */}
              <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-5 text-teal-900 text-sm">
                <h4 className="font-semibold flex items-center gap-2 text-teal-800">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Direct, Instant Booking
                </h4>
                <p className="mt-1 text-xs text-teal-700 leading-relaxed">
                  No payment or login required. Select a convenient time slot and you will receive an instant 4-digit booking reference token.
                </p>
              </div>
            </div>

            {/* Right Column: Slot Picker & Booking Form */}
            <div className="lg:col-span-8 space-y-6">
              {/* Date Selection Box */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-teal-600" />
                    Select Appointment Date
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Or pick date:</span>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* 7-Day Quick Pills */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {quickDays.map((q) => {
                    const isSelected = selectedDate === q.dateStr;
                    return (
                      <button
                        key={q.dateStr}
                        onClick={() => setSelectedDate(q.dateStr)}
                        className={`flex flex-col items-center py-2.5 px-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                          {q.dayName}
                        </span>
                        <span className="text-sm font-bold mt-0.5">{q.displayDate}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Available Slots Section */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-800">
                      Available Time Slots on {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span> Selected
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span> Booked
                      </span>
                    </div>
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 text-center text-sm text-slate-400">Loading available clinic slots...</div>
                  ) : isClosed ? (
                    <div className="py-8 px-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-amber-900">{closedMessage}</p>
                      <p className="text-xs text-amber-700 mt-1">Please select another date on the calendar.</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">No slots configured for this date.</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {slots.map((slot) => {
                        if (slot.isBreak) return null; // skip lunch/break times
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-all ${
                              slot.isBooked
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : isSelected
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-white hover:border-teal-500 hover:text-teal-700 text-slate-800 border-slate-200'
                            }`}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Intake Form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Patient Consultation Intake
                </h3>

                {bookingError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Henderson"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 (555) 000-0000"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="alex@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Selected Slot
                      </label>
                      <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 flex items-center justify-between">
                        <span>{selectedSlot ? `${selectedSlot} on ${selectedDate}` : 'Please select above 👆'}</span>
                        {selectedSlot && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason for Consultation / Primary Symptoms *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Briefly describe your symptoms or reason for visit (e.g. high fever, prescription refill, routine checkup)..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingBooking || !selectedSlot}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {submittingBooking ? (
                      <span>Confirming your slot...</span>
                    ) : (
                      <>
                        <span>Confirm Appointment Booking</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CHECK MY APPOINTMENT */}
        {/* ========================================================================= */}
        {activeTab === 'check' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Track Your Appointment</h2>
              <p className="text-sm text-slate-600 mt-1">
                Enter your Booking Reference (e.g., <strong>DOC-1002</strong>) or your phone number to check your queue status.
              </p>

              <form onSubmit={handleSearchAppointments} className="mt-5 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter Booking Ref (DOC-XXXX) or Phone..."
                  value={checkQuery}
                  onChange={(e) => setCheckQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-5 py-2.5 font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition-all"
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>
            </div>

            {/* Search Results */}
            {searchedAppointments !== null && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700">
                  Search Results ({searchedAppointments.length})
                </h3>

                {searchedAppointments.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                    No appointments found matching "{checkQuery}".
                  </div>
                ) : (
                  searchedAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                          {appt.bookingRef}
                        </span>
                        {getStatusBadge(appt.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 pt-1">
                        <div>
                          <span className="text-xs text-slate-400 block">Date</span>
                          <strong>{appt.appointmentDate}</strong>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Time Slot</span>
                          <strong>{appt.appointmentTime}</strong>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Patient Name</span>
                          <span>{appt.patientName}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Phone</span>
                          <span>{appt.patientPhone}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600">
                        <strong className="text-slate-800">Reason: </strong>
                        {appt.reason}
                      </div>

                      {appt.doctorNotes && (
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-900">
                          <strong>Doctor's Consultation Note: </strong>
                          {appt.doctorNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DOCTOR & CLINIC ADMIN PORTAL */}
        {/* ========================================================================= */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminAuthenticated ? (
              /* PIN GATE */
              <div className="max-w-sm mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center">
                <div className="w-14 h-14 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mx-auto mb-4">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Clinic Portal Access</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Enter your clinic administrator PIN to manage patient queues and appointment schedules.
                </p>

                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      placeholder="Default PIN: 1234"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className="w-full text-center text-xl tracking-widest font-mono py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {adminPinError && (
                      <p className="text-xs text-rose-600 font-medium mt-1.5">
                        Invalid PIN. (Default is 1234)
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all"
                  >
                    Unlock Dashboard
                  </button>
                </form>
              </div>
            ) : (
              /* AUTHENTICATED DOCTOR DASHBOARD */
              <div className="space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Clinic Patient Queue
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live appointment queue management and doctor consultation notes.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowWalkinModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Walk-In Patient
                    </button>

                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      Clinic Settings
                    </button>

                    <button
                      onClick={() => setIsAdminAuthenticated(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-300 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Lock
                    </button>
                  </div>
                </div>

                {/* Queue Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-slate-500">Total Filtered</span>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{adminAppointments.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-blue-600">Confirmed</span>
                    <p className="text-2xl font-bold text-blue-700 mt-1">
                      {adminAppointments.filter((a) => a.status === 'CONFIRMED').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-amber-600">In Consultation</span>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {adminAppointments.filter((a) => a.status === 'IN_CONSULTATION').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-emerald-600">Completed</span>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {adminAppointments.filter((a) => a.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-medium text-rose-600">Cancelled / No Show</span>
                    <p className="text-2xl font-bold text-rose-700 mt-1">
                      {adminAppointments.filter((a) => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length}
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Date:</span>
                      <input
                        type="date"
                        value={adminDateFilter}
                        onChange={(e) => setAdminDateFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-600">Status:</span>
                      <select
                        value={adminStatusFilter}
                        onChange={(e) => setAdminStatusFilter(e.target.value)}
                        className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="IN_CONSULTATION">In Consultation</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      placeholder="Search patient or token..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Patient Queue Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Token & Time</th>
                          <th className="py-3 px-4">Patient</th>
                          <th className="py-3 px-4">Symptoms / Reason</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Notes</th>
                          <th className="py-3 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {loadingAdminAppts ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              Loading appointments...
                            </td>
                          </tr>
                        ) : adminAppointments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              No appointments found for this date and filter.
                            </td>
                          </tr>
                        ) : (
                          adminAppointments.map((appt) => (
                            <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono">
                                <span className="font-bold text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                  {appt.bookingRef}
                                </span>
                                <div className="text-xs text-slate-600 mt-1 font-sans font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {appt.appointmentTime}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">{appt.patientName}</div>
                                <div className="text-xs text-slate-500">{appt.patientPhone}</div>
                              </td>

                              <td className="py-3.5 px-4 max-w-xs text-xs text-slate-700">
                                {appt.reason}
                              </td>

                              <td className="py-3.5 px-4">
                                {getStatusBadge(appt.status)}
                              </td>

                              <td className="py-3.5 px-4">
                                <button
                                  onClick={() => {
                                    setSelectedApptForNotes(appt);
                                    setNotesInput(appt.doctorNotes || '');
                                  }}
                                  className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {appt.doctorNotes ? 'Edit Notes' : '+ Add Note'}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <select
                                  value={appt.status}
                                  onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                  className="text-xs font-semibold py-1 px-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                >
                                  <option value="CONFIRMED">Confirmed</option>
                                  <option value="IN_CONSULTATION">In Consultation</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="CANCELLED">Cancelled</option>
                                  <option value="NO_SHOW">No Show</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: BOOKING CONFIRMATION SUCCESS */}
      {/* ========================================================================= */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment has been registered in the clinic schedule.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-left space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs text-slate-500">Booking Token</span>
                <span className="font-mono text-base font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {bookingSuccess.bookingRef}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold">{bookingSuccess.patientName}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold">{bookingSuccess.appointmentDate}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span className="text-slate-500">Time Slot:</span>
                <span className="font-semibold">{bookingSuccess.appointmentTime}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-700">
                <span className="text-slate-500">Clinic:</span>
                <span className="font-semibold">{profile?.clinicName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Please arrive 5 minutes before your scheduled slot. Present your token number at the reception desk.
            </p>

            <button
              onClick={() => setBookingSuccess(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all shadow-md shadow-teal-600/20"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DOCTOR CONSULTATION NOTES */}
      {/* ========================================================================= */}
      {selectedApptForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Doctor Consultation Notes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patient: <strong>{selectedApptForNotes.patientName}</strong> ({selectedApptForNotes.bookingRef})
            </p>

            <div className="my-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Diagnosis & Prescription Notes
              </label>
              <textarea
                rows={5}
                placeholder="Enter clinical observations, prescribed medications, follow-up instructions..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedApptForNotes(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WALK-IN BOOKING */}
      {/* ========================================================================= */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Quick Walk-In Registration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Add a patient standing at the reception counter directly into today's queue.
            </p>

            <form onSubmit={handleWalkinSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Patient Name"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Queue Slot Time</label>
                  <input
                    type="time"
                    required
                    value={walkinTime}
                    onChange={(e) => setWalkinTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Queue Date</label>
                  <input
                    type="date"
                    disabled
                    value={adminDateFilter}
                    className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 text-slate-500 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={walkinReason}
                  onChange={(e) => setWalkinReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkin}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 text-white"
                >
                  {submittingWalkin ? 'Adding...' : 'Add to Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLINIC SETTINGS */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Clinic & Operating Hours Settings</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Configure clinic information, working hours, and slot intervals.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Clinic Name</label>
                <input
                  type="text"
                  value={settingsForm.clinicName || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, clinicName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Doctor Name</label>
                  <input
                    type="text"
                    value={settingsForm.doctorName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, doctorName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Consultation Fee</label>
                  <input
                    type="text"
                    value={settingsForm.consultationFee || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, consultationFee: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Specialty</label>
                <input
                  type="text"
                  value={settingsForm.specialty || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, specialty: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Slot Duration</label>
                  <select
                    value={settingsForm.slotDurationMinutes || 30}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slotDurationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 px-2 py-2 text-xs border border-slate-300 rounded-xl bg-white"
                  >
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Work Starts</label>
                  <input
                    type="time"
                    value={settingsForm.workStartHour || '09:00'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, workStartHour: e.target.value })}
                    className="w-full mt-1 px-2 py-1.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Work Ends</label>
                  <input
                    type="time"
                    value={settingsForm.workEndHour || '17:00'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, workEndHour: e.target.value })}
                    className="w-full mt-1 px-2 py-1.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Lunch Break Starts</label>
                  <input
                    type="time"
                    value={settingsForm.breakStartHour || '13:00'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, breakStartHour: e.target.value })}
                    className="w-full mt-1 px-2 py-1.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Lunch Break Ends</label>
                  <input
                    type="time"
                    value={settingsForm.breakEndHour || '14:00'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, breakEndHour: e.target.value })}
                    className="w-full mt-1 px-2 py-1.5 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Active Working Days (comma-separated)</label>
                <input
                  type="text"
                  value={settingsForm.activeDays || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, activeDays: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Admin PIN (6 digits max)</label>
                <input
                  type="text"
                  value={settingsForm.adminPin || '1234'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 font-semibold rounded-xl border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 font-semibold rounded-xl bg-teal-600 text-white"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

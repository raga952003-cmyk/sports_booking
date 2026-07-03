/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../lib/database';
import { User, Booking, Facility, SlotTime, SportType, WaitlistEntry } from '../types';
import { SLOT_TIMES } from '../data/initialData';
import { Calendar, RefreshCw, XCircle, Clock, CheckCircle, Activity, Info, AlertTriangle, QrCode } from 'lucide-react';
import NotificationBell from './NotificationBell';
import QRCodeSVG from './QRCodeSVG';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportType>('Badminton');
  const [simTime, setSimTime] = useState({ hour: 9, minute: 0 });
  const [activeTab, setActiveTab] = useState<'availability' | 'my_bookings'>('availability');
  
  // Modals
  const [bookingModal, setBookingModal] = useState<{ facility: Facility; slot: SlotTime } | null>(null);
  const [modalEmployeeId, setModalEmployeeId] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [qrModal, setQrModal] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (bookingModal) {
      setModalEmployeeId(user.employeeId);
      setModalEmail(user.email);
    } else {
      setModalEmployeeId('');
      setModalEmail('');
    }
  }, [bookingModal, user]);

  const refreshData = async () => {
    try {
      const [facs, books, wlist, time] = await Promise.all([
        db.getFacilities(),
        db.getBookings(),
        db.getWaitlist(),
        db.getSimulatedTime()
      ]);
      setFacilities(facs);
      setBookings(books);
      setWaitlist(wlist);
      setSimTime(time);
    } catch (e) {
      console.error('Error refreshing dashboard data:', e);
    }
  };

  useEffect(() => {
    refreshData();

    const handleStorageUpdate = () => refreshData();
    const handleTimeChange = () => refreshData();

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('simulated_time_change', handleTimeChange);

    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('simulated_time_change', handleTimeChange);
      clearInterval(interval);
    };
  }, []);

  // Compute the current active hour slot (e.g. 9:00 AM matches "9-10 AM")
  const getCurrentSlotTime = (): SlotTime | 'none' => {
    const hr = simTime.hour;
    if (hr >= 6 && hr < 7) return '6-7 AM';
    if (hr >= 7 && hr < 8) return '7-8 AM';
    if (hr >= 8 && hr < 9) return '8-9 AM';
    if (hr >= 9 && hr < 10) return '9-10 AM';
    if (hr >= 10 && hr < 11) return '10-11 AM';
    if (hr >= 11 && hr < 12) return '11-12 PM';
    if (hr >= 12 && hr < 13) return '12-1 PM';
    if (hr >= 13 && hr < 14) return '1-2 PM';
    if (hr >= 14 && hr < 15) return '2-3 PM';
    if (hr >= 15 && hr < 16) return '3-4 PM';
    if (hr >= 16 && hr < 17) return '4-5 PM';
    if (hr >= 17 && hr < 18) return '5-6 PM';
    if (hr >= 18 && hr < 19) return '6-7 PM';
    if (hr >= 19 && hr < 20) return '7-8 PM';
    return 'none';
  };

  const currentSlot = getCurrentSlotTime();

  // Compute status for a given facility & slot
  const getSlotStatus = (facilityId: string, slot: SlotTime): 'available' | 'booked' | 'playing' | 'maintenance' => {
    const facility = facilities.find(f => f.facilityId === facilityId);
    if (!facility || facility.status === 'maintenance') return 'maintenance';

    const activeBooking = bookings.find(b => b.facilityId === facilityId && b.slotTime === slot && b.status !== 'cancelled');
    if (!activeBooking) return 'available';

    if (activeBooking.status === 'checked_in') return 'playing';
    return 'booked';
  };

  // Helper to get booking details for a cell
  const getSlotBooking = (facilityId: string, slot: SlotTime): Booking | undefined => {
    return bookings.find(b => b.facilityId === facilityId && b.slotTime === slot && b.status !== 'cancelled');
  };

  // Calculate stats for each sport at the current simulated hour
  const getSportStats = (sport: SportType) => {
    const sportFacs = facilities.filter(f => f.sport === sport);
    const totalCourts = sportFacs.length;
    
    let available = 0;
    let booked = 0;
    let playing = 0;
    let maintenance = 0;

    sportFacs.forEach(f => {
      if (f.status === 'maintenance') {
        maintenance++;
      } else if (currentSlot !== 'none') {
        const stat = getSlotStatus(f.facilityId, currentSlot);
        if (stat === 'available') available++;
        else if (stat === 'booked') booked++;
        else if (stat === 'playing') playing++;
      } else {
        // Outside operating hours
        available++;
      }
    });

    return { totalCourts, available, booked, playing, maintenance };
  };

  const handleCreateBooking = async () => {
    if (!bookingModal) return;
    setErrorMsg('');

    if (!modalEmployeeId.trim()) {
      setErrorMsg('Please enter your Employee ID for verification.');
      return;
    }

    if (!modalEmail.trim()) {
      setErrorMsg('Please enter your Email Address for verification.');
      return;
    }

    // Verify they entered their own correct credentials
    if (modalEmployeeId.trim().toUpperCase() !== user.employeeId.toUpperCase()) {
      setErrorMsg('The entered Employee ID does not match your active session.');
      return;
    }

    if (modalEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setErrorMsg('The entered Email ID does not match your registered email.');
      return;
    }

    const res = await db.createBooking({
      employeeId: modalEmployeeId.trim().toUpperCase(),
      email: modalEmail.trim().toLowerCase(),
      facilityId: bookingModal.facility.facilityId,
      slotTime: bookingModal.slot,
      bookingSource: 'online'
    });

    if (res.success) {
      setBookingModal(null);
      refreshData();
    } else {
      setErrorMsg(res.error || 'Failed to complete booking.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? This slot will immediately become available to others.')) {
      const res = await db.cancelBooking(bookingId);
      if (res.success) {
        refreshData();
      } else {
        alert(res.error);
      }
    }
  };

  const handleJoinWaitlist = async (facility: Facility, slot: SlotTime) => {
    setErrorMsg('');
    const res = await db.joinWaitlist(user.employeeId, facility.facilityId, slot);
    if (res.success) {
      setBookingModal(null);
      refreshData();
    } else {
      setErrorMsg(res.error || 'Failed to join waitlist.');
    }
  };

  const handleLeaveWaitlist = async (waitlistId: string) => {
    if (confirm('Are you sure you want to leave the waitlist for this slot?')) {
      const res = await db.leaveWaitlist(waitlistId);
      if (res.success) {
        refreshData();
      }
    }
  };

  const isWaitlisted = (facilityId: string, slot: SlotTime): boolean => {
    return waitlist.some(w => w.employeeId === user.employeeId && w.facilityId === facilityId && w.slotTime === slot);
  };

  const getWaitlistCount = (facilityId: string, slot: SlotTime): number => {
    return waitlist.filter(w => w.facilityId === facilityId && w.slotTime === slot).length;
  };

  const myActiveBookings = bookings.filter(b => b.employeeId === user.employeeId && b.status !== 'cancelled');
  const myBookingHistory = bookings.filter(b => b.employeeId === user.employeeId);
  const myActiveWaitlist = waitlist.filter(w => w.employeeId === user.employeeId);

  // Quick check-in simulator inside QR Code Modal
  const simulateQRCheckIn = async (bookingId: string) => {
    const res = await db.updateBookingStatus(bookingId, 'checked_in', 'SEC202');
    if (res.success) {
      setQrModal(null);
      refreshData();
      alert('Simulated Check-In Successful! Enjoy your game.');
    }
  };

  const isSecurityBookingOnly = simTime.hour >= 5 && simTime.hour < 10;

  return (
    <div id="employee_dashboard" className="min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* Top Corporate Nav */}
      <nav className="bg-[#003366] text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold italic text-white shadow-sm">P</div>
            <div>
              <span className="font-display font-bold text-lg text-white block leading-tight">
                PlaySmart
              </span>
              <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider block">
                Employee Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time sync notifications */}
            <NotificationBell employeeId={user.employeeId} />

            <div className="hidden sm:block text-right">
              <span className="text-xs font-semibold text-white block">{user.name}</span>
              <span className="text-[10px] text-blue-200/80 font-mono block">
                {user.employeeId} | {user.department}{user.phoneNumber ? ` | Phone: ${user.phoneNumber}` : ''}
              </span>
            </div>

            <button
              id="emp_logout_btn"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Block */}
        <div className="bg-[#003366] text-white rounded-2xl p-6 shadow-sm mb-6 border border-blue-900/40">
          <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-blue-100/90 text-sm mt-1 max-w-2xl font-sans">
            TCS Siruseri Chennai Sports Facility Status Center. Check today's grid, track slots, and make reservation check-ins instantly.
          </p>
        </div>

        {/* Dynamic Warning Banners (Section 3.1 Banners) */}
        {isSecurityBookingOnly && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Direct Online Booking is Locked</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                The Employee Direct Self-Service booking window is frozen between 5:00 AM and 10:00 AM to prevent concurrency server congestion. 
                You can still browse current court grids, but bookings can only be placed on your behalf by physical walk-in at the security gate desk.
              </p>
            </div>
          </div>
        )}

        {(simTime.hour < 6 || simTime.hour >= 20) && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Sports Facilities Closed</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                The campus sports facilities are closed. System slot reservations are locked outside operating hours (6:00 AM – 8:00 PM).
              </p>
            </div>
          </div>
        )}

        {(simTime.hour >= 10 && simTime.hour < 20) && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">Employee Self Booking Active</p>
              <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                Direct online self-service booking is active until 8:00 PM today. Choose any green slot cell in the timeline matrix to secure your reservation!
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            id="tab_availability_btn"
            onClick={() => setActiveTab('availability')}
            className={`pb-3 px-4 font-display font-semibold text-sm border-b-2 cursor-pointer transition-all ${
              activeTab === 'availability' ? 'border-[#003366] text-[#003366]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Today's Availability
          </button>
          <button
            id="tab_my_bookings_btn"
            onClick={() => setActiveTab('my_bookings')}
            className={`pb-3 px-4 font-display font-semibold text-sm border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'my_bookings' ? 'border-[#003366] text-[#003366]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Bookings & History
            {myActiveBookings.length > 0 && (
              <span className="bg-blue-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {myActiveBookings.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'availability' ? (
          <div className="space-y-8">
            {/* Dynamic Live Summary Cards (Section 10) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-slate-800">
                  Live Sport Court Status <span className="text-xs text-slate-400 font-mono">(Current Hour Slot: {currentSlot !== 'none' ? currentSlot : 'Facilities Closed'})</span>
                </h2>
                <button
                  id="refresh_grid_btn"
                  onClick={refreshData}
                  className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Live
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(['Badminton', 'Basketball', 'Volleyball', 'Table Tennis', 'Carrom', 'Box Cricket'] as SportType[]).map(sport => {
                  const stats = getSportStats(sport);
                  const icons: Record<string, string> = {
                    'Badminton': '🏸',
                    'Basketball': '🏀',
                    'Volleyball': '🏐',
                    'Table Tennis': '🏓',
                    'Carrom': '🎯',
                    'Box Cricket': '🏏',
                  };
                  return (
                    <div key={sport} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:scale-[1.03] hover:border-blue-200 active:scale-[0.99] transition-all duration-300 ease-out cursor-default">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl" role="img" aria-label={sport}>{icons[sport]}</span>
                          <h3 className="font-display font-bold text-slate-900">{sport}</h3>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                          {stats.totalCourts} {stats.totalCourts > 1 ? 'Courts' : 'Court'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-emerald-700 uppercase tracking-wider font-bold">Available</p>
                          <p className="text-lg font-bold text-emerald-800 font-display mt-0.5">{stats.available}</p>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-rose-700 uppercase tracking-wider font-bold">Booked</p>
                          <p className="text-lg font-bold text-rose-800 font-display mt-0.5">{stats.booked}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-amber-700 uppercase tracking-wider font-bold">Playing</p>
                          <p className="text-lg font-bold text-amber-800 font-display mt-0.5">{stats.playing}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Maintenance</p>
                          <p className="text-lg font-bold text-slate-700 font-display mt-0.5">{stats.maintenance}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Slot Matrix (Section 12 & 13) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg">Timeline Slot Matrix</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Explore the full operating window grid (6:00 AM – 8:00 PM) for any court.</p>
                </div>

                {/* Sport Selector */}
                <div className="flex flex-wrap gap-1.5">
                  {(['Badminton', 'Basketball', 'Volleyball', 'Table Tennis', 'Carrom', 'Box Cricket'] as SportType[]).map(sport => (
                    <button
                      key={sport}
                      id={`sport_select_${sport.toLowerCase().replace(' ', '_')}`}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSport === sport
                          ? 'bg-[#003366] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid instructions */}
              <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600 mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                  <span>🟢 Available (Select to Book)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                  <span>🔴 Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                  <span>🟡 Playing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 block"></span>
                  <span>⚪ Maintenance</span>
                </div>
              </div>

              {/* Responsive Horizontal Scroll Grid */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-display font-semibold text-xs text-slate-400 uppercase tracking-wider w-40">Court/Table</th>
                      {SLOT_TIMES.map(slot => (
                        <th key={slot} className="text-center py-3 px-2 font-mono text-[10px] text-slate-400 uppercase font-semibold">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facilities
                      .filter(f => f.sport === selectedSport)
                      .map(court => (
                        <tr key={court.facilityId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-display font-bold text-slate-800 text-sm">
                            {court.courtName}
                            {court.status === 'maintenance' && (
                              <span className="block text-[10px] text-rose-500 font-normal">Under Maintenance</span>
                            )}
                          </td>
                          {SLOT_TIMES.map(slot => {
                            const status = getSlotStatus(court.facilityId, slot);
                            const cellBooking = getSlotBooking(court.facilityId, slot);
                            const isMyOwn = cellBooking?.employeeId === user.employeeId;
                            const userWaitlisted = isWaitlisted(court.facilityId, slot);
                            const waitlistCount = getWaitlistCount(court.facilityId, slot);

                            let btnStyle = '';
                            let label = '';
                            if (status === 'maintenance') {
                              btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed';
                              label = 'Offline';
                            } else if (status === 'booked') {
                              if (isMyOwn) {
                                btnStyle = 'bg-blue-50 border-blue-200 text-blue-700 font-bold hover:bg-blue-100/70 cursor-pointer';
                                label = 'My Slot';
                              } else if (userWaitlisted) {
                                btnStyle = 'bg-amber-50 border-amber-200 text-amber-700 font-bold hover:bg-amber-100 cursor-pointer';
                                label = `Waitlisted (${waitlistCount})`;
                              } else {
                                btnStyle = 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100/50 cursor-pointer';
                                label = waitlistCount > 0 ? `Waitlist (${waitlistCount})` : 'Join Waitlist';
                              }
                            } else if (status === 'playing') {
                              if (isMyOwn) {
                                btnStyle = 'bg-blue-50 border-blue-200 text-blue-700 font-bold hover:bg-blue-100/70 cursor-pointer';
                                label = 'My Slot';
                              } else if (userWaitlisted) {
                                btnStyle = 'bg-amber-50 border-amber-200 text-amber-700 font-bold hover:bg-amber-100 cursor-pointer';
                                label = `Waitlisted (${waitlistCount})`;
                              } else {
                                btnStyle = 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100/50 cursor-pointer';
                                label = waitlistCount > 0 ? `Waitlist (${waitlistCount})` : 'Join Waitlist';
                              }
                            } else {
                              btnStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 font-bold cursor-pointer';
                              label = 'Book';
                            }

                            return (
                              <td key={slot} className="p-2 text-center">
                                <button
                                  id={`slot_btn_${court.facilityId}_${slot.replace(/[\s-]/g, '_')}`}
                                  disabled={status === 'maintenance'}
                                  onClick={() => {
                                    if (isMyOwn) {
                                      setActiveTab('my_bookings');
                                    } else {
                                      setBookingModal({ facility: court, slot });
                                    }
                                  }}
                                  className={`w-full py-2.5 px-1 rounded-xl text-[11px] border transition-all ${btnStyle}`}
                                >
                                  {label}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* My Bookings Tab (Section 10) */
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-lg mb-4">Active Reservations</h3>

              {myActiveBookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No Active Bookings Today</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Explore available time slots in the timeline matrix to secure your court booking.</p>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    View Slots Grid
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myActiveBookings.map(b => (
                    <div key={b.bookingId} className="border border-slate-200 p-5 rounded-2xl hover:border-blue-300 transition-all bg-white relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          b.status === 'checked_in' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {b.status === 'checked_in' ? 'Playing' : 'Confirmed'}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🏸</span>
                          <h4 className="font-display font-bold text-slate-900 text-base">{b.sport}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Court: <span className="text-slate-800 font-bold">{b.courtName}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Time Slot: <span className="text-slate-800 font-bold font-mono">{b.slotTime}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Source: <span className="capitalize font-mono">{b.bookingSource} Booking</span>
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        {b.status !== 'checked_in' && (
                          <button
                            id={`cancel_my_booking_${b.bookingId}`}
                            onClick={() => handleCancelBooking(b.bookingId)}
                            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Booking
                          </button>
                        )}
                        <button
                          id={`show_qr_${b.bookingId}`}
                          onClick={() => setQrModal(b)}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl ml-auto cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" /> Check-In QR Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Waitlist Requests Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-lg mb-1 flex items-center gap-2">
                Active Waitlist Requests <span className="bg-amber-100 text-amber-800 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">⏳ {myActiveWaitlist.length}</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">If another employee cancels their booking for that specific slot, you will be automatically promoted and notified.</p>

              {myActiveWaitlist.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">No Active Waitlists</p>
                  <p className="text-xs text-slate-400 mt-1">Join a waitlist from the timeline slot matrix for fully booked courts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myActiveWaitlist.map(w => (
                    <div key={w.waitlistId} className="border border-slate-200 p-5 rounded-2xl hover:border-amber-300 transition-all bg-white relative overflow-hidden flex flex-col justify-between border-l-4 border-l-amber-500 shadow-sm">
                      <div className="absolute top-0 right-0 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          Waitlisted
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⏳</span>
                          <h4 className="font-display font-bold text-slate-900 text-base">{w.sport}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Court: <span className="text-slate-800 font-bold">{w.courtName}</span>
                        </p>
                        <p className="text-xs text-slate-500 font-semibold mb-1">
                          Time Slot: <span className="text-slate-800 font-bold font-mono">{w.slotTime}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Joined Waitlist: {new Date(w.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          id={`leave_waitlist_btn_${w.waitlistId}`}
                          onClick={() => handleLeaveWaitlist(w.waitlistId)}
                          className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> Leave Waitlist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking History logs */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-display font-bold text-slate-900 text-lg mb-4">Your Booking History</h3>
              {myBookingHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No booking history available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                        <th className="py-2 px-3">Sport</th>
                        <th className="py-2 px-3">Location</th>
                        <th className="py-2 px-3">Slot Time</th>
                        <th className="py-2 px-3">Channel</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myBookingHistory.map(b => (
                        <tr key={b.bookingId} className="hover:bg-slate-50/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{b.sport}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-700">{b.courtName}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{b.slotTime}</td>
                          <td className="py-2.5 px-3 capitalize font-mono text-[10px]">{b.bookingSource}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'checked_in' ? 'bg-amber-100 text-amber-800' :
                              b.status === 'no_show' ? 'bg-rose-100 text-rose-800' :
                              b.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {b.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[10px] font-mono text-slate-400">
                            {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Booking Confirmation Dialog Modal */}
      {bookingModal && (() => {
        const slotStatus = getSlotStatus(bookingModal.facility.facilityId, bookingModal.slot);
        const isBookedOrPlaying = slotStatus === 'booked' || slotStatus === 'playing';
        const userIsWaitlisted = isWaitlisted(bookingModal.facility.facilityId, bookingModal.slot);
        const wEntry = waitlist.find(w => w.employeeId === user.employeeId && w.facilityId === bookingModal.facility.facilityId && w.slotTime === bookingModal.slot);

        return (
          <div id="booking_confirmation_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl animate-scale-in">
              <div className="p-6">
                <h3 className="font-display font-extrabold text-slate-900 text-xl tracking-tight">
                  {isBookedOrPlaying ? 'Waitlist for Sport Slot' : 'Confirm Sport Booking'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isBookedOrPlaying 
                    ? 'This slot is fully booked. You can join the waitlist to get automatically promoted if the booking is cancelled.' 
                    : 'Please verify your reservation details below:'}
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 my-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">TCS Player Name:</span>
                    <span className="text-slate-800 font-bold">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Employee ID:</span>
                    <span className="text-slate-800 font-bold font-mono">{user.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Activity Sport:</span>
                    <span className="text-blue-700 font-bold">{bookingModal.facility.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Facility Court:</span>
                    <span className="text-slate-800 font-bold">{bookingModal.facility.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Reserved Slot:</span>
                    <span className="text-amber-600 font-bold font-mono">{bookingModal.slot}</span>
                  </div>
                  {isBookedOrPlaying && (
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-slate-400 font-semibold">Current Waitlist:</span>
                      <span className="text-amber-700 font-bold font-mono">{getWaitlistCount(bookingModal.facility.facilityId, bookingModal.slot)} Employees</span>
                    </div>
                  )}
                </div>

                {isBookedOrPlaying ? (
                  userIsWaitlisted ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-start gap-2 mb-4">
                      <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                      <div>
                        <span className="font-bold">You are already on the waitlist!</span>
                        <p className="mt-0.5 leading-relaxed text-amber-700">
                          We will automatically register your booking and notify you immediately if the current player cancels this reservation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-xl flex items-start gap-2 mb-4">
                      <Info className="w-4 h-4 shrink-0 text-blue-500" />
                      <div>
                        <span className="font-bold">Waitlist Auto-Promotion</span>
                        <p className="mt-0.5 leading-relaxed text-blue-700">
                          If the host cancels, the next player on the waitlist is instantly confirmed. First-come, first-served.
                        </p>
                      </div>
                    </div>
                  )
                ) : isSecurityBookingOnly ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-start gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <div>
                      <span className="font-bold">Security Booking Window Locked!</span>
                      <p className="mt-0.5 leading-relaxed text-amber-700">
                        TCS Employee direct online booking is restricted between 5:00 AM – 10:00 AM to prevent congestion. Please contact physical security desk to place your booking.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                      <span className="text-xs font-bold text-slate-850 uppercase tracking-wide block">
                        Verify Booking Credentials
                      </span>
                      <div>
                        <label htmlFor="modal_emp_id" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Verify Employee ID
                        </label>
                        <input
                          id="modal_emp_id"
                          type="text"
                          required
                          placeholder="Enter Employee ID"
                          value={modalEmployeeId}
                          onChange={(e) => setModalEmployeeId(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="modal_email_id" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Verify Email Address
                        </label>
                        <input
                          id="modal_email_id"
                          type="email"
                          required
                          placeholder="Enter Email Address"
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-xl flex items-start gap-2 mb-4">
                      <Info className="w-4 h-4 shrink-0 text-blue-500" />
                      <div>
                        <span className="font-bold">QR Validation Notice</span>
                        <p className="mt-0.5 leading-relaxed text-blue-750">
                          Confirming this reservation will instantly simulate a playpass confirmation email and generate your digital QR check-in pass.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {errorMsg && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl mb-4">
                    {errorMsg}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    id="cancel_booking_confirm_modal"
                    onClick={() => {
                      setBookingModal(null);
                      setErrorMsg('');
                    }}
                    className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  {isBookedOrPlaying ? (
                    userIsWaitlisted ? (
                      <button
                        id="leave_waitlist_modal_btn"
                        onClick={() => {
                          if (wEntry) handleLeaveWaitlist(wEntry.waitlistId);
                          setBookingModal(null);
                        }}
                        className="flex-1 py-3 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 shadow-md cursor-pointer transition-colors"
                      >
                        Leave Waitlist
                      </button>
                    ) : (
                      <button
                        id="join_waitlist_modal_btn"
                        onClick={() => handleJoinWaitlist(bookingModal.facility, bookingModal.slot)}
                        className="flex-1 py-3 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-md cursor-pointer transition-colors"
                      >
                        Join Waitlist
                      </button>
                    )
                  ) : (
                    <button
                      id="submit_booking_confirm_modal"
                      disabled={isSecurityBookingOnly}
                      onClick={handleCreateBooking}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl text-white transition-all cursor-pointer ${
                        isSecurityBookingOnly
                          ? 'bg-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-[#003366] hover:bg-[#002244] shadow-md'
                      }`}
                    >
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QR Code Pass Simulator Modal */}
      {qrModal && (
        <div id="qr_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl animate-scale-in text-center">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TCS PLAYPASS</span>
                <button
                  onClick={() => setQrModal(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <h4 className="font-display font-bold text-slate-800 text-base">{qrModal.sport} Check-In</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{qrModal.courtName} | {qrModal.slotTime}</p>

              {/* Simulated QR block */}
              <div className="my-5 flex flex-col items-center gap-2">
                <QRCodeSVG value={qrModal.bookingId} size={150} />
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                  PASS_ID: {qrModal.bookingId}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mb-6 px-2">
                Present this digital QR ticket at the security gate of {qrModal.courtName} to verify your entry and mark attendance.
              </p>

              {/* Security desk simulation check in action shortcut */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs">
                <span className="font-bold text-blue-800 block mb-1">Evaluate Gate Scanner</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Simulate scanning this QR pass at the guard checkpoint to instantly record player attendance.
                </p>
                <button
                  id="simulate_qr_scanner_btn"
                  onClick={() => simulateQRCheckIn(qrModal.bookingId)}
                  className="mt-3 w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
                >
                  Simulate Guard Scanning Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

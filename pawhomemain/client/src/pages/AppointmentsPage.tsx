import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Stethoscope,
  Scissors,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { Appointment } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const AppointmentsPage: React.FC = () => {
  const { success, error } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Cancel Modal
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // View Details Modal
  const [viewAppt, setViewAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAppointments({
        status: statusFilter,
      });
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelAppointment(cancelTarget.id);
      if (res.success) {
        success(`Appointment ${cancelTarget.id} has been cancelled.`);
        setCancelTarget(null);
        loadAppointments();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-pawText">My Appointments</h2>
          <p className="text-sm text-pawMuted">
            Review, track, and manage your veterinary and grooming appointments
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/veterinary">
            <Button size="sm" variant="secondary" icon={<Stethoscope className="w-4 h-4" />}>
              Book Vet
            </Button>
          </Link>
          <Link to="/salon">
            <Button size="sm" icon={<Scissors className="w-4 h-4" />}>
              Book Salon
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-teal-100 flex items-center space-x-2 overflow-x-auto">
        {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-pawMuted hover:text-pawText hover:bg-gray-100'
            }`}
          >
            {tab === 'ALL' ? 'All Appointments' : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <Loader message="Loading appointment records..." />
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-teal-100">
          <CalendarDays className="w-14 h-14 text-teal-300 mx-auto mb-3" />
          <h3 className="font-bold text-pawText">No appointments found</h3>
          <p className="text-xs text-pawMuted max-w-sm mx-auto mt-1 mb-4">
            {statusFilter !== 'ALL'
              ? `You have no ${statusFilter.toLowerCase()} appointments.`
              : 'Keep your pets in top shape by scheduling a checkup or spa session!'}
          </p>
          <div className="flex justify-center space-x-3">
            <Link to="/veterinary">
              <Button size="sm" variant="secondary">Book Vet Clinic</Button>
            </Link>
            <Link to="/salon">
              <Button size="sm">Book Grooming Salon</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const isVet = appt.type === 'VETERINARY';
            const providerName = isVet ? appt.vet?.name : appt.salon?.name;
            const clinicOrAddress = isVet ? appt.vet?.clinicName : appt.salon?.address;

            return (
              <div
                key={appt.id}
                className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 hover:shadow-soft transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Section: Pet & Provider Details */}
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                      isVet ? 'bg-teal-500' : 'bg-teal-600'
                    }`}
                  >
                    {isVet ? <Stethoscope className="w-6 h-6" /> : <Scissors className="w-6 h-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-100">
                        {appt.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          appt.status === 'UPCOMING'
                            ? 'bg-blue-100 text-blue-800'
                            : appt.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-pawText">
                      {appt.pet?.name} • {providerName || 'Care Service'}
                    </h3>

                    <p className="text-xs text-pawMuted">
                      {appt.reason || (appt.service?.name ? `Service: ${appt.service.name}` : 'Consultation')}
                    </p>

                    <p className="text-[11px] text-teal-700 font-semibold flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{clinicOrAddress}</span>
                    </p>
                  </div>
                </div>

                {/* Right Section: Time, Fee & Action */}
                <div className="flex flex-col sm:flex-row sm:items-center md:flex-col md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <div className="flex items-center md:justify-end space-x-1.5 text-xs font-bold text-pawText">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{appt.timeSlot}</span>
                    </div>

                    <div className="text-xs font-semibold text-pawMuted mt-0.5">
                      Fee:{' '}
                      <strong className="text-teal-800">
                        {appt.fee ? `$${appt.fee.toFixed(2)}` : 'Included'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewAppt(appt)}
                    >
                      View Details
                    </Button>

                    {appt.status === 'UPCOMING' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCancelTarget(appt)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={!!viewAppt}
        onClose={() => setViewAppt(null)}
        title="Appointment Summary"
        subtitle={`Booking Reference: ${viewAppt?.id}`}
        maxWidth="md"
      >
        {viewAppt && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Service Type
                </span>
                <span className="font-black text-teal-800">
                  {viewAppt.type === 'VETERINARY' ? 'Veterinary Consultation' : 'Pet Grooming & Spa'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Pet
                </span>
                <span className="font-black text-pawText">{viewAppt.pet?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Provider
                </span>
                <span className="font-black text-pawText">
                  {viewAppt.vet?.name || viewAppt.salon?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Date & Time
                </span>
                <span className="font-black text-pawText">
                  {viewAppt.date} at {viewAppt.timeSlot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px]">
                  Status
                </span>
                <span
                  className={`font-black uppercase px-2 py-0.5 rounded-full text-[10px] ${
                    viewAppt.status === 'UPCOMING'
                      ? 'bg-blue-200 text-blue-900'
                      : viewAppt.status === 'COMPLETED'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-red-200 text-red-900'
                  }`}
                >
                  {viewAppt.status}
                </span>
              </div>
            </div>

            {viewAppt.reason && (
              <div>
                <h4 className="font-bold text-pawText uppercase tracking-wider text-[10px] mb-1">
                  Reason for Visit
                </h4>
                <p className="text-pawMuted bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {viewAppt.reason}
                </p>
              </div>
            )}

            {viewAppt.notes && (
              <div>
                <h4 className="font-bold text-pawText uppercase tracking-wider text-[10px] mb-1">
                  Special Notes / Instructions
                </h4>
                <p className="text-pawMuted bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {viewAppt.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <Button onClick={() => setViewAppt(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p>
              Are you sure you want to cancel appointment{' '}
              <strong className="text-pawText">{cancelTarget?.id}</strong> for{' '}
              <strong className="text-pawText">{cancelTarget?.pet?.name}</strong> on{' '}
              {cancelTarget?.date} at {cancelTarget?.timeSlot}? The slot will be released back to other pet owners.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setCancelTarget(null)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

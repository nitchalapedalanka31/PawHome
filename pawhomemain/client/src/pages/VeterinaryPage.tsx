import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Search,
  Star,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { petService } from '../services/petService';
import { VeterinaryDoctor, Pet } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const VeterinaryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';
  const navigate = useNavigate();

  const { success, error, warning } = useToast();

  const [vets, setVets] = useState<VeterinaryDoctor[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedVet, setSelectedVet] = useState<VeterinaryDoctor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPetId, setBookingPetId] = useState(initialPetId);
  const [bookingDate, setBookingDate] = useState(() => {
    // Tomorrow as default date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVet && bookingDate) {
      fetchSlots(selectedVet.id, bookingDate);
    }
  }, [selectedVet, bookingDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vetsRes, petsRes] = await Promise.all([
        bookingService.getVets(),
        petService.getPets(),
      ]);

      if (vetsRes.success) setVets(vetsRes.vets);
      if (petsRes.success) {
        setPets(petsRes.pets);
        if (!bookingPetId && petsRes.pets.length > 0) {
          setBookingPetId(petsRes.pets[0].id);
        }
      }
    } catch (err) {
      error('Failed to load veterinary clinics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (vetId: string, date: string) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      const res = await bookingService.getVetSlots(vetId, date);
      if (res.success) {
        setAvailableSlots(res.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleOpenBooking = (vet: VeterinaryDoctor) => {
    if (pets.length === 0) {
      warning('Please add a pet in My Pets before booking an appointment.');
      navigate('/pets');
      return;
    }
    setSelectedVet(vet);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVet) return;

    if (!bookingPetId) {
      error('Please select a pet.');
      return;
    }

    if (!selectedSlot) {
      error('Please choose an available appointment time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await bookingService.createAppointment({
        petId: bookingPetId,
        type: 'VETERINARY',
        vetId: selectedVet.id,
        date: bookingDate,
        timeSlot: selectedSlot,
        reason: reason.trim() || 'General Veterinary Wellness Consultation',
        notes: notes.trim(),
      });

      if (res.success) {
        success(
          `Appointment confirmed with ${selectedVet.name} on ${bookingDate} at ${selectedSlot}! (ID: ${res.appointment.id})`
        );
        setIsBookingModalOpen(false);
        navigate('/appointments');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredVets = vets.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-soft">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <Stethoscope className="w-3.5 h-3.5 text-teal-200" />
            <span>Certified Doctors • Licensed Clinics</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Veterinary Care Directory</h2>
          <p className="text-teal-100 text-xs md:text-sm leading-relaxed">
            Schedule routine checkups, diagnostic vaccinations, and specialized consultations with top-rated animal doctors.
          </p>
        </div>
      </div>

      {/* Search and Demo Data Notice */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, clinic, or specialty..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-pawMuted bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Real-time slot availability validation</span>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <Loader message="Locating veterinary specialists..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVets.map((vet) => (
            <div
              key={vet.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 hover:shadow-hover transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4">
                  <img
                    src={vet.imageUrl}
                    alt={vet.name}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-pawText">{vet.name}</h3>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{vet.rating}</span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-teal-700 mt-0.5">{vet.specialization}</p>
                    <p className="text-xs text-pawMuted font-medium">{vet.clinicName}</p>

                    <div className="flex items-center space-x-1 text-[11px] text-gray-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{vet.clinicAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 text-pawMuted">
                    <span>Experience: </span>
                    <strong className="text-pawText">{vet.experienceYears}+ Years</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 text-pawMuted">
                    <span>Consultation: </span>
                    <strong className="text-teal-700">${vet.consultationFee.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-pawMuted">
                  <strong className="text-teal-800">Available Days:</strong> {vet.availableDays.replace(/,/g, ', ')}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-pawMuted flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>{vet.phone}</span>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleOpenBooking(vet)}
                  icon={<Calendar className="w-4 h-4" />}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Schedule Veterinary Appointment"
        subtitle={`Booking consultation with ${selectedVet?.name}`}
        maxWidth="lg"
      >
        {selectedVet && (
          <form onSubmit={handleConfirmBooking} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
            {/* Select Pet */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Select Pet <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={bookingPetId}
                onChange={(e) => setBookingPetId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white font-semibold"
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.animalType} — {p.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Date */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1.5">
                Available Time Slots <span className="text-red-500">*</span>
              </label>
              {loadingSlots ? (
                <p className="text-xs text-pawMuted">Checking clinic schedule...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-red-500">No slots available on this date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(({ slot, isAvailable }) => (
                    <button
                      type="button"
                      key={slot}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                        !isAvailable
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : selectedSlot === slot
                          ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-pawText border-gray-200 hover:border-teal-400 hover:bg-teal-50/50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason for Visit */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Reason for Visit
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Annual physical, itchy ears, booster shot..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Special Care Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special handling, nervousness around other dogs, etc."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none resize-none"
              />
            </div>

            {/* Consultation Fee Summary */}
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between text-xs">
              <span className="font-bold text-pawMuted">Consultation Fee</span>
              <span className="text-base font-black text-teal-800">
                ${selectedVet.consultationFee.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={bookingLoading}
                disabled={!selectedSlot}
              >
                Confirm Appointment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

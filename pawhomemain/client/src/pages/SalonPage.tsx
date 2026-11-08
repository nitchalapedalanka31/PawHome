import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Scissors,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Search,
  Star,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { petService } from '../services/petService';
import { Salon, SalonService, Pet } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const SalonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';
  const navigate = useNavigate();

  const { success, error, warning } = useToast();

  const [salons, setSalons] = useState<Salon[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal State
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPetId, setBookingPetId] = useState(initialPetId);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<{ slot: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedSalon && bookingDate) {
      fetchSlots(selectedSalon.id, bookingDate);
    }
  }, [selectedSalon, bookingDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salonsRes, petsRes] = await Promise.all([
        bookingService.getSalons(),
        petService.getPets(),
      ]);

      if (salonsRes.success) setSalons(salonsRes.salons);
      if (petsRes.success) {
        setPets(petsRes.pets);
        if (!bookingPetId && petsRes.pets.length > 0) {
          setBookingPetId(petsRes.pets[0].id);
        }
      }
    } catch (err) {
      error('Failed to load salons.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (salonId: string, date: string) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      const res = await bookingService.getSalonSlots(salonId, date);
      if (res.success) {
        setAvailableSlots(res.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleOpenBooking = (salon: Salon, defaultServiceId?: string) => {
    if (pets.length === 0) {
      warning('Please add a pet in My Pets before booking a salon grooming session.');
      navigate('/pets');
      return;
    }
    setSelectedSalon(salon);
    if (defaultServiceId) {
      setSelectedServiceId(defaultServiceId);
    } else if (salon.services && salon.services.length > 0) {
      setSelectedServiceId(salon.services[0].id);
    }
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;

    if (!bookingPetId) {
      error('Please select a pet.');
      return;
    }

    if (!selectedServiceId) {
      error('Please select a grooming service.');
      return;
    }

    if (!selectedSlot) {
      error('Please choose an available appointment time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const selectedService = selectedSalon.services.find((s) => s.id === selectedServiceId);

      const res = await bookingService.createAppointment({
        petId: bookingPetId,
        type: 'SALON',
        salonId: selectedSalon.id,
        serviceId: selectedServiceId,
        date: bookingDate,
        timeSlot: selectedSlot,
        reason: selectedService ? `Salon Service: ${selectedService.name}` : 'Pet Grooming Session',
        notes: instructions.trim(),
      });

      if (res.success) {
        success(
          `Grooming booked at ${selectedSalon.name} on ${bookingDate} at ${selectedSlot}! (ID: ${res.appointment.id})`
        );
        setIsBookingModalOpen(false);
        navigate('/appointments');
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to book salon appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredSalons = salons.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.services.some((srv) => srv.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedServiceObj = selectedSalon?.services.find((s) => s.id === selectedServiceId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-soft">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <Scissors className="w-3.5 h-3.5 text-teal-200" />
            <span>Gentle Handling • Premium Grooming & Spas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Pet Grooming & Spa Salons</h2>
          <p className="text-teal-100 text-xs md:text-sm leading-relaxed">
            Treat your pets to soothing bubble baths, breed styling, gentle nail trims, and restorative aromatherapy coat treatments.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by salon name or service (e.g. Bathing, Nail)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-pawMuted bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Real-time appointment slot verification</span>
        </div>
      </div>

      {/* Salons Grid */}
      {loading ? (
        <Loader message="Fetching pet spa studios..." />
      ) : (
        <div className="space-y-6">
          {filteredSalons.map((salon) => (
            <div
              key={salon.id}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-teal-100 hover:shadow-hover transition grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Left Column: Image & Salon Info */}
              <div className="lg:col-span-5 space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                  <img
                    src={salon.imageUrl}
                    alt={salon.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{salon.rating}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-lg text-pawText">{salon.name}</h3>
                  <div className="flex items-center space-x-1 text-xs text-pawMuted mt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{salon.address}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-pawMuted mt-1">
                    <Phone className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{salon.phone}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Services Offered and Book Button */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-pawText mb-3">
                    Available Grooming Services & Pricing:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {salon.services.map((service) => (
                      <div
                        key={service.id}
                        className="p-3 rounded-2xl border border-gray-100 hover:border-teal-200 bg-teal-50/20 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-black text-pawText">{service.name}</p>
                          <p className="text-[10px] text-pawMuted mt-0.5">
                            {service.durationMinutes} mins • {service.description.slice(0, 35)}...
                          </p>
                        </div>
                        <span className="text-xs font-black text-teal-700 bg-teal-100 px-2.5 py-1 rounded-xl">
                          ${service.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-pawMuted">
                    <strong className="text-teal-800">Days:</strong> {salon.availableDays.replace(/,/g, ', ')}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenBooking(salon)}
                    icon={<Scissors className="w-4 h-4" />}
                  >
                    Book Grooming
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Book Pet Grooming Session"
        subtitle={`Scheduling appointment at ${selectedSalon?.name}`}
        maxWidth="lg"
      >
        {selectedSalon && (
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

            {/* Select Service */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Select Grooming Service <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white font-semibold"
              >
                {selectedSalon.services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — ${srv.price.toFixed(2)} ({srv.durationMinutes} min)
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
                <p className="text-xs text-pawMuted">Checking salon schedule...</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-red-500">No salon slots open on this date.</p>
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

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Additional Instructions for the Groomer
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Sensitive to loud hair dryer, please trim face gently, hypoallergenic shampoo only..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none resize-none"
              />
            </div>

            {/* Price Summary */}
            {selectedServiceObj && (
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-pawText block">{selectedServiceObj.name}</span>
                  <span className="text-pawMuted">Est. duration: {selectedServiceObj.durationMinutes} mins</span>
                </div>
                <span className="text-base font-black text-teal-800">
                  ${selectedServiceObj.price.toFixed(2)}
                </span>
              </div>
            )}

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
                Confirm Grooming Visit
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

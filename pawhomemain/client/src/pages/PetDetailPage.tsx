import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  ArrowLeft,
  Sparkles,
  Calendar,
  Weight,
  HeartPulse,
  Stethoscope,
  Scissors,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
} from 'lucide-react';
import { petService } from '../services/petService';
import { healthService } from '../services/healthService';
import { Pet, PetHealthRecord, MoodAnalysis, Appointment } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'health' | 'mood' | 'appointments'>('health');

  // Add Health Record Modal
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthSaving, setHealthSaving] = useState(false);
  const [healthForm, setHealthForm] = useState({
    recordType: 'Vaccination',
    title: '',
    date: new Date().toISOString().split('T')[0],
    clinicOrVet: '',
    description: '',
    nextDueDate: '',
  });

  useEffect(() => {
    if (id) loadPetDetails(id);
  }, [id]);

  const loadPetDetails = async (petId: string) => {
    try {
      setLoading(true);
      const res = await petService.getPetById(petId);
      if (res.success && res.pet) {
        setPet(res.pet);
      }
    } catch (err: any) {
      error('Failed to load pet details.');
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.title.trim()) {
      error('Record title is required.');
      return;
    }

    setHealthSaving(true);
    try {
      await healthService.createHealthRecord({
        petId: id,
        recordType: healthForm.recordType,
        title: healthForm.title,
        date: healthForm.date,
        clinicOrVet: healthForm.clinicOrVet,
        description: healthForm.description,
        nextDueDate: healthForm.nextDueDate || null,
      });
      success('Health record added successfully!');
      setIsHealthModalOpen(false);
      setHealthForm({
        recordType: 'Vaccination',
        title: '',
        date: new Date().toISOString().split('T')[0],
        clinicOrVet: '',
        description: '',
        nextDueDate: '',
      });
      if (id) loadPetDetails(id);
    } catch (err: any) {
      error('Failed to add health record.');
    } finally {
      setHealthSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching pet health profile..." />;
  }

  if (!pet) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/pets"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Pets</span>
        </Link>
      </div>

      {/* Pet Hero Profile Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-teal-100">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={
              pet.imageUrl ||
              (pet.animalType === 'Cat'
                ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400'
                : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400')
            }
            alt={pet.name}
            className="w-32 h-32 md:w-36 md:h-36 rounded-3xl object-cover ring-4 ring-teal-500/20 shadow-md"
          />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-3xl font-black text-pawText">{pet.name}</h2>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                {pet.animalType}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-pawMuted">
                {pet.breed}
              </span>
            </div>

            <p className="text-sm text-pawMuted font-medium">
              {pet.gender} • {pet.age ? `${pet.age} years old` : 'Age not recorded'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2 text-xs">
              <div className="flex items-center space-x-1.5 text-pawText bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                <Weight className="w-3.5 h-3.5 text-teal-600" />
                <span>Weight: <strong>{pet.weight ? `${pet.weight} kg` : 'Unset'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-pawText bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>DOB: <strong>{pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : 'Unset'}</strong></span>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-4">
              <Link to={`/mood-scanner?petId=${pet.id}`}>
                <Button size="sm" icon={<Sparkles className="w-4 h-4" />}>
                  Scan Mood
                </Button>
              </Link>
              <Link to={`/food?petId=${pet.id}`}>
                <Button size="sm" variant="secondary" icon={<UtensilsCrossed className="w-4 h-4" />}>
                  Recommended Food
                </Button>
              </Link>
              <Link to={`/veterinary?petId=${pet.id}`}>
                <Button size="sm" variant="outline" icon={<Stethoscope className="w-4 h-4" />}>
                  Book Vet
                </Button>
              </Link>
              <Link to={`/salon?petId=${pet.id}`}>
                <Button size="sm" variant="outline" icon={<Scissors className="w-4 h-4" />}>
                  Book Salon
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pet Medical Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-teal-700 block mb-1">Medical Info</span>
            <p className="text-pawMuted leading-relaxed">{pet.medicalInfo || 'No chronic conditions noted.'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-teal-700 block mb-1">Vaccinations</span>
            <p className="text-pawMuted leading-relaxed">{pet.vaccinationDetails || 'Core vaccinations up-to-date.'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-teal-700 block mb-1">Allergies</span>
            <p className="text-amber-800 leading-relaxed">{pet.allergies || 'No known allergies reported.'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
            <span className="font-bold text-teal-700 block mb-1">Special Notes</span>
            <p className="text-pawMuted leading-relaxed">{pet.specialNotes || 'Gentle companion.'}</p>
          </div>
        </div>
      </div>

      {/* Tabs for Health Records, Mood Analysis, Appointments */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100">
        <div className="flex border-b border-gray-100 pb-4 mb-6 space-x-4">
          <button
            onClick={() => setActiveTab('health')}
            className={`pb-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'health'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-pawMuted hover:text-pawText'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Health & Medical Records ({pet.healthRecords?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('mood')}
            className={`pb-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'mood'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-pawMuted hover:text-pawText'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mood Scans ({pet.moodAnalyses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-2 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'appointments'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-pawMuted hover:text-pawText'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments ({pet.appointments?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Health Records */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-pawText uppercase tracking-wider">
                Vaccines, Deworming & Medical Log
              </h3>
              <Button
                size="sm"
                onClick={() => setIsHealthModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Health Record
              </Button>
            </div>

            {!pet.healthRecords || pet.healthRecords.length === 0 ? (
              <div className="text-center py-8 text-pawMuted">
                <HeartPulse className="w-10 h-10 text-teal-200 mx-auto mb-2" />
                <p className="text-xs">No medical records added yet for {pet.name}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pet.healthRecords.map((record: PetHealthRecord) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl border border-gray-100 hover:border-teal-200 bg-teal-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-pawText">{record.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {record.recordType}
                        </span>
                      </div>
                      <p className="text-xs text-pawMuted mt-1">
                        Administered: <strong>{new Date(record.date).toLocaleDateString()}</strong>
                        {record.clinicOrVet && ` • ${record.clinicOrVet}`}
                      </p>
                      {record.description && (
                        <p className="text-[11px] text-pawMuted mt-1 bg-white/70 p-2 rounded-xl inline-block">
                          {record.description}
                        </p>
                      )}
                    </div>

                    {record.nextDueDate && (
                      <div className="text-right text-xs bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 flex-shrink-0">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">Next Due</span>
                        <span className="font-bold text-amber-900">{new Date(record.nextDueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mood Analysis */}
        {activeTab === 'mood' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-pawText uppercase tracking-wider">
                Mood Expressions & AI Insights
              </h3>
              <Link to={`/mood-scanner?petId=${pet.id}`}>
                <Button size="sm" icon={<Sparkles className="w-4 h-4" />}>
                  Run New Scan
                </Button>
              </Link>
            </div>

            {!pet.moodAnalyses || pet.moodAnalyses.length === 0 ? (
              <div className="text-center py-8 text-pawMuted">
                <Sparkles className="w-10 h-10 text-teal-200 mx-auto mb-2" />
                <p className="text-xs">No mood scans recorded yet for {pet.name}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.moodAnalyses.map((mood: MoodAnalysis) => {
                  let obs: string[] = [];
                  let tips: string[] = [];
                  try {
                    obs = typeof mood.observations === 'string' ? JSON.parse(mood.observations) : mood.observations;
                    tips = typeof mood.careTips === 'string' ? JSON.parse(mood.careTips) : mood.careTips;
                  } catch {
                    obs = [];
                    tips = [];
                  }

                  return (
                    <div
                      key={mood.id}
                      className="p-5 rounded-2xl border border-teal-100 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={mood.imageUrl}
                          alt="Pet mood scan"
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-teal-500/20"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-pawText">Mood: {mood.predictedMood}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {Math.round(mood.confidence * 100)}% Confidence
                            </span>
                          </div>
                          <span className="text-[10px] text-pawMuted block mt-0.5">
                            {new Date(mood.createdAt).toLocaleDateString()} • Indicative Analysis
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-pawMuted leading-relaxed bg-teal-50/50 p-2.5 rounded-xl">
                        {mood.explanation}
                      </p>

                      {tips && tips.length > 0 && (
                        <div className="text-[11px] text-teal-800">
                          <strong className="block text-[10px] uppercase font-bold text-teal-600 mb-1">
                            Recommended Care Tips:
                          </strong>
                          <ul className="list-disc list-inside space-y-0.5">
                            {tips.slice(0, 2).map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-pawText uppercase tracking-wider">
                Scheduled & Past Visits
              </h3>
              <div className="flex space-x-2">
                <Link to={`/veterinary?petId=${pet.id}`}>
                  <Button size="sm" variant="secondary" icon={<Stethoscope className="w-3.5 h-3.5" />}>
                    Book Vet
                  </Button>
                </Link>
                <Link to={`/salon?petId=${pet.id}`}>
                  <Button size="sm" variant="outline" icon={<Scissors className="w-3.5 h-3.5" />}>
                    Book Salon
                  </Button>
                </Link>
              </div>
            </div>

            {!pet.appointments || pet.appointments.length === 0 ? (
              <div className="text-center py-8 text-pawMuted">
                <Calendar className="w-10 h-10 text-teal-200 mx-auto mb-2" />
                <p className="text-xs">No appointments booked for {pet.name}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pet.appointments.map((appt: Appointment) => (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                        {appt.type === 'VETERINARY' ? (
                          <Stethoscope className="w-4 h-4" />
                        ) : (
                          <Scissors className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-pawText">
                            {appt.type === 'VETERINARY'
                              ? appt.vet?.name || 'Veterinary Doctor'
                              : appt.salon?.name || 'Grooming Salon'}
                          </span>
                          <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded">
                            {appt.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-pawMuted">
                          {appt.reason || (appt.service?.name ? `Service: ${appt.service.name}` : 'Care Consultation')} • {appt.timeSlot}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-pawText block">{appt.date}</span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          appt.status === 'UPCOMING'
                            ? 'text-teal-600'
                            : appt.status === 'COMPLETED'
                            ? 'text-emerald-600'
                            : 'text-red-500'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Health Record Modal */}
      <Modal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        title={`Add Health Record for ${pet.name}`}
        subtitle="Log vaccines, deworming, weight checks, or surgeries."
      >
        <form onSubmit={handleAddHealthRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Record Type
            </label>
            <select
              value={healthForm.recordType}
              onChange={(e) => setHealthForm({ ...healthForm, recordType: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
            >
              <option value="Vaccination">Vaccination</option>
              <option value="Deworming">Deworming</option>
              <option value="Medical History">Medical History</option>
              <option value="Weight Tracking">Weight Tracking</option>
              <option value="Surgery">Surgery</option>
              <option value="General Checkup">General Checkup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Record Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={healthForm.title}
              onChange={(e) => setHealthForm({ ...healthForm, title: e.target.value })}
              placeholder="e.g. Annual Rabies Booster, Dental Scaling"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Date Administered
              </label>
              <input
                type="date"
                required
                value={healthForm.date}
                onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Next Due Date (Optional)
              </label>
              <input
                type="date"
                value={healthForm.nextDueDate}
                onChange={(e) => setHealthForm({ ...healthForm, nextDueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Clinic or Veterinarian Name
            </label>
            <input
              type="text"
              value={healthForm.clinicOrVet}
              onChange={(e) => setHealthForm({ ...healthForm, clinicOrVet: e.target.value })}
              placeholder="e.g. PetCare Specialty Hospital"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Detailed Notes & Dosage
            </label>
            <textarea
              rows={2}
              value={healthForm.description}
              onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })}
              placeholder="Dosage, batch number, or observation notes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsHealthModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={healthSaving}>
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  BellRing,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Weight,
  Syringe,
  Pill,
} from 'lucide-react';
import { healthService } from '../services/healthService';
import { petService } from '../services/petService';
import { PetHealthRecord, Reminder, Pet } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const HealthPage: React.FC = () => {
  const { success, error } = useToast();

  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [records, setRecords] = useState<PetHealthRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Health Record Modal
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthSaving, setHealthSaving] = useState(false);
  const [healthForm, setHealthForm] = useState({
    petId: '',
    recordType: 'Vaccination',
    title: '',
    date: new Date().toISOString().split('T')[0],
    clinicOrVet: '',
    description: '',
    nextDueDate: '',
  });

  // Add Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    petId: '',
    title: '',
    category: 'Vaccination',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: '',
  });

  // Delete State
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      loadPetHealthData(selectedPetId);
    }
  }, [selectedPetId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [petsRes, remindersRes] = await Promise.all([
        petService.getPets(),
        healthService.getReminders(),
      ]);

      if (petsRes.success && petsRes.pets.length > 0) {
        setPets(petsRes.pets);
        setSelectedPetId(petsRes.pets[0].id);
        setHealthForm((prev) => ({ ...prev, petId: petsRes.pets[0].id }));
        setReminderForm((prev) => ({ ...prev, petId: petsRes.pets[0].id }));
        await loadPetHealthData(petsRes.pets[0].id);
      }
      if (remindersRes.success) {
        setReminders(remindersRes.reminders);
      }
    } catch (err) {
      error('Failed to load health and reminder records.');
    } finally {
      setLoading(false);
    }
  };

  const loadPetHealthData = async (petId: string) => {
    try {
      const res = await healthService.getHealthRecords(petId);
      if (res.success) {
        setRecords(res.records);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHealthRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthForm.title.trim()) {
      error('Please enter a record title.');
      return;
    }

    setHealthSaving(true);
    try {
      await healthService.createHealthRecord({
        petId: healthForm.petId || selectedPetId,
        recordType: healthForm.recordType,
        title: healthForm.title,
        date: healthForm.date,
        clinicOrVet: healthForm.clinicOrVet,
        description: healthForm.description,
        nextDueDate: healthForm.nextDueDate || null,
      });
      success('Health record added!');
      setIsHealthModalOpen(false);
      setHealthForm({
        petId: selectedPetId,
        recordType: 'Vaccination',
        title: '',
        date: new Date().toISOString().split('T')[0],
        clinicOrVet: '',
        description: '',
        nextDueDate: '',
      });
      loadPetHealthData(selectedPetId);
      // Refresh reminders in case nextDueDate spawned a reminder
      const remRes = await healthService.getReminders();
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err: any) {
      error('Failed to save health record.');
    } finally {
      setHealthSaving(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.title.trim()) {
      error('Please enter a reminder title.');
      return;
    }

    setReminderSaving(true);
    try {
      await healthService.createReminder({
        petId: reminderForm.petId || selectedPetId,
        title: reminderForm.title,
        category: reminderForm.category,
        dueDate: reminderForm.dueDate,
        notes: reminderForm.notes,
      });
      success('Reminder created!');
      setIsReminderModalOpen(false);
      setReminderForm({
        petId: selectedPetId,
        title: '',
        category: 'Vaccination',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        notes: '',
      });
      const remRes = await healthService.getReminders();
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err: any) {
      error('Failed to create reminder.');
    } finally {
      setReminderSaving(false);
    }
  };

  const handleToggleReminder = async (reminder: Reminder) => {
    try {
      await healthService.updateReminder(reminder.id, {
        isCompleted: !reminder.isCompleted,
      });
      success(
        reminder.isCompleted
          ? `Marked "${reminder.title}" as pending.`
          : `Completed "${reminder.title}"! 🎉`
      );
      const remRes = await healthService.getReminders();
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err) {
      error('Failed to update reminder.');
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteRecordId) return;
    try {
      await healthService.deleteHealthRecord(deleteRecordId);
      success('Record deleted.');
      setDeleteRecordId(null);
      loadPetHealthData(selectedPetId);
    } catch (err) {
      error('Failed to delete record.');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await healthService.deleteReminder(id);
      success('Reminder deleted.');
      const remRes = await healthService.getReminders();
      if (remRes.success) setReminders(remRes.reminders);
    } catch (err) {
      error('Failed to delete reminder.');
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-soft">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <HeartPulse className="w-3.5 h-3.5 text-teal-200" />
            <span>Preventative Medicine • Lifelong Wellness</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Pet Health & Reminders</h2>
          <p className="text-teal-100 text-xs md:text-sm leading-relaxed">
            Record vaccinations, monthly deworming, weight fluctuations, and maintain scheduled care alerts so you never miss a dose.
          </p>
        </div>
      </div>

      {/* Pet Selector for Health Records */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
            Displaying Health Records For:
          </label>
          <p className="text-xs text-pawMuted">Switch between your registered pets</p>
        </div>

        {pets.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPetId(p.id);
                  setHealthForm((prev) => ({ ...prev, petId: p.id }));
                  setReminderForm((prev) => ({ ...prev, petId: p.id }));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-2 ${
                  selectedPetId === p.id
                    ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                    : 'bg-teal-50/50 text-teal-800 border-teal-100 hover:bg-teal-100'
                }`}
              >
                <span>{p.name} ({p.animalType})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Grid: Medical Records (Left) and Active Reminders (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Health Records */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-black text-pawText">
                {selectedPet?.name}'s Health Journal
              </h3>
              <p className="text-xs text-pawMuted">Vaccinations, deworming, weight & checkups</p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsHealthModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Record
            </Button>
          </div>

          {loading ? (
            <Loader size="sm" message="Loading journal..." />
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-pawMuted">
              <HeartPulse className="w-12 h-12 text-teal-200 mx-auto mb-2" />
              <p className="text-xs">No records saved yet for {selectedPet?.name}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-teal-200 bg-teal-50/20 transition flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-pawText">{rec.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {rec.recordType}
                        </span>
                      </div>
                      <p className="text-xs text-pawMuted mt-1">
                        Date: <strong>{new Date(rec.date).toLocaleDateString()}</strong>
                        {rec.clinicOrVet && ` • ${rec.clinicOrVet}`}
                      </p>
                    </div>

                    <button
                      onClick={() => setDeleteRecordId(rec.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {rec.description && (
                    <p className="text-[11px] text-pawMuted mt-2 bg-white/80 p-2.5 rounded-xl border border-gray-100">
                      {rec.description}
                    </p>
                  )}

                  {rec.nextDueDate && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-800">Follow-up Due:</span>
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {new Date(rec.nextDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Reminders */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-teal-100 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-black text-pawText">Scheduled Reminders</h3>
              <p className="text-xs text-pawMuted">Medication, doses, and visits</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsReminderModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Reminder
            </Button>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-8 text-pawMuted">
              <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
              <p className="text-xs">No pending reminders. You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start justify-between ${
                    rem.isCompleted
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-teal-100 hover:border-amber-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={rem.isCompleted}
                      onChange={() => handleToggleReminder(rem)}
                      className="mt-1 w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                    />
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          rem.isCompleted ? 'line-through text-gray-500' : 'text-pawText'
                        }`}
                      >
                        {rem.title}
                      </p>
                      <p className="text-[11px] text-pawMuted mt-0.5">
                        Due: <strong>{new Date(rem.dueDate).toLocaleDateString()}</strong> • {rem.category}
                      </p>
                      {rem.notes && (
                        <p className="text-[10px] text-pawMuted mt-1 italic">
                          "{rem.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Delete Reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Health Record Modal */}
      <Modal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        title="Add Medical / Health Record"
        subtitle={`Recording medical entry for ${selectedPet?.name}`}
      >
        <form onSubmit={handleAddHealthRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Select Pet
            </label>
            <select
              value={healthForm.petId}
              onChange={(e) => setHealthForm({ ...healthForm, petId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white font-semibold"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.animalType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Record Category
            </label>
            <select
              value={healthForm.recordType}
              onChange={(e) => setHealthForm({ ...healthForm, recordType: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white"
            >
              <option value="Vaccination">Vaccination</option>
              <option value="Deworming">Deworming</option>
              <option value="Weight Tracking">Weight Tracking</option>
              <option value="Medical History">Medical History</option>
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
              placeholder="e.g. PureVax Rabies Booster, Bravecto Chew"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Administered Date
              </label>
              <input
                type="date"
                required
                value={healthForm.date}
                onChange={(e) => setHealthForm({ ...healthForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Clinic or Veterinarian
            </label>
            <input
              type="text"
              value={healthForm.clinicOrVet}
              onChange={(e) => setHealthForm({ ...healthForm, clinicOrVet: e.target.value })}
              placeholder="e.g. PetCare Specialty Hospital"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Notes & Dosage
            </label>
            <textarea
              rows={2}
              value={healthForm.description}
              onChange={(e) => setHealthForm({ ...healthForm, description: e.target.value })}
              placeholder="Batch number, side effects, or instructions..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none resize-none"
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
              Save Medical Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Create Pet Health Reminder"
        subtitle="Set alert dates for medicine, grooming, or veterinary checkups."
      >
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Select Pet
            </label>
            <select
              value={reminderForm.petId}
              onChange={(e) => setReminderForm({ ...reminderForm, petId: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white font-semibold"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.animalType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Reminder Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reminderForm.title}
              onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
              placeholder="e.g. Monthly Heartworm Pill, Trim Nails"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Reminder Category
              </label>
              <select
                value={reminderForm.category}
                onChange={(e) => setReminderForm({ ...reminderForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none bg-white"
              >
                <option value="Vaccination">Vaccination</option>
                <option value="Medication">Medication</option>
                <option value="Grooming">Grooming</option>
                <option value="Checkup">Checkup</option>
                <option value="Diet">Diet</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={reminderForm.dueDate}
                onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={reminderForm.notes}
              onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
              placeholder="e.g. Give with breakfast"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReminderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={reminderSaving}>
              Create Reminder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Record Confirmation */}
      <Modal
        isOpen={!!deleteRecordId}
        onClose={() => setDeleteRecordId(null)}
        title="Delete Health Record"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-pawMuted">
            Are you sure you want to delete this health journal entry?
          </p>
          <div className="flex items-center justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteRecordId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteRecord}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  Plus,
  Search,
  Filter,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRight,
  Upload,
  Calendar,
  Weight,
  AlertCircle,
} from 'lucide-react';
import { petService } from '../services/petService';
import { Pet } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const PetsPage: React.FC = () => {
  const { success, error } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Add/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletePetTarget, setDeletePetTarget] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    animalType: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    dateOfBirth: '',
    weight: '',
    imageUrl: '',
    medicalInfo: '',
    vaccinationDetails: '',
    allergies: '',
    specialNotes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const res = await petService.getPets();
      if (res.success) {
        setPets(res.pets);
      }
    } catch (err: any) {
      error('Failed to load pets.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPet(null);
    setFormData({
      name: '',
      animalType: 'Dog',
      breed: '',
      age: '',
      gender: 'Male',
      dateOfBirth: '',
      weight: '',
      imageUrl: '',
      medicalInfo: '',
      vaccinationDetails: '',
      allergies: '',
      specialNotes: '',
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      animalType: pet.animalType,
      breed: pet.breed,
      age: pet.age ? pet.age.toString() : '',
      gender: pet.gender,
      dateOfBirth: pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : '',
      weight: pet.weight ? pet.weight.toString() : '',
      imageUrl: pet.imageUrl || '',
      medicalInfo: pet.medicalInfo || '',
      vaccinationDetails: pet.vaccinationDetails || '',
      allergies: pet.allergies || '',
      specialNotes: pet.specialNotes || '',
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.breed.trim()) {
      error('Pet name and breed are required.');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Handle photo upload if file selected
      if (selectedFile) {
        const uploadRes = await petService.uploadPhoto(selectedFile);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const payload = {
        name: formData.name,
        animalType: formData.animalType,
        breed: formData.breed,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        imageUrl: finalImageUrl,
        medicalInfo: formData.medicalInfo,
        vaccinationDetails: formData.vaccinationDetails,
        allergies: formData.allergies,
        specialNotes: formData.specialNotes,
      };

      if (editingPet) {
        await petService.updatePet(editingPet.id, payload as any);
        success(`${formData.name}'s profile updated!`);
      } else {
        await petService.createPet(payload as any);
        success(`${formData.name} added to your family!`);
      }

      setIsModalOpen(false);
      loadPets();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save pet profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePetTarget) return;
    setDeleting(true);
    try {
      await petService.deletePet(deletePetTarget.id);
      success(`${deletePetTarget.name}'s profile was removed.`);
      setDeletePetTarget(null);
      loadPets();
    } catch (err: any) {
      error('Failed to delete pet profile.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.breed.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || pet.animalType === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-pawText">My Pets</h2>
          <p className="text-sm text-pawMuted">Manage multiple pet profiles, medical histories, and mood logs</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Pet
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pet by name or breed..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {['All', 'Dog', 'Cat', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === type
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-gray-100 text-pawMuted hover:bg-gray-200'
              }`}
            >
              {type === 'All' ? 'All Pets' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Pets Grid */}
      {loading ? (
        <Loader message="Loading your pets..." />
      ) : filteredPets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-teal-100">
          <PawPrint className="w-16 h-16 text-teal-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-pawText">No pets found</h3>
          <p className="text-sm text-pawMuted max-w-md mx-auto mt-1 mb-6">
            {search || filterType !== 'All'
              ? 'Try adjusting your search filters.'
              : 'Start by adding your furry companion to track appointments, health, and mood!'}
          </p>
          <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
            Add First Pet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-teal-100 hover:shadow-hover transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={
                        pet.imageUrl ||
                        (pet.animalType === 'Cat'
                          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=250'
                          : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=250')
                      }
                      alt={pet.name}
                      className="w-18 h-18 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-lg text-pawText">{pet.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {pet.animalType}
                        </span>
                      </div>
                      <p className="text-xs text-pawMuted font-medium">{pet.breed}</p>
                      <p className="text-[11px] text-teal-700 font-semibold mt-1">
                        {pet.gender} • {pet.age ? `${pet.age} years old` : 'Age N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(pet)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition"
                      title="Edit Pet"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletePetTarget(pet)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Pet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pet Attributes Pills */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-xs">
                  <div className="p-2 rounded-xl bg-gray-50 flex items-center space-x-2">
                    <Weight className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-pawMuted">Weight:</span>
                    <strong className="text-pawText">{pet.weight ? `${pet.weight} kg` : 'N/A'}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-pawMuted">DOB:</span>
                    <strong className="text-pawText">
                      {pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : 'N/A'}
                    </strong>
                  </div>
                </div>

                {pet.allergies && (
                  <div className="mt-3 flex items-start space-x-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                    <span className="line-clamp-2"><strong>Allergies:</strong> {pet.allergies}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/mood-scanner?petId=${pet.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Pet Mood</span>
                </Link>

                <Link
                  to={`/pets/${pet.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-pawText hover:text-teal-600 transition"
                >
                  <span>Full Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Pet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPet ? `Edit ${editingPet.name}'s Profile` : 'Register a New Pet'}
        subtitle="Fill in your pet's information to maintain comprehensive care records."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pet Name */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Pet Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Milo, Luna, Charlie"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Animal Type */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Animal Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.animalType}
                onChange={(e) => setFormData({ ...formData, animalType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Other">Other Companion</option>
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Breed <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g. Golden Retriever, Persian, Siamese"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Age (years) */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 3"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Weight (kg) */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 28.5"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Photo Upload or URL */}
            <div>
              <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
                Pet Photograph
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
            </div>
          </div>

          {/* Photo URL Alternative */}
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Or Photo Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Medical Information */}
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Medical Information & Conditions
            </label>
            <textarea
              rows={2}
              value={formData.medicalInfo}
              onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
              placeholder="Any past surgeries, chronic issues, or regular health notes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
            />
          </div>

          {/* Vaccination Details */}
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Vaccination Details
            </label>
            <input
              type="text"
              value={formData.vaccinationDetails}
              onChange={(e) => setFormData({ ...formData, vaccinationDetails: e.target.value })}
              placeholder="Rabies, DHPP, FVRCP records & dates..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Known Allergies or Sensitivities
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Poultry, grains, seasonal pollen, flea bites..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-bold text-pawText uppercase tracking-wider mb-1">
              Special Personality & Care Notes
            </label>
            <textarea
              rows={2}
              value={formData.specialNotes}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              placeholder="Favorite toys, behavioral habits, shy with loud noises..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingPet ? 'Update Pet' : 'Save Pet Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletePetTarget}
        onClose={() => setDeletePetTarget(null)}
        title="Confirm Pet Removal"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-pawMuted">
            Are you sure you want to delete <strong className="text-pawText">{deletePetTarget?.name}</strong>'s profile? All associated health records, mood scans, and appointments will also be permanently deleted.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletePetTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

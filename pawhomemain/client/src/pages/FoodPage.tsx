import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Heart,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Info,
  Check,
  Star,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { foodService } from '../services/foodService';
import { petService } from '../services/petService';
import { FoodProduct, Pet } from '../types';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Loader } from '../components/common/Loader';
import { useToast } from '../context/ToastContext';

export const FoodPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPetId = searchParams.get('petId') || '';

  const { success, error, info } = useToast();

  const [foods, setFoods] = useState<FoodProduct[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId);
  const [loading, setLoading] = useState(true);

  // Filters
  const [animalFilter, setAnimalFilter] = useState<'All' | 'Dog' | 'Cat'>('All');
  const [ageFilter, setAgeFilter] = useState<'All' | 'Puppy' | 'Kitten' | 'Adult' | 'Senior'>('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Nutrition Details Modal
  const [selectedFood, setSelectedFood] = useState<FoodProduct | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadFoodProducts();
  }, [animalFilter, ageFilter, foodTypeFilter, searchQuery]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [petsRes] = await Promise.all([petService.getPets()]);
      if (petsRes.success) {
        setPets(petsRes.pets);
        if (initialPetId) {
          const match = petsRes.pets.find((p) => p.id === initialPetId);
          if (match) applyPetPreferences(match);
        }
      }
      await loadFoodProducts();
    } catch (err) {
      error('Failed to load food catalogue.');
    } finally {
      setLoading(false);
    }
  };

  const loadFoodProducts = async () => {
    try {
      const res = await foodService.getFoodProducts({
        animalType: animalFilter,
        ageCategory: ageFilter,
        foodType: foodTypeFilter,
        search: searchQuery,
      });
      if (res.success) {
        setFoods(res.foods);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyPetPreferences = (pet: Pet) => {
    setSelectedPetId(pet.id);
    if (pet.animalType === 'Dog') setAnimalFilter('Dog');
    if (pet.animalType === 'Cat') setAnimalFilter('Cat');

    if (pet.age !== null && pet.age !== undefined) {
      if (pet.animalType === 'Dog' && pet.age < 1) setAgeFilter('Puppy');
      else if (pet.animalType === 'Cat' && pet.age < 1) setAgeFilter('Kitten');
      else if (pet.age >= 7) setAgeFilter('Senior');
      else setAgeFilter('Adult');
    }
    info(`Applied nutritional filters optimized for ${pet.name}!`);
  };

  const handleToggleFavorite = async (food: FoodProduct) => {
    try {
      const res = await foodService.toggleFavorite(food.id);
      if (res.success) {
        setFoods((prev) =>
          prev.map((f) => (f.id === food.id ? { ...f, isFavorite: res.isFavorite } : f))
        );
        if (res.isFavorite) {
          success(`Saved "${food.name}" to favorites!`);
        } else {
          info(`Removed "${food.name}" from favorites.`);
        }
      }
    } catch (err) {
      error('Failed to update favorite food.');
    }
  };

  const displayedFoods = onlyFavorites
    ? foods.filter((f) => f.isFavorite)
    : foods;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 p-6 md:p-8 text-white shadow-soft">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/40 text-teal-100 text-xs font-bold tracking-wide">
            <UtensilsCrossed className="w-3.5 h-3.5 text-teal-200" />
            <span>Curated Pet Nutrition • Science-Backed Formulas</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black">Pet Food & Nutrition Hub</h2>
          <p className="text-teal-100 text-xs md:text-sm leading-relaxed">
            Discover veterinary-approved dry kibble, wet meals, and specialized diets matched to your pet's life stage, activity, and dietary sensitivities.
          </p>
        </div>
      </div>

      {/* Auto-Recommend by Pet Bar */}
      {pets.length > 0 && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-pawText">Smart Match For Your Registered Pet:</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPetPreferences(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center space-x-1.5 ${
                  selectedPetId === p.id
                    ? 'bg-teal-500 text-white border-teal-600 shadow-xs'
                    : 'bg-teal-50/60 text-teal-800 border-teal-100 hover:bg-teal-100'
                }`}
              >
                <span>{p.name} ({p.animalType})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-teal-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ingredient, brand, formula..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* Quick Animal Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
            {(['All', 'Dog', 'Cat'] as const).map((animal) => (
              <button
                key={animal}
                onClick={() => setAnimalFilter(animal)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  animalFilter === animal
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-pawMuted hover:bg-gray-200'
                }`}
              >
                {animal === 'All' ? 'All Pets' : `${animal}s`}
              </button>
            ))}

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border ${
                onlyFavorites
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-pawMuted border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Favorites</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <span className="font-bold text-pawMuted text-[11px] uppercase tracking-wider mr-2">
            Categories:
          </span>
          {[
            'All',
            'Dry Food',
            'Wet Food',
            'Special Dietary Food',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setFoodTypeFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                foodTypeFilter === cat
                  ? 'bg-teal-100 text-teal-800 font-bold border border-teal-300'
                  : 'bg-gray-50 text-pawMuted hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Veterinary Consultation Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Veterinary Consultation Disclaimer:</strong> Nutritional recommendations are based on stored manufacturer specifications. For pets with chronic renal disease, diabetes, acute allergies, or special medical conditions, consult your certified veterinarian prior to switching diets.
        </p>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <Loader message="Gathering food recipes..." />
      ) : displayedFoods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-teal-100">
          <Package className="w-14 h-14 text-teal-300 mx-auto mb-3" />
          <h3 className="font-bold text-pawText">No food formulas matched</h3>
          <p className="text-xs text-pawMuted max-w-sm mx-auto mt-1 mb-4">
            Try resetting your search query or switching to All Pets.
          </p>
          <Button
            size="sm"
            onClick={() => {
              setAnimalFilter('All');
              setAgeFilter('All');
              setFoodTypeFilter('All');
              setSearchQuery('');
              setOnlyFavorites(false);
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-teal-100 hover:shadow-hover transition flex flex-col justify-between group"
            >
              <div>
                {/* Image and Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-teal-800 shadow-sm">
                      {food.animalType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white shadow-sm">
                      {food.foodType}
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => handleToggleFavorite(food)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs shadow-sm hover:scale-110 transition"
                    title={food.isFavorite ? 'Remove from favorites' : 'Save as favorite'}
                  >
                    <Heart
                      className={`w-4 h-4 transition ${
                        food.isFavorite
                          ? 'fill-rose-500 text-rose-500'
                          : 'text-gray-400 hover:text-rose-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      {food.brand}
                    </span>
                    <h3 className="font-black text-base text-pawText line-clamp-1 mt-0.5">
                      {food.name}
                    </h3>
                  </div>

                  <p className="text-xs text-pawMuted line-clamp-2 leading-relaxed">
                    {food.description}
                  </p>

                  <div className="space-y-1 text-[11px] pt-1">
                    <p className="text-pawText font-medium">
                      <strong className="text-teal-700">Suitable For:</strong> {food.animalType} ({food.ageCategory})
                    </p>
                    <p className="text-pawMuted line-clamp-1">
                      <strong className="text-teal-700">Key Ingredients:</strong> {food.keyIngredients}
                    </p>
                  </div>

                  {food.allergyWarnings && (
                    <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-100">
                      <strong>Allergy Note:</strong> {food.allergyWarnings}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Action Footer */}
              <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-pawMuted block">Est. Price</span>
                  <span className="text-lg font-black text-teal-700">${food.price.toFixed(2)}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedFood(food)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Food Details & Nutrition Modal */}
      <Modal
        isOpen={!!selectedFood}
        onClose={() => setSelectedFood(null)}
        title={selectedFood?.name || 'Product Details'}
        subtitle={`Brand: ${selectedFood?.brand} • Suitable for ${selectedFood?.animalType} (${selectedFood?.ageCategory})`}
        maxWidth="lg"
      >
        {selectedFood && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-xs">
            <img
              src={selectedFood.imageUrl}
              alt={selectedFood.name}
              className="w-full h-48 rounded-2xl object-cover shadow-sm"
            />

            <div>
              <h4 className="font-bold text-pawText uppercase tracking-wider text-[11px] mb-1">
                Product Description
              </h4>
              <p className="text-pawMuted leading-relaxed">{selectedFood.description}</p>
            </div>

            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
              <h4 className="font-bold text-teal-900 uppercase tracking-wider text-[11px] mb-1">
                Key Ingredients
              </h4>
              <p className="text-teal-800 leading-relaxed">{selectedFood.keyIngredients}</p>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <h4 className="font-bold text-pawText uppercase tracking-wider text-[11px] mb-1">
                Guaranteed Nutritional Analysis
              </h4>
              <p className="text-pawMuted leading-relaxed">{selectedFood.nutritionalInfo}</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
              <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] mb-1">
                Feeding & Portion Guidance
              </h4>
              <p className="text-emerald-900 leading-relaxed">{selectedFood.feedingGuidance}</p>
            </div>

            {selectedFood.allergyWarnings && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <h4 className="font-bold uppercase tracking-wider text-[11px] mb-1">
                  Allergy & Sensitivities Advisory
                </h4>
                <p>{selectedFood.allergyWarnings}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-base font-black text-teal-700">
                ${selectedFood.price.toFixed(2)}
              </div>
              <Button
                variant={selectedFood.isFavorite ? 'secondary' : 'primary'}
                onClick={() => {
                  handleToggleFavorite(selectedFood);
                  setSelectedFood({
                    ...selectedFood,
                    isFavorite: !selectedFood.isFavorite,
                  });
                }}
                icon={<Heart className={`w-4 h-4 ${selectedFood.isFavorite ? 'fill-teal-700' : ''}`} />}
              >
                {selectedFood.isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

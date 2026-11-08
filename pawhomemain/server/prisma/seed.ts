import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PawHome database seeding...');

  // 1. Create Demo User
  const demoPassword = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@pawhome.com' },
    update: {},
    create: {
      email: 'demo@pawhome.com',
      password: demoPassword,
      fullName: 'Sarah Jenkins',
      phone: '+1 (555) 234-5678',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
  });
  console.log(`✓ Created demo user: ${demoUser.email}`);

  // 2. Create Sample Pets for Demo User
  const milo = await prisma.pet.create({
    data: {
      userId: demoUser.id,
      name: 'Milo',
      animalType: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      dateOfBirth: new Date('2023-04-15'),
      weight: 28.5,
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
      medicalInfo: 'No known chronic conditions. Up-to-date with annual core vaccines.',
      vaccinationDetails: 'Rabies (Valid till Apr 2027), DHPP 3-Year Booster (Valid till Apr 2026)',
      allergies: 'Mild intolerance to artificial poultry flavorings. Prefer grain-friendly salmon.',
      specialNotes: 'Enjoys fetch in the park and calm belly rubs. Gentle around children.',
    },
  });

  const luna = await prisma.pet.create({
    data: {
      userId: demoUser.id,
      name: 'Luna',
      animalType: 'Cat',
      breed: 'British Shorthair',
      age: 2,
      gender: 'Female',
      dateOfBirth: new Date('2024-02-10'),
      weight: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      medicalInfo: 'Indoor only. Sensitive digestive tract requiring gastrointestinal-friendly diet.',
      vaccinationDetails: 'FVRCP Tri-annual (Valid till Feb 2027), PureVax Rabies (Valid till Feb 2026)',
      allergies: 'Sensitive to excessive grains or soy.',
      specialNotes: 'Prefers quiet cozy corners and scratching towers. Very vocal at mealtime.',
    },
  });
  console.log(`✓ Created pets: Milo & Luna`);

  // 3. Create Sample Health Records
  await prisma.petHealthRecord.createMany({
    data: [
      {
        petId: milo.id,
        recordType: 'Vaccination',
        title: '3-Year Rabies Vaccine',
        date: new Date('2024-04-15'),
        clinicOrVet: 'PetCare Specialty Hospital (Dr. Emily Watson)',
        description: 'Subcutaneous injection right hind leg. No adverse reactions observed.',
        nextDueDate: new Date('2027-04-15'),
      },
      {
        petId: milo.id,
        recordType: 'Deworming',
        title: 'Broad-Spectrum Deworming (Simparica Trio)',
        date: new Date('2026-10-01'),
        clinicOrVet: 'PetCare Specialty Hospital',
        description: 'Monthly chewable tablet for heartworm, flea, tick, and roundworm protection.',
        nextDueDate: new Date('2026-11-01'),
      },
      {
        petId: milo.id,
        recordType: 'Weight Tracking',
        title: 'Routine Health Check & Weight Verification',
        date: new Date('2026-10-15'),
        clinicOrVet: 'PetCare Specialty Hospital',
        description: 'Weight: 28.5 kg. Ideal body condition score (BCS 5/9). Clean teeth and clear eyes.',
        nextDueDate: new Date('2027-04-15'),
      },
      {
        petId: luna.id,
        recordType: 'Vaccination',
        title: 'FVRCP Core Feline Booster',
        date: new Date('2024-02-10'),
        clinicOrVet: 'Happy Paws Feline Clinic (Dr. Sophia Rodriguez)',
        description: 'Core vaccination against feline viral rhinotracheitis, calicivirus, and panleukopenia.',
        nextDueDate: new Date('2027-02-10'),
      },
      {
        petId: luna.id,
        recordType: 'General Checkup',
        title: 'Annual Wellness Exam',
        date: new Date('2026-09-12'),
        clinicOrVet: 'Happy Paws Feline Clinic',
        description: 'Healthy coat, no dental tartar. Recommended daily dental treats.',
        nextDueDate: new Date('2027-09-12'),
      },
    ],
  });
  console.log(`✓ Created sample health records`);

  // 4. Create Initial Mood Analysis Records
  await prisma.moodAnalysis.createMany({
    data: [
      {
        petId: milo.id,
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
        predictedMood: 'Happy',
        confidence: 0.94,
        explanation: 'Milo displayed relaxed facial muscles, softly panting with eyes warm and alert.',
        observations: JSON.stringify(['Open relaxed mouth', 'Soft gaze towards owner', 'Neutral upright ear carriage', 'Loose posture']),
        careTips: JSON.stringify(['Reinforce with affectionate praise', 'Keep up daily 30-min walking routine', 'Provide fresh cool water']),
        isDemoMode: true,
      },
      {
        petId: luna.id,
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
        predictedMood: 'Curious',
        confidence: 0.89,
        explanation: 'Luna was focused with perked ears turned forward and wide attentive pupils.',
        observations: JSON.stringify(['Ears pitched forward toward sound', 'Dilated round pupils', 'Head tilted slightly', 'Whiskers fanned forward']),
        careTips: JSON.stringify(['Provide interactive feather toy', 'Introduce a puzzle treat dispenser', 'Allow safe supervised exploration']),
        isDemoMode: true,
      },
    ],
  });
  console.log(`✓ Created sample mood analyses`);

  // 5. Seed Food Products
  const foodProductsData = [
    {
      name: 'Royal Canin Breed Health Golden Retriever Adult',
      brand: 'Royal Canin',
      animalType: 'Dog',
      ageCategory: 'Adult',
      foodType: 'Dry Food',
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=600',
      description: 'Tailor-made nutrition for purebred Golden Retrievers 15 months and older. Supports healthy cardiac function, skin barrier, and ideal weight control.',
      keyIngredients: 'Brown rice, chicken by-product meal, oat groats, wheat, corn gluten meal, fish oil, EPA/DHA.',
      nutritionalInfo: 'Crude Protein: 23.0% min, Crude Fat: 11.0% min, Crude Fiber: 5.7% max, Omega-3: 0.73% min.',
      allergyWarnings: 'Contains wheat gluten and poultry by-products.',
      feedingGuidance: 'Feed 3 cups daily for active 28-30kg dogs, divided into morning and evening servings.',
      price: 84.99,
      rating: 4.9,
    },
    {
      name: "Hill's Science Diet Sensitive Stomach & Skin Adult",
      brand: "Hill's Science Diet",
      animalType: 'Dog',
      ageCategory: 'Adult',
      foodType: 'Dry Food',
      imageUrl: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&q=80&w=600',
      description: 'Formulated with prebiotic fiber to fuel beneficial gut microbes and support a balanced microbiome for dogs with delicate digestion.',
      keyIngredients: 'Chicken, brewers rice, chicken meal, yellow peas, cracked pearled barley, whole grain sorghum, egg product.',
      nutritionalInfo: 'Crude Protein: 21.0% min, Crude Fat: 12.0% min, Crude Fiber: 4.0% max, Vitamin E: 400 IU/kg min.',
      allergyWarnings: 'Formulated without artificial colors or synthetic preservatives.',
      feedingGuidance: 'Feed 3.25 cups per day for dogs weighing 25-30kg. Adjust to maintain optimal body condition.',
      price: 76.99,
      rating: 4.8,
    },
    {
      name: 'Blue Buffalo Life Protection Puppy Chicken & Brown Rice',
      brand: 'Blue Buffalo',
      animalType: 'Dog',
      ageCategory: 'Puppy',
      foodType: 'Dry Food',
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
      description: 'Features high-quality deboned chicken plus wholesome whole grains, garden veggies, and DHA to support healthy puppy cognitive and bone growth.',
      keyIngredients: 'Deboned chicken, chicken meal, brown rice, barley, oatmeal, chicken fat, flaxseed, fish meal.',
      nutritionalInfo: 'Crude Protein: 27.0% min, Crude Fat: 16.0% min, Calcium: 1.3% min, Phosphorus: 1.0% min.',
      allergyWarnings: 'Contains fish meal and oatmeal.',
      feedingGuidance: 'Puppies 4-6 months: 2 to 3.5 cups daily distributed across 3 balanced meals.',
      price: 68.50,
      rating: 4.7,
    },
    {
      name: 'Purina Pro Plan Sensitive Skin & Stomach Salmon Stew Wet',
      brand: 'Purina Pro Plan',
      animalType: 'Dog',
      ageCategory: 'All Stages',
      foodType: 'Wet Food',
      imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=600',
      description: 'Savory wet entree with real salmon and easily digestible rice that is gentle on sensitive canine stomachs and nourishes healthy skin.',
      keyIngredients: 'Salmon, water, meat by-products, liver, rice, fish, guar gum, potassium chloride.',
      nutritionalInfo: 'Crude Protein: 7.0% min, Crude Fat: 5.0% min, Moisture: 78.0% max.',
      allergyWarnings: 'Contains natural ocean fish.',
      feedingGuidance: 'Feed 1 can per 9-11 kg of body weight daily as a complete meal or mixed with dry kibble.',
      price: 42.00,
      rating: 4.9,
    },
    {
      name: 'Orijen Senior Grain-Free Biologically Appropriate',
      brand: 'Orijen',
      animalType: 'Dog',
      ageCategory: 'Senior',
      foodType: 'Special Dietary Food',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600',
      description: 'Rich in protein from free-run chicken, turkey, and wild-caught fish to support lean muscle mass and healthy organ vitality in mature dogs.',
      keyIngredients: 'Fresh chicken meat, fresh turkey meat, fresh whole eggs, fresh chicken liver, fresh whole herring.',
      nutritionalInfo: 'Crude Protein: 38.0% min, Crude Fat: 15.0% min, Glucosamine: 1200 mg/kg min.',
      allergyWarnings: '100% grain-free. Contains egg and wild-caught fish.',
      feedingGuidance: 'Feed 2 to 2.5 cups daily for older, lower-activity dogs weighing 25-30kg.',
      price: 98.00,
      rating: 4.9,
    },
    {
      name: 'Royal Canin Feline Health Indoor Adult Dry',
      brand: 'Royal Canin',
      animalType: 'Cat',
      ageCategory: 'Adult',
      foodType: 'Dry Food',
      imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=600',
      description: 'Specifically engineered for indoor cats aged 1 to 7 years. Helps stimulate intestinal transit and facilitates the elimination of ingested hair.',
      keyIngredients: 'Chicken meal, corn, brewers rice, wheat gluten, wheat, chicken fat, powdered cellulose, beet pulp.',
      nutritionalInfo: 'Crude Protein: 27.0% min, Crude Fat: 11.0% min, Crude Fiber: 5.5% max, L-Carnitine: 50 mg/kg min.',
      allergyWarnings: 'Contains wheat gluten and corn derivatives.',
      feedingGuidance: 'Feed 1/2 cup to 5/8 cup daily for adult cats weighing 4-5 kg.',
      price: 49.99,
      rating: 4.8,
    },
    {
      name: "Hill's Prescription Diet Gastrointestinal Biome Feline",
      brand: "Hill's Prescription Diet",
      animalType: 'Cat',
      ageCategory: 'All Stages',
      foodType: 'Special Dietary Food',
      imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
      description: 'Clinically tested food uniquely formulated with ActivBiome+ technology to promote regular healthy stool in as little as 24 hours.',
      keyIngredients: 'Chicken, brewers rice, corn gluten meal, chicken fat, wheat gluten, pea protein, whole grain oats, pecan shells.',
      nutritionalInfo: 'Crude Protein: 31.0% min, Crude Fat: 15.0% min, Crude Fiber: 7.0% max, Potassium: 0.8% min.',
      allergyWarnings: 'Prescription veterinary therapeutic formula. Consult your vet prior to long-term use.',
      feedingGuidance: 'Feed approximately 55 grams per day for a 4kg cat.',
      price: 64.99,
      rating: 4.9,
    },
    {
      name: 'Wellness CORE Grain-Free Kitten Deboned Turkey & Chicken',
      brand: 'Wellness CORE',
      animalType: 'Cat',
      ageCategory: 'Kitten',
      foodType: 'Dry Food',
      imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=600',
      description: 'Nutrient-dense recipe packed with premium poultry protein, DHA from salmon oil, and essential vitamins for growing kittens up to 1 year.',
      keyIngredients: 'Deboned turkey, deboned chicken, turkey meal, chicken meal, peas, herring meal, salmon oil.',
      nutritionalInfo: 'Crude Protein: 45.0% min, Crude Fat: 18.0% min, DHA: 0.1% min, Taurine: 0.2% min.',
      allergyWarnings: 'Grain-free. Contains salmon oil and herring meal.',
      feedingGuidance: 'Kittens 4-6 months: Feed 1/2 to 2/3 cup per day split over 3 feedings.',
      price: 43.50,
      rating: 4.8,
    },
    {
      name: 'Fancy Feast Gourmet Naturals Wild Alaskan Salmon Pate Wet',
      brand: 'Purina Fancy Feast',
      animalType: 'Cat',
      ageCategory: 'Adult',
      foodType: 'Wet Food',
      imageUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&q=80&w=600',
      description: 'Delicate smooth pate made with wild Alaskan salmon, accented with vitamin-rich broth and free of artificial colors, flavors, or poultry by-products.',
      keyIngredients: 'Salmon, fish broth, liver, meat by-products, ocean fish, natural flavors, tricalcium phosphate.',
      nutritionalInfo: 'Crude Protein: 10.0% min, Crude Fat: 5.0% min, Moisture: 78.0% max.',
      allergyWarnings: 'Contains natural fish and shellfish extracts.',
      feedingGuidance: 'Feed 1 can per 1.5 to 1.8 kg of cat body weight daily.',
      price: 31.20,
      rating: 4.7,
    },
    {
      name: 'Blue Buffalo Tastefuls Mature Senior 7+ Chicken Entree Wet',
      brand: 'Blue Buffalo',
      animalType: 'Cat',
      ageCategory: 'Senior',
      foodType: 'Wet Food',
      imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&q=80&w=600',
      description: 'Silky, high-moisture pate crafted specifically for senior cats 7+ to support kidney hydration, gentle joint health, and easy chewability.',
      keyIngredients: 'Chicken, chicken broth, chicken liver, brown rice, sweet potatoes, flaxseed, cranberries, fish oil.',
      nutritionalInfo: 'Crude Protein: 8.5% min, Crude Fat: 5.0% min, Crude Fiber: 1.5% max, Taurine: 0.1% min.',
      allergyWarnings: 'Contains brown rice and fish oil.',
      feedingGuidance: 'Feed two 3-oz cans per 3-4 kg body weight daily.',
      price: 36.00,
      rating: 4.6,
    },
  ];

  for (const item of foodProductsData) {
    await prisma.foodProduct.create({
      data: item,
    });
  }
  console.log(`✓ Seeded ${foodProductsData.length} food products`);

  // 6. Favorite foods for demo user
  const firstFood = await prisma.foodProduct.findFirst({
    where: { name: { contains: 'Golden Retriever' } },
  });
  const secondFood = await prisma.foodProduct.findFirst({
    where: { name: { contains: 'Gastrointestinal Biome' } },
  });

  if (firstFood) {
    await prisma.favoriteFood.create({
      data: {
        userId: demoUser.id,
        foodId: firstFood.id,
      },
    });
  }
  if (secondFood) {
    await prisma.favoriteFood.create({
      data: {
        userId: demoUser.id,
        foodId: secondFood.id,
      },
    });
  }
  console.log(`✓ Seeded favorite food items for demo user`);

  // 7. Seed Veterinary Doctors
  const vetsData = [
    {
      name: 'Dr. Emily Watson, DVM',
      clinicName: 'PetCare Specialty & Emergency Hospital',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      specialization: 'Internal Medicine & Preventative Care',
      clinicAddress: '742 Evergreen Terrace, Suite 100, Metro City',
      phone: '+1 (555) 789-0123',
      email: 'dr.watson@petcarespecialty.com',
      experienceYears: 12,
      consultationFee: 65.0,
      availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
      availableTimeSlots: JSON.stringify(['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM']),
      rating: 4.9,
    },
    {
      name: 'Dr. Marcus Chen, DVM, DACVS',
      clinicName: 'Metropolitan Animal Surgical & Orthopedic Center',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      specialization: 'Orthopedic Surgery & Joint Rehabilitation',
      clinicAddress: '1204 Pine Creek Boulevard, North Ridge',
      phone: '+1 (555) 890-1234',
      email: 'dr.chen@metroanimalsurgery.com',
      experienceYears: 15,
      consultationFee: 85.0,
      availableDays: 'Monday,Wednesday,Thursday,Friday',
      availableTimeSlots: JSON.stringify(['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM']),
      rating: 4.95,
    },
    {
      name: 'Dr. Sophia Rodriguez, DVM',
      clinicName: 'Happy Paws Feline & Canine Wellness Clinic',
      imageUrl: 'https://images.unsplash.com/photo-1594824813576-928646b9a84a?auto=format&fit=crop&q=80&w=400',
      specialization: 'Feline Medicine, Nutrition & Dental Care',
      clinicAddress: '318 Blossom Hill Rd, Suite 4B, South Bay',
      phone: '+1 (555) 901-2345',
      email: 'dr.rodriguez@happypawswellness.com',
      experienceYears: 8,
      consultationFee: 55.0,
      availableDays: 'Tuesday,Wednesday,Thursday,Friday,Saturday',
      availableTimeSlots: JSON.stringify(['10:00 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM']),
      rating: 4.88,
    },
    {
      name: 'Dr. David Patel, DVM',
      clinicName: 'Allied Animal Dermatology & Allergy Clinic',
      imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
      specialization: 'Dermatology, Allergies & Immunology',
      clinicAddress: '88 Oakridge Way, Westside Medical Park',
      phone: '+1 (555) 012-3456',
      email: 'dr.patel@alliedanimalderm.com',
      experienceYears: 10,
      consultationFee: 70.0,
      availableDays: 'Monday,Tuesday,Wednesday,Friday,Saturday',
      availableTimeSlots: JSON.stringify(['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM']),
      rating: 4.85,
    },
  ];

  const createdVets = [];
  for (const v of vetsData) {
    const created = await prisma.veterinaryDoctor.create({
      data: v,
    });
    createdVets.push(created);
  }
  console.log(`✓ Seeded ${vetsData.length} veterinary doctors`);

  // 8. Seed Salons & Services
  const salonsData = [
    {
      name: 'Paws & Bubbles Luxury Grooming Spa',
      imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
      address: '450 Marina Boulevard, Ocean View',
      phone: '+1 (555) 345-6789',
      rating: 4.9,
      availableDays: 'Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
      availableTimeSlots: JSON.stringify(['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM']),
      services: [
        { name: 'Full Grooming', description: 'Hydro-surge bath, haircut/styling, blow-dry, nail trim, ear cleaning & blueberry facial.', price: 75.0, durationMinutes: 90 },
        { name: 'Bathing & Brushout', description: 'Hypoallergenic botanical shampoo, conditioning rinse, high-velocity blow dry & deshedding brush.', price: 45.0, durationMinutes: 50 },
        { name: 'Hair Cutting & Styling', description: 'Breed-standard cut or custom puppy cut with precision scissor hand-finish.', price: 55.0, durationMinutes: 60 },
        { name: 'Nail Trimming & Grinding', description: 'Gentle clipping followed by smooth rotary filing for rounded, scratch-free edges.', price: 18.0, durationMinutes: 20 },
        { name: 'Ear Cleaning & Plucking', description: 'Deep cleansing with antibacterial soothing solution to prevent ear canal infections.', price: 15.0, durationMinutes: 15 },
        { name: 'Aromatherapy Spa Treatment', description: 'Soothing dead sea mud bath, paw balm massage, and natural lavender calming mist.', price: 90.0, durationMinutes: 100 },
      ],
    },
    {
      name: 'Fur-Ever Fluffy Pet Studio',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
      address: '812 Willowbrook Avenue, Midtown',
      phone: '+1 (555) 456-7890',
      rating: 4.8,
      availableDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
      availableTimeSlots: JSON.stringify(['09:30 AM', '11:00 AM', '01:00 PM', '02:30 PM', '04:00 PM']),
      services: [
        { name: 'Full Grooming', description: 'Complete head-to-tail wash, breed silhouette styling, sanitary trim and nail clipping.', price: 68.0, durationMinutes: 75 },
        { name: 'Bathing & De-Shedding', description: 'Double lather with oatmeal formula, furminator deshedding treatment & blowout.', price: 42.0, durationMinutes: 45 },
        { name: 'Nail Trimming', description: 'Quick and stress-free nail trimming with paw pad balm application.', price: 15.0, durationMinutes: 15 },
        { name: 'Teeth Brushing & Breath Freshening', description: 'Enzymatic toothpaste application and plaque defense oral spray.', price: 12.0, durationMinutes: 15 },
      ],
    },
    {
      name: 'Urban Hound & Kitty Groomery',
      imageUrl: 'https://images.unsplash.com/photo-1608096299210-db7e38487075?auto=format&fit=crop&q=80&w=600',
      address: '229 Riverside Plaza, Downtown',
      phone: '+1 (555) 567-8901',
      rating: 4.85,
      availableDays: 'Wednesday,Thursday,Friday,Saturday,Sunday',
      availableTimeSlots: JSON.stringify(['10:00 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM']),
      services: [
        { name: 'Full Grooming', description: 'Organic citrus shampoo, custom scissor cut, gentle ear wash and paw trim.', price: 72.0, durationMinutes: 80 },
        { name: 'Bathing', description: 'Warm water bubble bath, conditioning coat mask and blow dry.', price: 40.0, durationMinutes: 40 },
        { name: 'Spa Treatment', description: 'Calming chamomile soak, gentle coat glaze, and nose & paw restoration balm.', price: 85.0, durationMinutes: 90 },
      ],
    },
  ];

  const createdSalons = [];
  for (const s of salonsData) {
    const { services, ...salonData } = s;
    const createdSalon = await prisma.salon.create({
      data: {
        ...salonData,
        services: {
          create: services,
        },
      },
      include: { services: true },
    });
    createdSalons.push(createdSalon);
  }
  console.log(`✓ Seeded ${salonsData.length} salons with services`);

  // 9. Seed Appointments for Demo User
  await prisma.appointment.create({
    data: {
      id: `PAW-VET-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: demoUser.id,
      petId: milo.id,
      type: 'VETERINARY',
      vetId: createdVets[0].id,
      date: '2026-11-20',
      timeSlot: '10:00 AM',
      reason: 'Routine Annual Wellness Exam & Heartworm Check',
      notes: 'Milo is active and eating normally. Please check slight ear scratching.',
      status: 'UPCOMING',
      fee: createdVets[0].consultationFee,
    },
  });

  const salonService = createdSalons[0].services[0];
  await prisma.appointment.create({
    data: {
      id: `PAW-SAL-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: demoUser.id,
      petId: luna.id,
      type: 'SALON',
      salonId: createdSalons[0].id,
      serviceId: salonService.id,
      date: '2026-11-25',
      timeSlot: '02:00 PM',
      reason: 'Full Grooming & Soft Brushout',
      notes: 'Please use extra gentle handling as Luna can be shy with loud hair dryers.',
      status: 'UPCOMING',
      fee: salonService.price,
    },
  });

  await prisma.appointment.create({
    data: {
      id: `PAW-VET-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: demoUser.id,
      petId: milo.id,
      type: 'VETERINARY',
      vetId: createdVets[1].id,
      date: '2026-09-15',
      timeSlot: '02:30 PM',
      reason: 'Past Minor Paw Sprain Inspection',
      notes: 'Sprain resolved completely with rest.',
      status: 'COMPLETED',
      fee: 85.0,
    },
  });
  console.log(`✓ Seeded appointments`);

  // 10. Seed Reminders
  await prisma.reminder.createMany({
    data: [
      {
        userId: demoUser.id,
        petId: milo.id,
        title: 'Milo: Monthly Simparica Trio Chewable',
        category: 'Medication',
        dueDate: new Date('2026-11-12T09:00:00Z'),
        isCompleted: false,
        notes: 'Administer with breakfast for heartworm & tick prevention.',
      },
      {
        userId: demoUser.id,
        petId: luna.id,
        title: 'Luna: Brush Coat & Check Nail Length',
        category: 'Grooming',
        dueDate: new Date('2026-11-14T15:00:00Z'),
        isCompleted: false,
        notes: 'Use soft rubber brush to reduce hairballs.',
      },
      {
        userId: demoUser.id,
        petId: milo.id,
        title: 'Milo: Upcoming Vet Wellness Visit',
        category: 'Checkup',
        dueDate: new Date('2026-11-20T10:00:00Z'),
        isCompleted: false,
        notes: 'Appointment confirmed with Dr. Emily Watson.',
      },
    ],
  });
  console.log(`✓ Seeded reminders`);

  console.log('🎉 PawHome database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

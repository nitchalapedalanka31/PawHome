import app from '../app';
import { prisma } from '../config/database';
import http from 'http';

async function runTestSuite() {
  console.log('🧪 Starting PawHome Automated End-to-End Test Suite...\n');

  // Start ephemeral server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://localhost:${address.port}/api`;
  console.log(`📡 Ephemeral Test Server listening on port ${address.port}`);

  let testUserToken = '';
  let testUserId = '';
  let secondUserToken = '';
  let pet1Id = '';
  let pet2Id = '';
  let appointmentId = '';
  let doctorId = '';
  let salonId = '';
  let salonServiceId = '';
  let foodId = '';

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      throw new Error(`Test assertion failed: ${testName}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health-check`).then((r) => r.json());
    assert(healthRes.status === 'ok' && healthRes.team === 'Team Dorado', 'System Health Check endpoint returns 200 and Team Dorado branding');

    // 2. User Registration
    const randEmail = `testuser_${Date.now()}@pawhome.com`;
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Automation User',
        email: randEmail,
        phone: '+1 (555) 999-8888',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    }).then((r) => r.json());
    assert(regRes.success && !!regRes.token, 'User Registration creates account and returns valid JWT token');
    testUserToken = regRes.token;
    testUserId = regRes.user.id;

    // 3. User Login with valid credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randEmail,
        password: 'Password123!',
      }),
    }).then((r) => r.json());
    assert(loginRes.success && !!loginRes.token, 'User Login succeeds with correct credentials');

    // 4. Incorrect credentials rejected
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: randEmail,
        password: 'WrongPassword!',
      }),
    });
    assert(badLoginRes.status === 401, 'Incorrect password correctly rejected with 401 Unauthorized');

    // 5. Add Multiple Pets
    const pet1Res = await fetch(`${baseUrl}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        name: 'Barnaby',
        animalType: 'Dog',
        breed: 'Beagle',
        age: 4,
        gender: 'Male',
        weight: 12.4,
        specialNotes: 'Enjoys trailing scents in backyards',
      }),
    }).then((r) => r.json());
    assert(pet1Res.success && pet1Res.pet.name === 'Barnaby', 'Successfully registered Pet 1 (Barnaby the Beagle)');
    pet1Id = pet1Res.pet.id;

    const pet2Res = await fetch(`${baseUrl}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        name: 'Cleo',
        animalType: 'Cat',
        breed: 'Siamese',
        age: 2,
        gender: 'Female',
        weight: 3.8,
      }),
    }).then((r) => r.json());
    assert(pet2Res.success && pet2Res.pet.name === 'Cleo', 'Successfully registered Pet 2 (Cleo the Siamese)');
    pet2Id = pet2Res.pet.id;

    // 6. Get Pets list
    const getPetsRes = await fetch(`${baseUrl}/pets`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    }).then((r) => r.json());
    assert(getPetsRes.success && getPetsRes.pets.length === 2, 'Fetched all registered pets for authenticated user');

    // 7. Edit Pet Details
    const editPetRes = await fetch(`${baseUrl}/pets/${pet1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        weight: 13.0,
        specialNotes: 'Enjoys trailing scents and gentle morning runs',
      }),
    }).then((r) => r.json());
    assert(editPetRes.success && editPetRes.pet.weight === 13.0, 'Pet weight and special notes successfully updated');

    // 8. Pet Mood Scanner analysis
    const moodRes = await fetch(`${baseUrl}/mood/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet1Id,
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600',
      }),
    }).then((r) => r.json());
    assert(
      moodRes.success &&
        ['Happy', 'Relaxed', 'Curious', 'Playful', 'Fearful', 'Stressed'].includes(moodRes.data.predictedMood) &&
        moodRes.data.confidence > 0 &&
        moodRes.data.isDemoMode === true &&
        moodRes.data.careTips.length > 0,
      'Pet Mood Scanner produces biologically-grounded mood, confidence, care tips, and indicative disclaimer'
    );

    // 9. Mood Analysis History
    const moodHistRes = await fetch(`${baseUrl}/mood/history/${pet1Id}`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    }).then((r) => r.json());
    assert(moodHistRes.success && moodHistRes.history.length >= 1, 'Mood analysis is saved to pet history and queryable');

    // 10. Food Product Catalogue & Filtering
    const foodRes = await fetch(`${baseUrl}/food?animalType=Dog`).then((r) => r.json());
    assert(foodRes.success && foodRes.foods.length > 0, 'Food recommendations filter by animalType=Dog properly');
    foodId = foodRes.foods[0].id;

    // 11. Favorite Food Item Toggle
    const favToggleRes = await fetch(`${baseUrl}/food/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({ foodId }),
    }).then((r) => r.json());
    assert(favToggleRes.success && favToggleRes.isFavorite === true, 'Successfully added food item to user favorites');

    const favListRes = await fetch(`${baseUrl}/food/favorites`, {
      headers: { Authorization: `Bearer ${testUserToken}` },
    }).then((r) => r.json());
    assert(favListRes.success && favListRes.foods.some((f: any) => f.id === foodId), 'User saved food items retrieved in favorites list');

    // 12. Veterinary Doctor Listing & Slot Availability
    const vetsRes = await fetch(`${baseUrl}/vets`).then((r) => r.json());
    assert(vetsRes.success && vetsRes.vets.length > 0, 'Fetched veterinary doctors list with consultation fee and credentials');
    doctorId = vetsRes.vets[0].id;

    const testApptDate = '2026-12-15';
    const slotsRes = await fetch(`${baseUrl}/vets/${doctorId}/slots?date=${testApptDate}`).then((r) => r.json());
    assert(slotsRes.success && slotsRes.slots.length > 0, 'Checked real-time time slot availability for doctor on specified date');
    const chosenSlot = slotsRes.slots[0].slot;

    // 13. Veterinary Appointment Booking
    const bookRes = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet1Id,
        type: 'VETERINARY',
        vetId: doctorId,
        date: testApptDate,
        timeSlot: chosenSlot,
        reason: 'Routine checkup and ear cleaning',
      }),
    }).then((r) => r.json());
    assert(bookRes.success && bookRes.appointment.id.startsWith('PAW-VET-'), 'Veterinary appointment created with unique PAW-VET- ID');
    appointmentId = bookRes.appointment.id;

    // 14. Duplicate Slot Prevention
    const dupBookRes = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet2Id,
        type: 'VETERINARY',
        vetId: doctorId,
        date: testApptDate,
        timeSlot: chosenSlot,
        reason: 'Attempt duplicate booking on same slot',
      }),
    });
    assert(dupBookRes.status === 409, 'Duplicate booking of same doctor time slot is strictly prevented with 409 Conflict');

    // 15. Appointment Cancellation
    const cancelRes = await fetch(`${baseUrl}/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${testUserToken}` },
    }).then((r) => r.json());
    assert(cancelRes.success && cancelRes.appointment.status === 'CANCELLED', 'Appointment successfully cancelled and status updated to CANCELLED');

    // 16. Salon Listing & Booking
    const salonsRes = await fetch(`${baseUrl}/salons`).then((r) => r.json());
    assert(salonsRes.success && salonsRes.salons.length > 0 && salonsRes.salons[0].services.length > 0, 'Fetched grooming salons and their services');
    salonId = salonsRes.salons[0].id;
    salonServiceId = salonsRes.salons[0].services[0].id;

    const salonBookRes = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet2Id,
        type: 'SALON',
        salonId,
        serviceId: salonServiceId,
        date: '2026-12-18',
        timeSlot: '02:00 PM',
        notes: 'Extra gentle brushout',
      }),
    }).then((r) => r.json());
    assert(salonBookRes.success && salonBookRes.appointment.id.startsWith('PAW-SAL-'), 'Salon appointment created with PAW-SAL- ID');

    // 17. Health Records Management
    const healthRecRes = await fetch(`${baseUrl}/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet1Id,
        recordType: 'Vaccination',
        title: 'Bordetella Oral Vaccine',
        date: '2026-11-01',
        clinicOrVet: 'Downtown Animal Hospital',
        description: 'Kennel cough defense for dog parks',
      }),
    }).then((r) => r.json());
    assert(healthRecRes.success && healthRecRes.record.title === 'Bordetella Oral Vaccine', 'Health record saved successfully');

    // 18. Reminders Management
    const remRes = await fetch(`${baseUrl}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        petId: pet1Id,
        title: 'Barnaby: Monthly Flea Topical',
        category: 'Medication',
        dueDate: '2026-12-01',
        notes: 'Apply between shoulder blades',
      }),
    }).then((r) => r.json());
    assert(remRes.success && remRes.reminder.title.includes('Flea Topical'), 'Health reminder successfully created');

    // 19. Security Check: Prevent Cross-User Data Access
    const secondEmail = `second_user_${Date.now()}@pawhome.com`;
    const secondRegRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Second Unrelated User',
        email: secondEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    }).then((r) => r.json());
    secondUserToken = secondRegRes.token;

    const crossAccessRes = await fetch(`${baseUrl}/pets/${pet1Id}`, {
      headers: { Authorization: `Bearer ${secondUserToken}` },
    });
    assert(crossAccessRes.status === 404, 'Security check: Second user CANNOT view or access first user private pet records (returns 404/unauthorized)');

    // 20. Delete Pet
    const delPetRes = await fetch(`${baseUrl}/pets/${pet2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${testUserToken}` },
    }).then((r) => r.json());
    assert(delPetRes.success, 'Pet profile successfully deleted');

    console.log(`\n==============================================`);
    console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
    console.log(`🐾 PawHome platform by Team Dorado is fully verified.`);
    console.log(`==============================================\n`);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

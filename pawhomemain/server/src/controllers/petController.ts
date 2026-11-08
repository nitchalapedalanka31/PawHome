import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getPets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const pets = await prisma.pet.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            healthRecords: true,
            moodAnalyses: true,
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, pets });
  } catch (error: any) {
    console.error('getPets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve pets.' });
  }
};

export const getPetById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id, userId },
      include: {
        healthRecords: {
          orderBy: { date: 'desc' },
        },
        moodAnalyses: {
          orderBy: { createdAt: 'desc' },
        },
        appointments: {
          include: {
            vet: true,
            salon: true,
            service: true,
          },
          orderBy: { date: 'desc' },
        },
        reminders: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    res.status(200).json({ success: true, pet });
  } catch (error: any) {
    console.error('getPetById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve pet details.' });
  }
};

export const createPet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      name,
      animalType,
      breed,
      age,
      gender,
      dateOfBirth,
      weight,
      imageUrl,
      medicalInfo,
      vaccinationDetails,
      allergies,
      specialNotes,
    } = req.body;

    if (!name || !animalType || !breed || !gender) {
      res.status(400).json({
        success: false,
        message: 'Name, animal type (Dog/Cat/Other), breed, and gender are required.',
      });
      return;
    }

    const pet = await prisma.pet.create({
      data: {
        userId,
        name: name.trim(),
        animalType,
        breed: breed.trim(),
        age: age ? parseInt(age, 10) : null,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        weight: weight ? parseFloat(weight) : null,
        imageUrl: imageUrl || null,
        medicalInfo: medicalInfo || null,
        vaccinationDetails: vaccinationDetails || null,
        allergies: allergies || null,
        specialNotes: specialNotes || null,
      },
    });

    res.status(201).json({
      success: true,
      message: `${pet.name} added to your PawHome family!`,
      pet,
    });
  } catch (error: any) {
    console.error('createPet error:', error);
    res.status(500).json({ success: false, message: 'Failed to create pet profile.' });
  }
};

export const updatePet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingPet = await prisma.pet.findFirst({
      where: { id, userId },
    });

    if (!existingPet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    const {
      name,
      animalType,
      breed,
      age,
      gender,
      dateOfBirth,
      weight,
      imageUrl,
      medicalInfo,
      vaccinationDetails,
      allergies,
      specialNotes,
    } = req.body;

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(animalType && { animalType }),
        ...(breed && { breed: breed.trim() }),
        ...(age !== undefined && { age: age !== null ? parseInt(age, 10) : null }),
        ...(gender && { gender }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(weight !== undefined && { weight: weight !== null ? parseFloat(weight) : null }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(medicalInfo !== undefined && { medicalInfo }),
        ...(vaccinationDetails !== undefined && { vaccinationDetails }),
        ...(allergies !== undefined && { allergies }),
        ...(specialNotes !== undefined && { specialNotes }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Pet profile updated successfully.',
      pet: updatedPet,
    });
  } catch (error: any) {
    console.error('updatePet error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pet profile.' });
  }
};

export const deletePet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existingPet = await prisma.pet.findFirst({
      where: { id, userId },
    });

    if (!existingPet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    await prisma.pet.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: `${existingPet.name}'s profile was deleted successfully.`,
    });
  } catch (error: any) {
    console.error('deletePet error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete pet.' });
  }
};

import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getHealthRecordsByPet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { petId } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    const records = await prisma.petHealthRecord.findMany({
      where: { petId },
      orderBy: { date: 'desc' },
    });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error: any) {
    console.error('getHealthRecordsByPet error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve health records.' });
  }
};

export const createHealthRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      petId,
      recordType, // Vaccination, Deworming, Medical History, Weight Tracking, Surgery, General Checkup
      title,
      date,
      description,
      clinicOrVet,
      nextDueDate,
      attachmentUrl,
    } = req.body;

    if (!petId || !recordType || !title || !date) {
      res.status(400).json({
        success: false,
        message: 'Pet ID, record type, title, and date are required.',
      });
      return;
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    const record = await prisma.petHealthRecord.create({
      data: {
        petId,
        recordType,
        title: title.trim(),
        date: new Date(date),
        description: description || null,
        clinicOrVet: clinicOrVet || null,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        attachmentUrl: attachmentUrl || null,
      },
    });

    // If nextDueDate is specified and future, also create a corresponding Reminder if requested
    if (nextDueDate && new Date(nextDueDate) > new Date()) {
      await prisma.reminder.create({
        data: {
          userId,
          petId,
          title: `Due: ${title} (${pet.name})`,
          category: recordType === 'Vaccination' ? 'Vaccination' : 'Checkup',
          dueDate: new Date(nextDueDate),
          notes: `Follow-up from health record created on ${new Date(date).toLocaleDateString()}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Health record added successfully.',
      record,
    });
  } catch (error: any) {
    console.error('createHealthRecord error:', error);
    res.status(500).json({ success: false, message: 'Failed to create health record.' });
  }
};

export const updateHealthRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.petHealthRecord.findUnique({
      where: { id },
      include: { pet: true },
    });

    if (!record || record.pet.userId !== userId) {
      res.status(404).json({ success: false, message: 'Health record not found or unauthorized.' });
      return;
    }

    const {
      recordType,
      title,
      date,
      description,
      clinicOrVet,
      nextDueDate,
      attachmentUrl,
    } = req.body;

    const updated = await prisma.petHealthRecord.update({
      where: { id },
      data: {
        ...(recordType && { recordType }),
        ...(title && { title: title.trim() }),
        ...(date && { date: new Date(date) }),
        ...(description !== undefined && { description }),
        ...(clinicOrVet !== undefined && { clinicOrVet }),
        ...(nextDueDate !== undefined && { nextDueDate: nextDueDate ? new Date(nextDueDate) : null }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Health record updated successfully.',
      record: updated,
    });
  } catch (error: any) {
    console.error('updateHealthRecord error:', error);
    res.status(500).json({ success: false, message: 'Failed to update health record.' });
  }
};

export const deleteHealthRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const record = await prisma.petHealthRecord.findUnique({
      where: { id },
      include: { pet: true },
    });

    if (!record || record.pet.userId !== userId) {
      res.status(404).json({ success: false, message: 'Health record not found or unauthorized.' });
      return;
    }

    await prisma.petHealthRecord.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Health record deleted successfully.',
    });
  } catch (error: any) {
    console.error('deleteHealthRecord error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete health record.' });
  }
};

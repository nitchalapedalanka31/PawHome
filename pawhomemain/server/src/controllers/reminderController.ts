import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { petId, completed } = req.query;

    const whereClause: any = { userId };
    if (petId) {
      whereClause.petId = String(petId);
    }
    if (completed !== undefined) {
      whereClause.isCompleted = completed === 'true';
    }

    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        pet: {
          select: { id: true, name: true, animalType: true, imageUrl: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.status(200).json({ success: true, count: reminders.length, reminders });
  } catch (error: any) {
    console.error('getReminders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve reminders.' });
  }
};

export const createReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { petId, title, category, dueDate, notes } = req.body;

    if (!petId || !title || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Pet ID, title, and due date are required.',
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

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        petId,
        title: title.trim(),
        category: category || 'General',
        dueDate: new Date(dueDate),
        notes: notes || null,
        isCompleted: false,
      },
      include: {
        pet: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully.',
      reminder,
    });
  } catch (error: any) {
    console.error('createReminder error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reminder.' });
  }
};

export const updateReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found or unauthorized.' });
      return;
    }

    const { title, category, dueDate, isCompleted, notes } = req.body;

    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(category && { category }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(isCompleted !== undefined && { isCompleted: Boolean(isCompleted) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        pet: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully.',
      reminder: updated,
    });
  } catch (error: any) {
    console.error('updateReminder error:', error);
    res.status(500).json({ success: false, message: 'Failed to update reminder.' });
  }
};

export const deleteReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!reminder) {
      res.status(404).json({ success: false, message: 'Reminder not found or unauthorized.' });
      return;
    }

    await prisma.reminder.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully.',
    });
  } catch (error: any) {
    console.error('deleteReminder error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reminder.' });
  }
};

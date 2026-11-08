import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getVets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, search } = req.query;

    const whereClause: any = {};
    if (specialization && specialization !== 'All') {
      whereClause.specialization = { contains: String(specialization) };
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { clinicName: { contains: q } },
        { specialization: { contains: q } },
        { clinicAddress: { contains: q } },
      ];
    }

    const vets = await prisma.veterinaryDoctor.findMany({
      where: whereClause,
      orderBy: { rating: 'desc' },
    });

    const parsedVets = vets.map((vet) => ({
      ...vet,
      availableTimeSlots: (() => {
        try {
          return JSON.parse(vet.availableTimeSlots);
        } catch {
          return ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'];
        }
      })(),
    }));

    res.status(200).json({ success: true, count: parsedVets.length, vets: parsedVets });
  } catch (error: any) {
    console.error('getVets error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve veterinary doctors.' });
  }
};

export const getVetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vet = await prisma.veterinaryDoctor.findUnique({
      where: { id },
    });

    if (!vet) {
      res.status(404).json({ success: false, message: 'Veterinary doctor not found.' });
      return;
    }

    const parsedVet = {
      ...vet,
      availableTimeSlots: (() => {
        try {
          return JSON.parse(vet.availableTimeSlots);
        } catch {
          return ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'];
        }
      })(),
    };

    res.status(200).json({ success: true, vet: parsedVet });
  } catch (error: any) {
    console.error('getVetById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve doctor details.' });
  }
};

export const getVetSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ success: false, message: 'Query parameter "date" (YYYY-MM-DD) is required.' });
      return;
    }

    const vet = await prisma.veterinaryDoctor.findUnique({
      where: { id },
    });

    if (!vet) {
      res.status(404).json({ success: false, message: 'Veterinary doctor not found.' });
      return;
    }

    let allSlots: string[] = [];
    try {
      allSlots = JSON.parse(vet.availableTimeSlots);
    } catch {
      allSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];
    }

    // Query booked appointments for this vet on this date (excluding cancelled)
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        vetId: id,
        date: String(date),
        status: { not: 'CANCELLED' },
      },
      select: { timeSlot: true },
    });

    const bookedSlotSet = new Set(bookedAppointments.map((a) => a.timeSlot));

    const slotAvailability = allSlots.map((slot) => ({
      slot,
      isAvailable: !bookedSlotSet.has(slot),
    }));

    res.status(200).json({
      success: true,
      vetId: id,
      date: String(date),
      slots: slotAvailability,
    });
  } catch (error: any) {
    console.error('getVetSlots error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve available slots.' });
  }
};

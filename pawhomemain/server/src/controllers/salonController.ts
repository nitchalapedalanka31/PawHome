import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getSalons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const whereClause: any = {};
    if (search && String(search).trim() !== '') {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { address: { contains: q } },
        { services: { some: { name: { contains: q } } } },
      ];
    }

    const salons = await prisma.salon.findMany({
      where: whereClause,
      include: {
        services: true,
      },
      orderBy: { rating: 'desc' },
    });

    const parsedSalons = salons.map((salon) => ({
      ...salon,
      availableTimeSlots: (() => {
        try {
          return JSON.parse(salon.availableTimeSlots);
        } catch {
          return ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
        }
      })(),
    }));

    res.status(200).json({ success: true, count: parsedSalons.length, salons: parsedSalons });
  } catch (error: any) {
    console.error('getSalons error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve salons.' });
  }
};

export const getSalonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const salon = await prisma.salon.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    if (!salon) {
      res.status(404).json({ success: false, message: 'Salon not found.' });
      return;
    }

    const parsedSalon = {
      ...salon,
      availableTimeSlots: (() => {
        try {
          return JSON.parse(salon.availableTimeSlots);
        } catch {
          return ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
        }
      })(),
    };

    res.status(200).json({ success: true, salon: parsedSalon });
  } catch (error: any) {
    console.error('getSalonById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve salon details.' });
  }
};

export const getSalonServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const services = await prisma.salonService.findMany({
      where: { salonId: id },
      orderBy: { price: 'asc' },
    });

    res.status(200).json({ success: true, count: services.length, services });
  } catch (error: any) {
    console.error('getSalonServices error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve salon services.' });
  }
};

export const getSalonSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ success: false, message: 'Query parameter "date" (YYYY-MM-DD) is required.' });
      return;
    }

    const salon = await prisma.salon.findUnique({
      where: { id },
    });

    if (!salon) {
      res.status(404).json({ success: false, message: 'Salon not found.' });
      return;
    }

    let allSlots: string[] = [];
    try {
      allSlots = JSON.parse(salon.availableTimeSlots);
    } catch {
      allSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'];
    }

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        salonId: id,
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
      salonId: id,
      date: String(date),
      slots: slotAvailability,
    });
  } catch (error: any) {
    console.error('getSalonSlots error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve available slots.' });
  }
};

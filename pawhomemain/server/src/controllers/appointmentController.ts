import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      petId,
      type, // 'VETERINARY' | 'SALON'
      vetId,
      salonId,
      serviceId,
      date,
      timeSlot,
      reason,
      notes,
    } = req.body;

    if (!petId || !type || !date || !timeSlot) {
      res.status(400).json({
        success: false,
        message: 'Pet, appointment type, date, and time slot are required.',
      });
      return;
    }

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Selected pet not found or unauthorized.' });
      return;
    }

    let fee = 0;
    let appointmentIdPrefix = 'PAW-';

    if (type === 'VETERINARY') {
      if (!vetId) {
        res.status(400).json({ success: false, message: 'Please select a veterinary doctor.' });
        return;
      }
      const vet = await prisma.veterinaryDoctor.findUnique({ where: { id: vetId } });
      if (!vet) {
        res.status(404).json({ success: false, message: 'Selected veterinary doctor not found.' });
        return;
      }
      fee = vet.consultationFee;
      appointmentIdPrefix = 'PAW-VET-';

      // Check for slot collision for this vet
      const existing = await prisma.appointment.findFirst({
        where: {
          vetId,
          date: String(date),
          timeSlot: String(timeSlot),
          status: { not: 'CANCELLED' },
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: `The selected time slot (${timeSlot}) with ${vet.name} on ${date} is already booked. Please choose another slot.`,
        });
        return;
      }
    } else if (type === 'SALON') {
      if (!salonId || !serviceId) {
        res.status(400).json({ success: false, message: 'Salon and salon service are required.' });
        return;
      }
      const salon = await prisma.salon.findUnique({ where: { id: salonId } });
      const service = await prisma.salonService.findUnique({ where: { id: serviceId } });

      if (!salon || !service) {
        res.status(404).json({ success: false, message: 'Selected salon or service not found.' });
        return;
      }
      fee = service.price;
      appointmentIdPrefix = 'PAW-SAL-';

      // Check for slot collision for this salon
      const existing = await prisma.appointment.findFirst({
        where: {
          salonId,
          date: String(date),
          timeSlot: String(timeSlot),
          status: { not: 'CANCELLED' },
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: `The selected time slot (${timeSlot}) at ${salon.name} on ${date} is already booked. Please choose another slot.`,
        });
        return;
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid appointment type. Must be VETERINARY or SALON.' });
      return;
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const appointmentId = `${appointmentIdPrefix}${randomSuffix}`;

    const appointment = await prisma.appointment.create({
      data: {
        id: appointmentId,
        userId,
        petId,
        type,
        vetId: type === 'VETERINARY' ? vetId : null,
        salonId: type === 'SALON' ? salonId : null,
        serviceId: type === 'SALON' ? serviceId : null,
        date: String(date),
        timeSlot: String(timeSlot),
        reason: reason || null,
        notes: notes || null,
        status: 'UPCOMING',
        fee,
      },
      include: {
        pet: true,
        vet: true,
        salon: true,
        service: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment confirmed successfully!',
      appointment,
    });
  } catch (error: any) {
    console.error('createAppointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create appointment.' });
  }
};

export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, type } = req.query;

    const whereClause: any = { userId };

    if (status && status !== 'ALL') {
      whereClause.status = String(status).toUpperCase();
    }

    if (type && type !== 'ALL') {
      whereClause.type = String(type).toUpperCase();
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        pet: true,
        vet: true,
        salon: true,
        service: true,
      },
      orderBy: [{ date: 'desc' }, { timeSlot: 'asc' }],
    });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error: any) {
    console.error('getAppointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

export const getAppointmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, userId },
      include: {
        pet: true,
        vet: true,
        salon: true,
        service: true,
      },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found or unauthorized.' });
      return;
    }

    res.status(200).json({ success: true, appointment });
  } catch (error: any) {
    console.error('getAppointmentById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve appointment.' });
  }
};

export const cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: { id, userId },
    });

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found or unauthorized.' });
      return;
    }

    if (appointment.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Appointment is already cancelled.' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        pet: true,
        vet: true,
        salon: true,
        service: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Appointment has been cancelled successfully.',
      appointment: updated,
    });
  } catch (error: any) {
    console.error('cancelAppointment error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

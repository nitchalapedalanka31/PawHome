import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { moodAnalysisService } from '../services/moodAnalysisService';

export const analyzeMood = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { petId, imageBase64, imageUrl: incomingImageUrl } = req.body;
    const file = req.file;

    if (!petId) {
      res.status(400).json({ success: false, message: 'Please select a pet for mood analysis.' });
      return;
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId },
    });

    if (!pet) {
      res.status(404).json({ success: false, message: 'Pet not found or unauthorized.' });
      return;
    }

    let savedImageUrl = incomingImageUrl || pet.imageUrl || '/default-pet.jpg';
    let localFilePath = '';

    const uploadsDir = path.resolve(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (file) {
      savedImageUrl = `/uploads/${file.filename}`;
      localFilePath = file.path;
    } else if (imageBase64) {
      // Process base64 camera capture
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split('/')[1] || 'jpeg';
        const fileName = `capture-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
        localFilePath = path.join(uploadsDir, fileName);
        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(localFilePath, buffer);
        savedImageUrl = `/uploads/${fileName}`;
      }
    }

    // Call Mood Analysis Service
    const analysis = await moodAnalysisService.analyzeImage(localFilePath || pet.name, {
      name: pet.name,
      animalType: pet.animalType,
      breed: pet.breed,
      age: pet.age || undefined,
    });

    // Save to database
    const savedRecord = await prisma.moodAnalysis.create({
      data: {
        petId: pet.id,
        imageUrl: savedImageUrl,
        predictedMood: analysis.predictedMood,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        observations: JSON.stringify(analysis.observations),
        careTips: JSON.stringify(analysis.careTips),
        isDemoMode: analysis.isDemoMode,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        id: savedRecord.id,
        petId: pet.id,
        petName: pet.name,
        imageUrl: savedImageUrl,
        predictedMood: analysis.predictedMood,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        observations: analysis.observations,
        careTips: analysis.careTips,
        isDemoMode: analysis.isDemoMode,
        disclaimer: analysis.disclaimer,
        createdAt: savedRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error('analyzeMood error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze pet mood.' });
  }
};

export const getMoodHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const history = await prisma.moodAnalysis.findMany({
      where: { petId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedHistory = history.map((h) => ({
      ...h,
      observations: (() => {
        try {
          return JSON.parse(h.observations);
        } catch {
          return [h.observations];
        }
      })(),
      careTips: (() => {
        try {
          return JSON.parse(h.careTips);
        } catch {
          return [h.careTips];
        }
      })(),
    }));

    res.status(200).json({ success: true, history: parsedHistory });
  } catch (error: any) {
    console.error('getMoodHistory error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve mood history.' });
  }
};

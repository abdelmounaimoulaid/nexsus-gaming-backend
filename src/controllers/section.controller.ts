import { Request, Response } from 'express';
import { SectionService } from '../services/section.service';

export class SectionController {
    static async getSections(req: Request, res: Response) {
        try {
            const sections = await SectionService.getSections();
            res.json(sections);
        } catch (error) {
            console.error('GET SECTIONS ERROR:', error);
            res.status(500).json({ message: 'Failed to fetch sections' });
        }
    }

    static async createSection(req: Request, res: Response) {
        try {
            const section = await SectionService.createSection(req.body);
            res.json(section);
        } catch (error) {
            res.status(400).json({ message: 'Failed to create section' });
        }
    }

    static async updateSection(req: Request, res: Response) {
        try {
            const section = await SectionService.updateSection(req.params.id as string, req.body);
            res.json(section);
        } catch (error) {
            res.status(400).json({ message: 'Failed to update section' });
        }
    }

    static async deleteSection(req: Request, res: Response) {
        try {
            await SectionService.deleteSection(req.params.id as string);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ message: 'Failed to delete section' });
        }
    }

    static async reorderSections(req: Request, res: Response) {
        try {
            const { orderedIds } = req.body;
            await SectionService.reorderSections(orderedIds);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ message: 'Failed to reorder sections' });
        }
    }
}

import { Request, Response } from 'express';
import { prisma } from '../index';

// Get all settings (Public format - object map)
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.systemSetting.findMany();

        // Convert array of {key, value} into a flat object for easier frontend consumption
        // e.g. { "phone": "+212 6...", "email": "contact@..." }
        const settingsMap: Record<string, string> = {};
        settings.forEach((setting: any) => {
            settingsMap[setting.key] = setting.value;
        });

        res.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Update or create multiple settings (Admin)
// Expects body: { phone: "value", email: "value", ... }
export const updateSettings = async (req: Request, res: Response) => {
    try {
        const data = req.body;

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid settings payload' });
        }

        // Process all settings inside a transaction
        await prisma.$transaction(
            Object.entries(data).map(([key, value]) => {
                return prisma.systemSetting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) },
                });
            })
        );

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

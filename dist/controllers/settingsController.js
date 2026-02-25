"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const index_1 = require("../index");
// Get all settings (Public format - object map)
const getSettings = async (req, res) => {
    try {
        const settings = await index_1.prisma.systemSetting.findMany();
        // Convert array of {key, value} into a flat object for easier frontend consumption
        // e.g. { "phone": "+212 6...", "email": "contact@..." }
        const settingsMap = {};
        settings.forEach((setting) => {
            settingsMap[setting.key] = setting.value;
        });
        res.json(settingsMap);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
// Update or create multiple settings (Admin)
// Expects body: { phone: "value", email: "value", ... }
const updateSettings = async (req, res) => {
    try {
        const data = req.body;
        if (!data || typeof data !== 'object') {
            return res.status(400).json({ error: 'Invalid settings payload' });
        }
        // Process all settings inside a transaction
        await index_1.prisma.$transaction(Object.entries(data).map(([key, value]) => {
            return index_1.prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            });
        }));
        res.json({ message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;

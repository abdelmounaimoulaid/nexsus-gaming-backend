"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionController = void 0;
const section_service_1 = require("../services/section.service");
class SectionController {
    static async getSections(req, res) {
        try {
            const sections = await section_service_1.SectionService.getSections();
            res.json(sections);
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to fetch sections' });
        }
    }
    static async createSection(req, res) {
        try {
            const section = await section_service_1.SectionService.createSection(req.body);
            res.json(section);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to create section' });
        }
    }
    static async updateSection(req, res) {
        try {
            const section = await section_service_1.SectionService.updateSection(req.params.id, req.body);
            res.json(section);
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to update section' });
        }
    }
    static async deleteSection(req, res) {
        try {
            await section_service_1.SectionService.deleteSection(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to delete section' });
        }
    }
    static async reorderSections(req, res) {
        try {
            const { orderedIds } = req.body;
            await section_service_1.SectionService.reorderSections(orderedIds);
            res.json({ success: true });
        }
        catch (error) {
            res.status(400).json({ message: 'Failed to reorder sections' });
        }
    }
}
exports.SectionController = SectionController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const index_1 = require("../index");
const exceljs_1 = __importDefault(require("exceljs"));
const sync_1 = require("csv-parse/sync");
class CollectionService {
    static async getCollections() {
        return await index_1.prisma.collection.findMany({
            orderBy: { name: 'asc' },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }
    static async getCollectionById(id) {
        return await index_1.prisma.collection.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }
    static async createCollection(data, userId) {
        const { name, nameFr, nameEn, slug, description, color, showInNavbar } = data;
        // Verify user exists before setting audit fields
        const userExists = userId ? await index_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        return await index_1.prisma.collection.create({
            data: {
                name, nameFr: nameFr || null, nameEn: nameEn || null, slug, description, color, showInNavbar: Boolean(showInNavbar),
                createdById: userExists ? userId : undefined,
                updatedById: userExists ? userId : undefined
            }
        });
    }
    static async updateCollection(id, data, userId) {
        const { name, nameFr, nameEn, slug, description, color, showInNavbar } = data;
        // Verify user exists before setting audit fields
        const userExists = userId ? await index_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        return await index_1.prisma.collection.update({
            where: { id },
            data: {
                name,
                nameFr: nameFr !== undefined ? (nameFr || null) : undefined,
                nameEn: nameEn !== undefined ? (nameEn || null) : undefined,
                slug, description, color,
                showInNavbar: showInNavbar !== undefined ? Boolean(showInNavbar) : undefined,
                updatedById: userExists ? userId : undefined
            }
        });
    }
    static async deleteCollection(id) {
        return await index_1.prisma.collection.delete({ where: { id } });
    }
    static async exportCollectionsToExcel() {
        const all = await index_1.prisma.collection.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'Nexus Gaming Admin';
        const sheet = workbook.addWorksheet('Collections');
        sheet.columns = [
            { header: 'name', key: 'name', width: 25 },
            { header: 'nameFr', key: 'nameFr', width: 25 },
            { header: 'nameEn', key: 'nameEn', width: 25 },
            { header: 'slug', key: 'slug', width: 30 },
            { header: 'description', key: 'description', width: 40 },
            { header: 'color', key: 'color', width: 15 },
            { header: 'showInNavbar', key: 'showInNavbar', width: 15 },
        ];
        sheet.getRow(1).eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FFFF6B35' }, size: 11 };
        });
        all.forEach((c) => {
            sheet.addRow({
                name: c.name,
                nameFr: c.nameFr ?? '',
                nameEn: c.nameEn ?? '',
                slug: c.slug,
                description: c.description ?? '',
                color: c.color ?? '',
                showInNavbar: c.showInNavbar ? 'true' : 'false',
            });
        });
        return workbook;
    }
    static async importCollections(file) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        let records = [];
        const results = { created: 0, updated: 0, errors: [] };
        if (ext === 'xlsx') {
            const workbook = new exceljs_1.default.Workbook();
            await workbook.xlsx.load(file.buffer);
            const sheet = workbook.worksheets[0];
            const headers = [];
            sheet.getRow(1).eachCell((cell, colNum) => {
                headers[colNum] = cell.value?.toString().trim() ?? '';
            });
            sheet.eachRow((row, rowNum) => {
                if (rowNum === 1)
                    return;
                const record = {};
                row.eachCell((cell, colNum) => {
                    const key = headers[colNum];
                    if (key)
                        record[key] = cell.value?.toString().trim() || '';
                });
                records.push(record);
            });
        }
        else {
            let csvContent = file.buffer.toString('utf-8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const firstLine = csvContent.split('\n')[0] ?? '';
            const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
            records = (0, sync_1.parse)(csvContent, { columns: true, skip_empty_lines: true, trim: true, delimiter, relax_column_count: true, bom: true });
        }
        for (const row of records) {
            if (!row.name || !row.slug) {
                results.errors.push(`Row skipped: missing 'name' or 'slug': ${row.name || '?'}`);
                continue;
            }
            const safeSlug = row.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            const data = {
                name: row.name,
                nameFr: row.nameFr || null,
                nameEn: row.nameEn || null,
                description: row.description || null,
                color: row.color || null,
                showInNavbar: String(row.showInNavbar).toLowerCase() === 'true'
            };
            try {
                const existing = await index_1.prisma.collection.findUnique({ where: { slug: safeSlug } });
                if (existing) {
                    await index_1.prisma.collection.update({ where: { id: existing.id }, data });
                    results.updated++;
                }
                else {
                    await index_1.prisma.collection.create({ data: { ...data, slug: safeSlug } });
                    results.created++;
                }
            }
            catch (dbErr) {
                results.errors.push(`DB Error on '${row.slug}': ${dbErr.message}`);
            }
        }
        return results;
    }
}
exports.CollectionService = CollectionService;

import { prisma } from '../index';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';

export class CollectionService {
    static async getCollections() {
        return await prisma.collection.findMany({
            orderBy: { name: 'asc' },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async getCollectionById(id: string) {
        return await prisma.collection.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async createCollection(data: any, userId: string) {
        const { name, nameFr, nameEn, slug, description, color, showInNavbar } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.collection.create({
            data: {
                name, nameFr: nameFr || null, nameEn: nameEn || null, slug, description, color, showInNavbar: Boolean(showInNavbar),
                createdById: userExists ? userId : undefined,
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async updateCollection(id: string, data: any, userId: string) {
        const { name, nameFr, nameEn, slug, description, color, showInNavbar } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.collection.update({
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

    static async deleteCollection(id: string) {
        return await prisma.collection.delete({ where: { id } });
    }

    static async exportCollectionsToExcel() {
        const all = await prisma.collection.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const workbook = new ExcelJS.Workbook();
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

        all.forEach((c: any) => {
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

    static async importCollections(file: Express.Multer.File) {
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        let records: any[] = [];
        const results = { created: 0, updated: 0, errors: [] as string[] };

        if (ext === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const sheet = workbook.worksheets[0];
            const headers: string[] = [];

            sheet.getRow(1).eachCell((cell, colNum) => {
                headers[colNum] = cell.value?.toString().trim() ?? '';
            });

            sheet.eachRow((row, rowNum) => {
                if (rowNum === 1) return;
                const record: any = {};
                row.eachCell((cell, colNum) => {
                    const key = headers[colNum];
                    if (key) record[key] = cell.value?.toString().trim() || '';
                });
                records.push(record);
            });
        } else {
            let csvContent = file.buffer.toString('utf-8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const firstLine = csvContent.split('\n')[0] ?? '';
            const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
            records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true, delimiter, relax_column_count: true, bom: true });
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
                const existing = await prisma.collection.findUnique({ where: { slug: safeSlug } });
                if (existing) {
                    await prisma.collection.update({ where: { id: existing.id }, data });
                    results.updated++;
                } else {
                    await prisma.collection.create({ data: { ...data, slug: safeSlug } });
                    results.created++;
                }
            } catch (dbErr: any) {
                results.errors.push(`DB Error on '${row.slug}': ${dbErr.message}`);
            }
        }

        return results;
    }
}

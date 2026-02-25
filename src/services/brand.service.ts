import { prisma } from '../index';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';

export class BrandService {
    static async getBrands() {
        return await prisma.brand.findMany({
            orderBy: { name: 'asc' },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async getBrandById(id: string) {
        return await prisma.brand.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async createBrand(data: any, userId: string) {
        const { name, slug, logo, description, website } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.brand.create({
            data: {
                name, slug, logo, description, website,
                createdById: userExists ? userId : undefined,
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async updateBrand(id: string, data: any, userId: string) {
        const { name, slug, logo, description, website } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.brand.update({
            where: { id },
            data: {
                name, slug, logo, description, website,
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async deleteBrand(id: string) {
        return await prisma.brand.delete({ where: { id } });
    }

    static async exportBrandsToExcel() {
        const all = await prisma.brand.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Nexus Gaming Admin';
        const sheet = workbook.addWorksheet('Brands');

        sheet.columns = [
            { header: 'name', key: 'name', width: 25 },
            { header: 'slug', key: 'slug', width: 30 },
            { header: 'logo', key: 'logo', width: 40 },
            { header: 'description', key: 'description', width: 40 },
            { header: 'website', key: 'website', width: 25 },
        ];

        sheet.getRow(1).eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FFFF6B35' }, size: 11 };
        });

        all.forEach((b: any) => {
            sheet.addRow({
                name: b.name,
                slug: b.slug,
                logo: b.logo ?? '',
                description: b.description ?? '',
                website: b.website ?? '',
            });
        });

        return workbook;
    }

    static async importBrands(file: Express.Multer.File) {
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
                logo: row.logo || null,
                description: row.description || null,
                website: row.website || null,
            };

            try {
                const existing = await prisma.brand.findUnique({ where: { slug: safeSlug } });
                if (existing) {
                    await prisma.brand.update({ where: { id: existing.id }, data });
                    results.updated++;
                } else {
                    await prisma.brand.create({ data: { ...data, slug: safeSlug } });
                    results.created++;
                }
            } catch (dbErr: any) {
                results.errors.push(`DB Error on '${row.slug}': ${dbErr.message}`);
            }
        }

        return results;
    }
}

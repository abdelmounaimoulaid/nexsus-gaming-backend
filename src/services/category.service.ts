import { prisma } from '../index';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';

export class CategoryService {
    static async getCategories(query: any) {
        if (query.tree === 'true') {
            const isAdmin = query.admin === 'true';

            return await prisma.category.findMany({
                where: isAdmin ? { parentId: null } : { visibility: true, parentId: null },
                orderBy: { sortOrder: 'asc' },
                include: {
                    subCategories: {
                        where: isAdmin ? undefined : { visibility: true },
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            subCategories: {
                                where: isAdmin ? undefined : { visibility: true },
                                orderBy: { sortOrder: 'asc' },
                                include: {
                                    createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                                    updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
                                }
                            },
                            createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                            updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
                        }
                    },
                    createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                    updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
                }
            });
        }

        return await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                subCategories: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        subCategories: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
                            }
                        },
                        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                        updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
                    }
                },
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async createCategory(data: any, userId: string) {
        const { name, nameFr, nameEn, slug, parentId, sortOrder, visibility, icon, metaTitle, metaDescription, metaKeywords } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.category.create({
            data: {
                name,
                nameFr: nameFr || null,
                nameEn: nameEn || null,
                slug,
                parentId: parentId || null,
                sortOrder: sortOrder || 0,
                visibility: visibility ?? true,
                icon: icon || null,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                metaKeywords: metaKeywords || null,
                createdById: userExists ? userId : undefined,
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async updateCategory(id: string, data: any, userId: string) {
        const {
            name, nameFr, nameEn, slug, icon, parentId, visibility,
            sortOrder, menuGroup, metaTitle, metaDescription, metaKeywords
        } = data;

        // Verify user exists before setting audit fields
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.category.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(nameFr !== undefined && { nameFr: nameFr || null }),
                ...(nameEn !== undefined && { nameEn: nameEn || null }),
                ...(slug !== undefined && { slug }),
                ...(icon !== undefined && { icon: icon || null }),
                ...(parentId !== undefined && { parentId: parentId || null }),
                ...(visibility !== undefined && { visibility }),
                ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
                menuGroup: menuGroup || null,
                ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
                ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
                ...(metaKeywords !== undefined && { metaKeywords: metaKeywords || null }),
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async deleteCategory(id: string) {
        return await prisma.category.delete({ where: { id } });
    }

    static async exportCategoriesToExcel() {
        const all = await prisma.category.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: { parent: { select: { slug: true } } }
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Nexus Gaming Admin';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Categories', {
            views: [{ state: 'frozen', ySplit: 1 }]
        });

        sheet.columns = [
            { header: 'name', key: 'name', width: 30 },
            { header: 'nameFr', key: 'nameFr', width: 30 },
            { header: 'nameEn', key: 'nameEn', width: 30 },
            { header: 'slug', key: 'slug', width: 30 },
            { header: 'parentSlug', key: 'parentSlug', width: 30 },
            { header: 'icon', key: 'icon', width: 16 },
            { header: 'visibility', key: 'visibility', width: 12 },
            { header: 'sortOrder', key: 'sortOrder', width: 12 },
            { header: 'metaTitle', key: 'metaTitle', width: 40 },
            { header: 'metaDescription', key: 'metaDescription', width: 60 },
            { header: 'metaKeywords', key: 'metaKeywords', width: 40 },
            { header: 'createdAt', key: 'createdAt', width: 22 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FFFF6B35' }, size: 11 };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FFFF6B35' } } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        headerRow.height = 22;

        all.forEach((cat: any, index: number) => {
            const row = sheet.addRow({
                name: cat.name,
                nameFr: cat.nameFr ?? '',
                nameEn: cat.nameEn ?? '',
                slug: cat.slug,
                parentSlug: cat.parent?.slug ?? '',
                icon: cat.icon ?? '',
                visibility: cat.visibility ? 'true' : 'false',
                sortOrder: cat.sortOrder,
                metaTitle: cat.metaTitle ?? '',
                metaDescription: cat.metaDescription ?? '',
                metaKeywords: cat.metaKeywords ?? '',
                createdAt: cat.createdAt.toISOString(),
            });
            if (index % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
                });
            }
        });

        return workbook;
    }

    static async importCategories(file: Express.Multer.File) {
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
            try {
                records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true, delimiter, relax_column_count: true, bom: true });
            } catch (parseError: any) {
                throw new Error(`Invalid CSV format. ${parseError.message}`);
            }
        }

        const slugToId = new Map<string, string>();
        const existing = await prisma.category.findMany({ select: { id: true, slug: true } });
        existing.forEach((e: any) => slugToId.set(e.slug, e.id));

        // Pass 1: Upsert
        for (const row of records) {
            if (!row.name || !row.slug) {
                results.errors.push(`Row skipped: missing required 'name' or 'slug'.`);
                continue;
            }

            const safeSlug = row.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            let upserted;
            try {
                if (slugToId.has(safeSlug)) {
                    upserted = await prisma.category.update({
                        where: { slug: safeSlug },
                        data: {
                            name: row.name,
                            nameFr: row.nameFr || null,
                            nameEn: row.nameEn || null,
                            icon: row.icon || null,
                            visibility: String(row.visibility ?? 'true').toLowerCase() !== 'false',
                            sortOrder: parseInt(row.sortOrder) || 0,
                            metaTitle: row.metaTitle || null,
                            metaDescription: row.metaDescription || null,
                            metaKeywords: row.metaKeywords || null,
                        }
                    });
                    results.updated++;
                } else {
                    upserted = await prisma.category.create({
                        data: {
                            name: row.name,
                            nameFr: row.nameFr || null,
                            nameEn: row.nameEn || null,
                            slug: safeSlug,
                            icon: row.icon || null,
                            visibility: row.visibility?.toLowerCase() !== 'false',
                            sortOrder: parseInt(row.sortOrder) || 0,
                            metaTitle: row.metaTitle || null,
                            metaDescription: row.metaDescription || null,
                            metaKeywords: row.metaKeywords || null,
                        }
                    });
                    results.created++;
                }
                slugToId.set(safeSlug, upserted.id);
            } catch (e: any) {
                results.errors.push(`Error on slug '${safeSlug}': ${e.message}`);
            }
        }

        // Pass 2: Set parents
        for (const row of records) {
            if (!row.slug || !row.parentSlug) continue;

            const slug = row.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            const parentSlug = row.parentSlug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            const childId = slugToId.get(slug);
            const parentId = slugToId.get(parentSlug);

            if (!childId || !parentId) {
                results.errors.push(`Could not link '${slug}' to parent '${parentSlug}'`);
                continue;
            }

            try {
                await prisma.category.update({ where: { id: childId }, data: { parentId } });
            } catch (e: any) {
                results.errors.push(`Error linking parent for '${slug}': ${e.message}`);
            }
        }

        return results;
    }
}

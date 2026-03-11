import { prisma } from '../index';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';

export class CategoryService {
    static async getCategories(query: any) {
        const selectFields: any = {
            id: true,
            name: true,
            nameFr: true,
            nameEn: true,
            slug: true,
            icon: true,
            specSchema: true,
            visibility: true,
            sortOrder: true,
            parentId: true,
        };

        const subCategorySelect = {
            select: {
                ...selectFields,
                menuGroup: true, // Needed for Level 2 grouping
                subCategories: {
                    select: selectFields,
                    orderBy: { sortOrder: 'asc' as const }
                }
            },
            orderBy: { sortOrder: 'asc' as const }
        };

        if (query.tree === 'true') {
            const isAdmin = query.admin === 'true';
            return await prisma.category.findMany({
                where: isAdmin ? { parentId: null } : { visibility: true, parentId: null },
                orderBy: { sortOrder: 'asc' },
                select: {
                    ...selectFields,
                    subCategories: {
                        ...subCategorySelect,
                        where: isAdmin ? undefined : { visibility: true },
                        select: {
                            ...subCategorySelect.select,
                            subCategories: {
                                ...subCategorySelect.select.subCategories,
                                where: isAdmin ? undefined : { visibility: true }
                            }
                        }
                    }
                }
            });
        }

        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search } },
                { slug: { contains: query.search } }
            ];
        }

        // Check if pagination is completely disabled (for dropdowns etc)
        if (query.noPagination === 'true') {
            const allCategories = await prisma.category.findMany({
                where,
                orderBy: { sortOrder: 'asc' },
                select: { ...selectFields, subCategories: subCategorySelect }
            });
            return {
                data: allCategories,
                meta: { total: allCategories.length, page: 1, limit: allCategories.length, totalPages: 1 }
            };
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { sortOrder: 'asc' },
                select: {
                    ...selectFields,
                    subCategories: subCategorySelect
                }
            }),
            prisma.category.count({ where })
        ]);

        return {
            data: categories,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async createCategory(data: any, userId: string) {
        const { name, nameFr, nameEn, slug, parentId, sortOrder, visibility, icon, specSchema, metaTitle, metaDescription, metaKeywords } = data;

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
                specSchema: specSchema || null,
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
            name, nameFr, nameEn, slug, icon, specSchema, parentId, visibility,
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
                ...(specSchema !== undefined && { specSchema: specSchema || null }),
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
        // Find all subcategories recursively to delete their products and then the categories themselves
        const getDescendantIds = async (parentId: string): Promise<string[]> => {
            const children = await prisma.category.findMany({ where: { parentId }, select: { id: true } });
            let ids = children.map(c => c.id);
            for (const childId of ids) {
                const descendantIds = await getDescendantIds(childId);
                ids = [...ids, ...descendantIds];
            }
            return ids;
        };

        const allCategoryIdsToDelete = [id, ...(await getDescendantIds(id))];

        // 1. Delete all products belonging to this category or any of its subcategories
        await prisma.product.deleteMany({
            where: { categoryId: { in: allCategoryIdsToDelete } }
        });

        // 2. Delete the categories themselves (bottom-up to avoid foreign key errors)
        // Since we mapped descendants, we can just deleteMany with IN. Prisma handles the order or we can just delete where ID in array. 
        // Actually, prisma deleteMany on self-referential tables can sometimes complain, 
        // so we delete them one by one starting from the deepest, but deleting products first ensures no products block them.
        // We'll just delete them all. First we have to disconnect parents or delete bottom-up.

        // Easiest is to delete in reverse order of discovery (which usually puts children after parents, so reverse = children first).
        for (const catId of allCategoryIdsToDelete.reverse()) {
            await prisma.category.delete({ where: { id: catId } }).catch(() => { });
        }

        return { success: true };
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

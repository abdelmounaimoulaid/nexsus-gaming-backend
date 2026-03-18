import { prisma } from '../index';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

export class ProductService {
    static async getProducts(query: any) {
        const { categoryId, featured, status, page = '1', limit = '24', search, brands, collections, minPrice, maxPrice, availability, sortBy, ids } = query;
        const pageNumber = parseInt(String(page), 10) || 1;
        const limitNumber = parseInt(String(limit), 10) || 24;
        const skip = (pageNumber - 1) * limitNumber;

        const where: any = {};

        if (ids) {
            const idList = String(ids).split(',').map(id => id.trim());
            where.id = { in: idList };
        }

        // Category filtering (including sub-tree for each ID or slug)
        if (categoryId) {
            const idList = String(categoryId).split(',').map(id => id.trim());

            if (idList.includes('UNCATEGORIZED')) {
                where.categoryId = null;
            } else {
                const allCats = await prisma.category.findMany();
                const validCategoryIds: Set<string> = new Set();

                const findDescendants = (parentId: string) => {
                    const toddlers = allCats.filter(c => c.parentId === parentId);
                    toddlers.forEach(s => {
                        validCategoryIds.add(s.id);
                        findDescendants(s.id);
                    });
                };

                idList.forEach(rawId => {
                    // Resolve slug to real ID if needed
                    const cat = allCats.find(c => c.id === rawId || c.slug === rawId);
                    const resolvedId = cat ? cat.id : rawId;
                    validCategoryIds.add(resolvedId);
                    findDescendants(resolvedId);
                });

                where.categoryId = { in: Array.from(validCategoryIds) };
            }
        }

        if (featured === 'true') where.isFeatured = true;
        if (status) where.status = String(status).toUpperCase();

        if (brands) {
            const brandList = String(brands).split(',').map(b => b.trim());
            where.brand = { in: brandList };
        }

        if (collections) {
            const collectionList = String(collections).split(',').map(c => c.trim());
            where.collections = {
                some: {
                    OR: [
                        { id: { in: collectionList } },
                        { slug: { in: collectionList } }
                    ]
                }
            };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(String(minPrice));
            if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
        }

        if (availability === 'in-stock') {
            where.stock = { gt: 0 };
        } else if (availability === 'out-of-stock') {
            where.stock = { lte: 0 };
        }

        if (search) {
            const searchStr = String(search);
            where.OR = [
                { name: { contains: searchStr } },
                { description: { contains: searchStr } },
                { brand: { contains: searchStr } }
            ];
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'price-asc') orderBy = { price: 'asc' };
        else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
        else if (sortBy === 'rating') orderBy = { rating: 'desc' };

        const total = await prisma.product.count({ where });

        const products = await prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                brand: true,
                stock: true,
                status: true,
                badge: true,
                isFeatured: true,
                categoryId: true,
                category: {
                    select: { id: true, name: true, slug: true }
                },
                images: {
                    take: 1,
                    select: { id: true, url: true }
                },
                collections: {
                    select: { id: true, name: true, slug: true, color: true }
                }
            },
            orderBy,
            skip,
            take: limitNumber
        });

        return {
            data: products,
            meta: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        };
    }

    static async getProductById(id: string) {
        return await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: true,
                collections: true,
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            }
        });
    }

    static async createProduct(data: any, userId: string) {
        const { name, slug, description, longDescription, price, originalPrice, categoryId, brand, stock, status, badge, isFeatured, specs, images, collectionIds, variations } = data;

        return await prisma.product.create({
            data: {
                name, slug, description, longDescription, price, originalPrice, categoryId, brand, stock, status, badge, isFeatured, specs,
                variations: variations || [],
                images: {
                    create: images?.map((url: string) => ({ url })) || []
                },
                collections: {
                    connect: collectionIds?.map((id: string) => ({ id })) || []
                },
                createdById: userId,
                updatedById: userId
            },
            include: { images: true, collections: true }
        });
    }

    static async updateProduct(id: string, data: any, userId: string) {
        const { images, collectionIds, ...restData } = data;

        // Verify user exists before setting audit fields to avoid foreign key violations (e.g. after reseed)
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        const updateData: any = {
            ...restData,
            updatedById: userExists ? userId : undefined
        };
        if (collectionIds) {
            updateData.collections = { set: collectionIds.map((colId: string) => ({ id: colId })) };
        }
        if (images) {
            updateData.images = {
                deleteMany: {},
                create: images.map((url: string) => ({ url }))
            };
        }

        return await prisma.product.update({
            where: { id },
            data: updateData,
            include: { images: true, collections: true }
        });
    }

    static async bulkDeleteProducts(ids: string[]) {
        return await prisma.product.deleteMany({ where: { id: { in: ids } } });
    }

    static async bulkOutOfStockProducts(ids: string[], userId?: string) {
        // Verify user exists before setting audit fields to avoid foreign key violations
        const userExists = userId ? await (prisma as any).user.findUnique({ where: { id: userId } }) : null;

        return await prisma.product.updateMany({ 
            where: { id: { in: ids } },
            data: { 
                stock: 0,
                status: 'OUT_OF_STOCK',
                updatedById: userExists ? userId : undefined
            }
        });
    }

    static async deleteProduct(id: string) {
        return await prisma.product.delete({ where: { id } });
    }

    static async exportProductsToExcel() {
        const all = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                category: {
                    select: {
                        name: true,
                        parent: {
                            select: {
                                name: true,
                                parent: { select: { name: true } }
                            }
                        }
                    }
                },
                images: true,
                collections: { select: { name: true } }
            }
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Nexus Gaming Admin';
        const sheet = workbook.addWorksheet('Products', { views: [{ state: 'frozen', ySplit: 1 }] });

        sheet.columns = [
            { header: 'name', key: 'name', width: 35 },
            { header: 'slug', key: 'slug', width: 35 },
            { header: 'brand', key: 'brand', width: 20 },
            { header: 'category_l1', key: 'category_l1', width: 20 },
            { header: 'category_l2', key: 'category_l2', width: 20 },
            { header: 'category_l3', key: 'category_l3', width: 20 },
            { header: 'price', key: 'price', width: 12 },
            { header: 'originalPrice', key: 'originalPrice', width: 14 },
            { header: 'stock', key: 'stock', width: 10 },
            { header: 'status', key: 'status', width: 14 },
            { header: 'isFeatured', key: 'isFeatured', width: 12 },
            { header: 'specs', key: 'specs', width: 40 },
            { header: 'images', key: 'images', width: 50 },
            { header: 'description', key: 'description', width: 50 },
            { header: 'longDescription', key: 'longDescription', width: 60 },
            { header: 'metaTitle', key: 'metaTitle', width: 40 },
            { header: 'metaDescription', key: 'metaDescription', width: 60 },
            { header: 'metaKeywords', key: 'metaKeywords', width: 40 },
            { header: 'createdAt', key: 'createdAt', width: 22 },
        ];

        sheet.getRow(1).eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FFFF6B35' }, size: 11 };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FFFF6B35' } } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        sheet.getRow(1).height = 22;

        all.forEach((p: any, index: number) => {
            let l1 = '', l2 = '', l3 = '';
            if (p.category) {
                if (!p.category.parent) l1 = p.category.slug;
                else if (p.category.parent && !p.category.parent.parent) {
                    l1 = p.category.parent.slug; l2 = p.category.slug;
                }
                else if (p.category.parent?.parent) {
                    l1 = p.category.parent.parent.slug; l2 = p.category.parent.slug; l3 = p.category.slug;
                }
            }

            let imgToEmbed = '';
            if (p.images && p.images.length > 0) {
                const url = p.images[0].url;
                if (url.startsWith('/uploads/')) {
                    const localPath = path.join(process.cwd(), 'uploads', path.basename(url));
                    if (fs.existsSync(localPath)) imgToEmbed = localPath;
                }
            }

            const row = sheet.addRow({
                name: p.name, slug: p.slug, brand: p.brand ?? '',
                category_l1: l1, category_l2: l2, category_l3: l3,
                price: p.price, originalPrice: p.originalPrice ?? '', stock: p.stock,
                status: p.status, collections: p.collections?.map((c: any) => c.name).join(', ') ?? '',
                isFeatured: p.isFeatured ? 'true' : 'false',
                specs: typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs ?? {}),
                images: imgToEmbed ? '' : (p.images?.map((img: any) => img.url).join(',') ?? ''),
                description: p.description ?? '',
                longDescription: p.longDescription ?? '',
                metaTitle: p.metaTitle ?? '',
                metaDescription: p.metaDescription ?? '', metaKeywords: p.metaKeywords ?? '',
                createdAt: p.createdAt.toISOString(),
            });

            if (imgToEmbed) {
                try {
                    const extMatch = imgToEmbed.match(/\.(png|jpg|jpeg|gif)$/i);
                    const ext = extMatch ? (extMatch[1].toLowerCase() === 'jpg' ? 'jpeg' : extMatch[1].toLowerCase()) : 'png';
                    const imageId = workbook.addImage({ filename: imgToEmbed, extension: ext as 'jpeg' | 'png' | 'gif' });
                    row.height = 45;
                    sheet.addImage(imageId, { tl: { col: 12.1, row: index + 1.1 }, ext: { width: 45, height: 45 } });
                } catch (e) { console.error('Error embedding image', e); }
            }

            if (index % 2 === 0) {
                row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; });
            }
        });

        return workbook;
    }

    static async exportImportTemplateToExcel() {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Nexus Gaming Admin';

        // 1. Products Template Sheet
        const sheet = workbook.addWorksheet('Products Template', { views: [{ state: 'frozen', ySplit: 1 }] });
        sheet.columns = [
            { header: 'name', key: 'name', width: 35 },
            { header: 'slug', key: 'slug', width: 35 },
            { header: 'brand', key: 'brand', width: 20 },
            { header: 'category_l1 (slug)', key: 'category_l1', width: 25 },
            { header: 'category_l2 (slug)', key: 'category_l2', width: 25 },
            { header: 'category_l3 (slug)', key: 'category_l3', width: 25 },
            { header: 'price', key: 'price', width: 12 },
            { header: 'originalPrice', key: 'originalPrice', width: 14 },
            { header: 'stock', key: 'stock', width: 10 },
            { header: 'status', key: 'status', width: 14 },
            { header: 'isFeatured', key: 'isFeatured', width: 12 },
            { header: 'collections', key: 'collections', width: 30 },
            { header: 'specs', key: 'specs', width: 40 },
            { header: 'images', key: 'images', width: 50 },
            { header: 'description', key: 'description', width: 50 },
            { header: 'longDescription', key: 'longDescription', width: 60 },
            { header: 'metaTitle', key: 'metaTitle', width: 40 },
            { header: 'metaDescription', key: 'metaDescription', width: 60 },
            { header: 'metaKeywords', key: 'metaKeywords', width: 40 }
        ];

        sheet.getRow(1).eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FFFF6B35' }, size: 11 };
            cell.border = { bottom: { style: 'medium', color: { argb: 'FFFF6B35' } } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        sheet.getRow(1).height = 22;

        sheet.addRow({
            name: 'Example Product', slug: 'example-product-123', brand: 'Example Brand',
            category_l1: 'pc-components', category_l2: 'processors', category_l3: 'intel',
            price: '199.99', originalPrice: '249.99', stock: '10',
            status: 'ACTIVE', isFeatured: 'true', collections: 'Summer Sale, New Arrivals',
            specs: '{"Color":"Black","Weight":"1kg"}', images: 'https://example.com/img1.png, https://example.com/img2.png',
            description: 'Short description', longDescription: 'Long HTML description',
            metaTitle: 'Example Title', metaDescription: 'Example Description', metaKeywords: 'Example, Keywords'
        });

        const allCats = await prisma.category.findMany({ include: { parent: { include: { parent: true } } } });
        const allBrands = await prisma.brand.findMany({ select: { name: true } });
        const allCollections = await prisma.collection.findMany({ select: { name: true } });

        // 2. Categories Reference Sheet
        const catSheet = workbook.addWorksheet('Categories Reference');
        catSheet.columns = [
            { header: 'Valid Category L1', key: 'l1', width: 25 },
            { header: 'Valid Category L2', key: 'l2', width: 25 },
            { header: 'Valid Category L3', key: 'l3', width: 25 }
        ];
        catSheet.getRow(1).font = { bold: true };

        allCats.forEach(c => {
            let l1 = '', l2 = '', l3 = '';
            if (!c.parentId) l1 = c.slug;
            else if (c.parent && !c.parent.parentId) { l1 = c.parent.slug; l2 = c.slug; }
            else if (c.parent?.parent) { l1 = c.parent.parent.slug; l2 = c.parent.slug; l3 = c.slug; }
            catSheet.addRow({ l1, l2, l3 });
        });

        // 3. Brands Reference Sheet
        const brandSheet = workbook.addWorksheet('Brands Reference');
        brandSheet.columns = [{ header: 'Valid Brand Names', key: 'name', width: 30 }];
        brandSheet.getRow(1).font = { bold: true };
        allBrands.forEach(b => brandSheet.addRow({ name: b.name }));

        // 4. Collections Reference Sheet
        const collSheet = workbook.addWorksheet('Collections Reference');
        collSheet.columns = [{ header: 'Valid Collection Names (comma separated)', key: 'name', width: 40 }];
        collSheet.getRow(1).font = { bold: true };
        allCollections.forEach(c => collSheet.addRow({ name: c.name }));

        return workbook;
    }

    static async importProducts(file: Express.Multer.File, onProgress?: (current: number, total: number, results: any) => void) {
        const filename = file.originalname.toLowerCase();
        let records: any[] = [];
        const results = { created: 0, updated: 0, errors: [] as string[] };

        if (filename.endsWith('.xlsx')) {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const sheet = workbook.worksheets[0];
            if (!sheet) throw new Error('No sheets found in Excel file');

            const headers: string[] = [];
            sheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber] = cell.value?.toString().trim() || '';
            });

            const rowImages = new Map<number, string[]>();
            if (sheet.getImages) {
                for (const img of sheet.getImages()) {
                    try {
                        const rowIdx = Math.floor(img.range.tl.row);
                        const colIdx = Math.floor(img.range.tl.col);
                        const headerName = headers[colIdx + 1];

                        if (headerName === 'images' || colIdx >= 0) {
                            const imageObj = workbook.getImage(img.imageId as any);
                            if (imageObj && imageObj.buffer) {
                                const ext = imageObj.extension || 'png';
                                const newFilename = `excel-import-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
                                const uploadDir = path.join(process.cwd(), 'uploads');
                                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                                fs.writeFileSync(path.join(uploadDir, newFilename), Buffer.from(imageObj.buffer as any));
                                const url = `/uploads/${newFilename}`;
                                if (!rowImages.has(rowIdx)) rowImages.set(rowIdx, []);
                                rowImages.get(rowIdx)!.push(url);
                            }
                        }
                    } catch (e) { console.error('Error extracting embedded image from Excel:', e); }
                }
            }

            sheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const record: any = {};
                row.eachCell((cell, colNumber) => {
                    const key = headers[colNumber];
                    if (key) record[key] = cell.value?.toString().trim() || '';
                });
                const mappedImages = rowImages.get(rowNumber - 1);
                if (mappedImages && mappedImages.length > 0) record._embeddedImages = mappedImages;
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

        const allCats = await prisma.category.findMany();
        const allCollections = await prisma.collection.findMany();

        const totalItems = records.length;
        let currentItem = 0;

        for (const row of records) {
            currentItem++;
            if (!row.name) {
                results.errors.push(`Row skipped: missing required 'name'. Row data: ${JSON.stringify(row)}`);
                continue;
            }

            if (!row.slug) {
                row.slug = row.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            }

            const safeSlug = row.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            let categoryId: string | null = null;
            let parentId: string | null = null;
            let foundNode: any = null;

            if (row['category_l1 (slug)'] || row.category_l1) {
                const query1 = (row['category_l1 (slug)'] || row.category_l1).trim().toLowerCase();
                foundNode = allCats.find((c: any) => (c.slug.trim().toLowerCase() === query1 || c.name.trim().toLowerCase() === query1) && !c.parentId);
                if (foundNode) parentId = foundNode.id;
            }
            if ((row['category_l2 (slug)'] || row.category_l2) && parentId) {
                const query2 = (row['category_l2 (slug)'] || row.category_l2).trim().toLowerCase();
                let sub = allCats.find((c: any) => (c.slug.trim().toLowerCase() === query2 || c.name.trim().toLowerCase() === query2) && c.parentId === parentId);
                if (sub) { foundNode = sub; parentId = sub.id; }
            }
            if ((row['category_l3 (slug)'] || row.category_l3) && parentId) {
                const query3 = (row['category_l3 (slug)'] || row.category_l3).trim().toLowerCase();
                let subsub = allCats.find((c: any) => (c.slug.trim().toLowerCase() === query3 || c.name.trim().toLowerCase() === query3) && c.parentId === parentId);
                if (subsub) foundNode = subsub;
            }

            // Fallback: If strict hierarchy fails, just try to find ANY category matching the deepest provided slug/name
            if (!foundNode) {
                const queryAny = (row['category_l3 (slug)'] || row.category_l3 || row['category_l2 (slug)'] || row.category_l2 || row['category_l1 (slug)'] || row.category_l1 || '').trim().toLowerCase();
                if (queryAny && queryAny !== 'uncategorized') {
                    foundNode = allCats.find((c: any) => c.slug.trim().toLowerCase() === queryAny || c.name.trim().toLowerCase() === queryAny);
                }
            }

            categoryId = foundNode?.id || null;

            let collectionConnections: { id: string }[] = [];
            if (row.collections) {
                const collectionNames = row.collections.split(',').map((name: string) => name.trim().toLowerCase()).filter(Boolean);
                const matchedCollections = allCollections.filter((c: any) => collectionNames.includes(c.name.toLowerCase()));
                collectionConnections = matchedCollections.map((c: any) => ({ id: c.id }));
            }

            const data: any = {
                name: row.name,
                brand: row.brand || '',
                categoryId: categoryId as string | null,
                price: parseFloat(row.price?.toString().replace(/[^0-9.]/g, '')) || 0,
                originalPrice: row.originalPrice ? parseFloat(row.originalPrice?.toString().replace(/[^0-9.]/g, '')) : null,
                stock: parseInt(row.stock) || 1,
                status: (row.status || 'ACTIVE') as any,
                isFeatured: String(row.isFeatured).toLowerCase() === 'true',
                specs: typeof row.specs === 'string' ? row.specs : JSON.stringify(row.specs || {}),
                description: row.description || '',
                longDescription: row.longDescription || '',
                metaTitle: row.metaTitle || null,
                metaDescription: row.metaDescription || null,
                metaKeywords: row.metaKeywords || null,
            };

            try {
                let parsedImages: { url: string }[] = [];
                const allImageUrls = new Set<string>();

                if (row.images) {
                    row.images.split(',').forEach((url: string) => {
                        if (url.trim()) allImageUrls.add(url.trim());
                    });
                }

                if (row._embeddedImages && row._embeddedImages.length > 0) {
                    row._embeddedImages.forEach((url: string) => allImageUrls.add(url));
                }

                parsedImages = Array.from(allImageUrls).map(url => ({ url }));

                const existing = await prisma.product.findUnique({ where: { slug: safeSlug }, include: { collections: true } });

                if (existing) {
                    const existingCollectionIds = existing.collections.map((c: any) => c.id);
                    const newCollectionIds = collectionConnections.map((c: any) => c.id);
                    const columnsToDisconnect = existingCollectionIds.filter((id: string) => !newCollectionIds.includes(id)).map((id: string) => ({ id }));

                    const { categoryId: rawCategoryId, ...restData } = data;
                    await prisma.product.update({
                        where: { id: existing.id },
                        data: {
                            ...restData,
                            categoryId: rawCategoryId,
                            ...(parsedImages.length > 0 ? { images: { deleteMany: {}, create: parsedImages } } : {}),
                            collections: {
                                ...(columnsToDisconnect.length > 0 ? { disconnect: columnsToDisconnect } : {}),
                                ...(collectionConnections.length > 0 ? { connect: collectionConnections } : {})
                            }
                        }
                    });
                    results.updated++;
                } else {
                    const { categoryId: rawCategoryId, ...restData } = data;
                    await prisma.product.create({
                        data: {
                            ...restData,
                            categoryId: rawCategoryId,
                            slug: safeSlug,
                            variations: [],
                            ...(parsedImages.length > 0 ? { images: { create: parsedImages } } : {}),
                            ...(collectionConnections.length > 0 ? { collections: { connect: collectionConnections } } : {})
                        }
                    });
                    results.created++;
                }
            } catch (rowError: any) {
                results.errors.push(`Failed to import product '${row.slug}': ${rowError.message}`);
            }

            if (onProgress) {
                onProgress(currentItem, totalItems, results);
            }
        }

        return results;
    }
}

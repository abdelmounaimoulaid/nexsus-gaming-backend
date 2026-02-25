"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const index_1 = require("../index");
const exceljs_1 = __importDefault(require("exceljs"));
const sync_1 = require("csv-parse/sync");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ProductService {
    static async getProducts(query) {
        const { categoryId, featured, status, page = '1', limit = '10', search } = query;
        const pageNumber = parseInt(String(page), 10) || 1;
        const limitNumber = parseInt(String(limit), 10) || 10;
        const skip = (pageNumber - 1) * limitNumber;
        const where = {};
        if (categoryId)
            where.categoryId = String(categoryId);
        if (featured === 'true')
            where.isFeatured = true;
        if (status)
            where.status = String(status).toUpperCase();
        if (search) {
            const searchStr = String(search);
            where.OR = [
                { name: { contains: searchStr } },
                { description: { contains: searchStr } }
            ];
        }
        const total = await index_1.prisma.product.count({ where });
        const products = await index_1.prisma.product.findMany({
            where,
            include: {
                category: true,
                images: true,
                collections: true,
                createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
                updatedBy: { select: { id: true, email: true, firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' },
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
    static async getProductById(id) {
        return await index_1.prisma.product.findUnique({
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
    static async createProduct(data, userId) {
        const { name, slug, description, price, originalPrice, categoryId, brand, stock, status, badge, isFeatured, specs, images, collectionIds } = data;
        return await index_1.prisma.product.create({
            data: {
                name, slug, description, price, originalPrice, categoryId, brand, stock, status, badge, isFeatured, specs,
                images: {
                    create: images?.map((url) => ({ url })) || []
                },
                collections: {
                    connect: collectionIds?.map((id) => ({ id })) || []
                },
                createdById: userId,
                updatedById: userId
            },
            include: { images: true, collections: true }
        });
    }
    static async updateProduct(id, data, userId) {
        const { images, collectionIds, ...restData } = data;
        // Verify user exists before setting audit fields to avoid foreign key violations (e.g. after reseed)
        const userExists = userId ? await index_1.prisma.user.findUnique({ where: { id: userId } }) : null;
        const updateData = {
            ...restData,
            updatedById: userExists ? userId : undefined
        };
        if (collectionIds) {
            updateData.collections = { set: collectionIds.map((colId) => ({ id: colId })) };
        }
        if (images) {
            updateData.images = {
                deleteMany: {},
                create: images.map((url) => ({ url }))
            };
        }
        return await index_1.prisma.product.update({
            where: { id },
            data: updateData,
            include: { images: true, collections: true }
        });
    }
    static async bulkDeleteProducts(ids) {
        return await index_1.prisma.product.deleteMany({ where: { id: { in: ids } } });
    }
    static async deleteProduct(id) {
        return await index_1.prisma.product.delete({ where: { id } });
    }
    static async exportProductsToExcel() {
        const all = await index_1.prisma.product.findMany({
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
        const workbook = new exceljs_1.default.Workbook();
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
        all.forEach((p, index) => {
            let l1 = '', l2 = '', l3 = '';
            if (p.category) {
                if (!p.category.parent)
                    l1 = p.category.name;
                else if (p.category.parent && !p.category.parent.parent) {
                    l1 = p.category.parent.name;
                    l2 = p.category.name;
                }
                else if (p.category.parent?.parent) {
                    l1 = p.category.parent.parent.name;
                    l2 = p.category.parent.name;
                    l3 = p.category.name;
                }
            }
            let imgToEmbed = '';
            if (p.images && p.images.length > 0) {
                const url = p.images[0].url;
                if (url.startsWith('/uploads/')) {
                    const localPath = path_1.default.join(process.cwd(), 'uploads', path_1.default.basename(url));
                    if (fs_1.default.existsSync(localPath))
                        imgToEmbed = localPath;
                }
            }
            const row = sheet.addRow({
                name: p.name, slug: p.slug, brand: p.brand ?? '',
                category_l1: l1, category_l2: l2, category_l3: l3,
                price: p.price, originalPrice: p.originalPrice ?? '', stock: p.stock,
                status: p.status, collections: p.collections?.map((c) => c.name).join(', ') ?? '',
                isFeatured: p.isFeatured ? 'true' : 'false',
                specs: typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs ?? {}),
                images: imgToEmbed ? '' : (p.images?.map((img) => img.url).join(',') ?? ''),
                description: p.description ?? '', metaTitle: p.metaTitle ?? '',
                metaDescription: p.metaDescription ?? '', metaKeywords: p.metaKeywords ?? '',
                createdAt: p.createdAt.toISOString(),
            });
            if (imgToEmbed) {
                try {
                    const extMatch = imgToEmbed.match(/\.(png|jpg|jpeg|gif)$/i);
                    const ext = extMatch ? (extMatch[1].toLowerCase() === 'jpg' ? 'jpeg' : extMatch[1].toLowerCase()) : 'png';
                    const imageId = workbook.addImage({ filename: imgToEmbed, extension: ext });
                    row.height = 45;
                    sheet.addImage(imageId, { tl: { col: 12.1, row: index + 1.1 }, ext: { width: 45, height: 45 } });
                }
                catch (e) {
                    console.error('Error embedding image', e);
                }
            }
            if (index % 2 === 0) {
                row.eachCell((cell) => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; });
            }
        });
        return workbook;
    }
    static async importProducts(file) {
        const filename = file.originalname.toLowerCase();
        let records = [];
        const results = { created: 0, updated: 0, errors: [] };
        if (filename.endsWith('.xlsx')) {
            const workbook = new exceljs_1.default.Workbook();
            await workbook.xlsx.load(file.buffer);
            const sheet = workbook.worksheets[0];
            if (!sheet)
                throw new Error('No sheets found in Excel file');
            const headers = [];
            sheet.getRow(1).eachCell((cell, colNumber) => {
                headers[colNumber] = cell.value?.toString().trim() || '';
            });
            const rowImages = new Map();
            if (sheet.getImages) {
                for (const img of sheet.getImages()) {
                    try {
                        const rowIdx = Math.floor(img.range.tl.row);
                        const colIdx = Math.floor(img.range.tl.col);
                        const headerName = headers[colIdx + 1];
                        if (headerName === 'images' || colIdx >= 0) {
                            const imageObj = workbook.getImage(img.imageId);
                            if (imageObj && imageObj.buffer) {
                                const ext = imageObj.extension || 'png';
                                const newFilename = `excel-import-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
                                const uploadDir = path_1.default.join(process.cwd(), 'uploads');
                                if (!fs_1.default.existsSync(uploadDir))
                                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                                fs_1.default.writeFileSync(path_1.default.join(uploadDir, newFilename), Buffer.from(imageObj.buffer));
                                const url = `/uploads/${newFilename}`;
                                if (!rowImages.has(rowIdx))
                                    rowImages.set(rowIdx, []);
                                rowImages.get(rowIdx).push(url);
                            }
                        }
                    }
                    catch (e) {
                        console.error('Error extracting embedded image from Excel:', e);
                    }
                }
            }
            sheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1)
                    return;
                const record = {};
                row.eachCell((cell, colNumber) => {
                    const key = headers[colNumber];
                    if (key)
                        record[key] = cell.value?.toString().trim() || '';
                });
                const mappedImages = rowImages.get(rowNumber - 1);
                if (mappedImages && mappedImages.length > 0)
                    record._embeddedImages = mappedImages;
                records.push(record);
            });
        }
        else {
            let csvContent = file.buffer.toString('utf-8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const firstLine = csvContent.split('\n')[0] ?? '';
            const delimiter = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
            try {
                records = (0, sync_1.parse)(csvContent, { columns: true, skip_empty_lines: true, trim: true, delimiter, relax_column_count: true, bom: true });
            }
            catch (parseError) {
                throw new Error(`Invalid CSV format. ${parseError.message}`);
            }
        }
        const allCats = await index_1.prisma.category.findMany();
        const allCollections = await index_1.prisma.collection.findMany();
        for (const row of records) {
            if (!row.name || !row.slug) {
                results.errors.push(`Row skipped: missing required 'name' or 'slug'. Row data: ${JSON.stringify(row)}`);
                continue;
            }
            const safeSlug = row.slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
            let categoryId = null;
            let parentId = null;
            let foundNode = null;
            if (row.category_l1) {
                foundNode = allCats.find((c) => c.name.toLowerCase() === row.category_l1.toLowerCase() && !c.parentId);
                if (foundNode)
                    parentId = foundNode.id;
            }
            if (row.category_l2 && parentId) {
                let sub = allCats.find((c) => c.name.toLowerCase() === row.category_l2.toLowerCase() && c.parentId === parentId);
                if (sub) {
                    foundNode = sub;
                    parentId = sub.id;
                }
            }
            if (row.category_l3 && parentId) {
                let subsub = allCats.find((c) => c.name.toLowerCase() === row.category_l3.toLowerCase() && c.parentId === parentId);
                if (subsub)
                    foundNode = subsub;
            }
            categoryId = foundNode?.id;
            let collectionConnections = [];
            if (row.collections) {
                const collectionNames = row.collections.split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
                const matchedCollections = allCollections.filter((c) => collectionNames.includes(c.name.toLowerCase()));
                collectionConnections = matchedCollections.map((c) => ({ id: c.id }));
            }
            if (!categoryId) {
                results.errors.push(`Row skipped: could not resolve valid category matching hierarchy for '${row.slug}'.`);
                continue;
            }
            const data = {
                name: row.name,
                brand: row.brand || '',
                categoryId: categoryId,
                price: parseFloat(row.price) || 0,
                originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : null,
                stock: parseInt(row.stock) || 1,
                status: (row.status || 'ACTIVE'),
                isFeatured: String(row.isFeatured).toLowerCase() === 'true',
                specs: typeof row.specs === 'string' ? row.specs : JSON.stringify(row.specs || {}),
                description: row.description || '',
                metaTitle: row.metaTitle || null,
                metaDescription: row.metaDescription || null,
                metaKeywords: row.metaKeywords || null,
            };
            try {
                let parsedImages = [];
                if (row._embeddedImages && row._embeddedImages.length > 0) {
                    parsedImages = row._embeddedImages.map((url) => ({ url }));
                }
                else if (row.images) {
                    parsedImages = row.images.split(',').map((url) => ({ url: url.trim() })).filter((img) => img.url);
                }
                const existing = await index_1.prisma.product.findUnique({ where: { slug: safeSlug }, include: { collections: true } });
                if (existing) {
                    const existingCollectionIds = existing.collections.map((c) => c.id);
                    const newCollectionIds = collectionConnections.map((c) => c.id);
                    const columnsToDisconnect = existingCollectionIds.filter((id) => !newCollectionIds.includes(id)).map((id) => ({ id }));
                    await index_1.prisma.product.update({
                        where: { id: existing.id },
                        data: {
                            ...data,
                            ...(parsedImages.length > 0 ? { images: { deleteMany: {}, create: parsedImages } } : {}),
                            collections: {
                                ...(columnsToDisconnect.length > 0 ? { disconnect: columnsToDisconnect } : {}),
                                ...(collectionConnections.length > 0 ? { connect: collectionConnections } : {})
                            }
                        }
                    });
                    results.updated++;
                }
                else {
                    await index_1.prisma.product.create({
                        data: {
                            ...data,
                            slug: safeSlug,
                            ...(parsedImages.length > 0 ? { images: { create: parsedImages } } : {}),
                            ...(collectionConnections.length > 0 ? { collections: { connect: collectionConnections } } : {})
                        }
                    });
                    results.created++;
                }
            }
            catch (rowError) {
                results.errors.push(`Failed to import product '${row.slug}': ${rowError.message}`);
            }
        }
        return results;
    }
}
exports.ProductService = ProductService;

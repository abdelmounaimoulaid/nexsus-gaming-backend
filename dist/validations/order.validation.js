"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
        lastName: zod_1.z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        phone: zod_1.z.string().min(10, 'Numéro de téléphone invalide'),
        address: zod_1.z.string().min(5, 'L\'adresse est trop courte'),
        city: zod_1.z.string().min(2, 'La ville est requise'),
        isDefault: zod_1.z.boolean().optional(),
    })
});
exports.updateAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2).optional(),
        lastName: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
        address: zod_1.z.string().min(5).optional(),
        city: zod_1.z.string().min(2).optional(),
        isDefault: zod_1.z.boolean().optional(),
    })
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().min(2),
        customerEmail: zod_1.z.string().email(),
        customerPhone: zod_1.z.string().min(10),
        address: zod_1.z.string().min(5),
        city: zod_1.z.string().min(2),
        notes: zod_1.z.string().optional(),
        paymentMethod: zod_1.z.enum(['PAYMENT_ON_DELIVERY', 'BANK_TRANSFER', 'STORE_PICKUP']),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            quantity: zod_1.z.number().int().positive(),
            price: zod_1.z.number().positive().optional(),
            variations: zod_1.z.any().optional()
        })).min(1),
        couponCode: zod_1.z.string().optional(),
    })
});


import { z } from 'zod';

export const createAddressSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
        lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
        phone: z.string().min(10, 'Numéro de téléphone invalide'),
        address: z.string().min(5, 'L\'adresse est trop courte'),
        city: z.string().min(2, 'La ville est requise'),
        isDefault: z.boolean().optional(),
    })
});

export const updateAddressSchema = z.object({
    body: z.object({
        firstName: z.string().min(2).optional(),
        lastName: z.string().min(2).optional(),
        phone: z.string().min(10).optional(),
        address: z.string().min(5).optional(),
        city: z.string().min(2).optional(),
        isDefault: z.boolean().optional(),
    })
});

export const createOrderSchema = z.object({
    body: z.object({
        customerName: z.string().min(2),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(10),
        address: z.string().min(5),
        city: z.string().min(2),
        notes: z.string().optional(),
        paymentMethod: z.enum(['PAYMENT_ON_DELIVERY', 'BANK_TRANSFER', 'STORE_PICKUP']),
        items: z.array(z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
            price: z.number().positive(),
            variations: z.array(z.any()).optional()
        })).min(1),
        couponCode: z.string().optional(),
    })
});

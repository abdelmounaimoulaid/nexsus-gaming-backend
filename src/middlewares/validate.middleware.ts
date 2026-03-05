
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: true,
                    message: 'Validation failed',
                    details: error.issues.map((e: any) => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return res.status(500).json({ error: true, message: 'Internal server error during validation' });
        }
    };
};

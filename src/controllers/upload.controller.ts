import { Request, Response } from 'express';

export class UploadController {
    static async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Return the public URL for the image
            const imageUrl = `/uploads/${req.file.filename}`;
            res.json({ url: imageUrl });
        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error: String(error) });
        }
    }
}

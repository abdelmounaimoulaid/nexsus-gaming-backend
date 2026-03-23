import { Request, Response } from 'express';

export class UploadController {
    static async uploadImage(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Return the data URL for the image (Base64)
            const base64 = req.file.buffer.toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64}`;
            res.json({ url: imageUrl });
        } catch (error) {
            res.status(500).json({ message: 'Upload failed', error: String(error) });
        }
    }
}

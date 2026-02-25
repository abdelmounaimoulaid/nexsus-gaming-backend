"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
class UploadController {
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Return the public URL for the image
            const imageUrl = `/uploads/${req.file.filename}`;
            res.json({ url: imageUrl });
        }
        catch (error) {
            res.status(500).json({ message: 'Upload failed', error: String(error) });
        }
    }
}
exports.UploadController = UploadController;

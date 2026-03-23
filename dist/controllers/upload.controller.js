"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
class UploadController {
    static async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Return the data URL for the image (Base64)
            const base64 = req.file.buffer.toString('base64');
            const imageUrl = `data:${req.file.mimetype};base64,${base64}`;
            console.log('UPLOAD SUCCESS: Generated Data URL starting with:', imageUrl.substring(0, 50));
            res.json({ url: imageUrl });
        }
        catch (error) {
            res.status(500).json({ message: 'Upload failed', error: String(error) });
        }
    }
}
exports.UploadController = UploadController;

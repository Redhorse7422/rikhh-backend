import { Router } from "express";
import { MediaController } from "./media.controller";
import { upload } from "../../common/middlewares/upload.middleware";

const router = Router();
const mediaController = new MediaController();

/**
 * @swagger
 * /api/v1/media/upload:
 *   post:
 *     summary: Upload a media file
 *     description: Upload a single media file (image, document, etc.)
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file to upload
 *               altText:
 *                 type: string
 *                 description: Alternative text for accessibility
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags for the media
 *     responses:
 *       201:
 *         description: Media file uploaded successfully
 *       400:
 *         description: Invalid file or validation error
 *       413:
 *         description: File too large
 *       415:
 *         description: Unsupported file type
 */
router.post(
  "/upload",
  upload.single("file"),
  mediaController.uploadMedia.bind(mediaController)
);

/**
 * @swagger
 * /api/v1/media/all:
 *   get:
 *     summary: Get all media files
 *     description: Retrieve a list of all media files with pagination and filtering
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering media files
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by file type (image, document, video, etc.)
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: Media files retrieved successfully
 *       400:
 *         description: Invalid query parameters
 */
router.get("/all", mediaController.getAllMedia.bind(mediaController));

/**
 * @swagger
 * /api/v1/media/{id}:
 *   get:
 *     summary: Get media file by ID
 *     description: Retrieve a specific media file by its ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file unique identifier
 *     responses:
 *       200:
 *         description: Media file retrieved successfully
 *       404:
 *         description: Media file not found
 */
router.get("/:id", mediaController.getMediaById.bind(mediaController));

/**
 * @swagger
 * /api/v1/media/{id}:
 *   put:
 *     summary: Update media file metadata
 *     description: Update metadata for a media file (alt text, tags, etc.)
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file unique identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               altText:
 *                 type: string
 *                 description: Alternative text for accessibility
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags for the media
 *               description:
 *                 type: string
 *                 description: Description of the media file
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the media file is publicly accessible
 *     responses:
 *       200:
 *         description: Media file updated successfully
 *       400:
 *         description: Validation error or invalid data
 *       404:
 *         description: Media file not found
 */
router.put("/:id", mediaController.updateMedia.bind(mediaController));

/**
 * @swagger
 * /api/v1/media/{id}:
 *   delete:
 *     summary: Delete a media file
 *     description: Permanently delete a media file
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Media file unique identifier
 *     responses:
 *       200:
 *         description: Media file deleted successfully
 *       404:
 *         description: Media file not found
 */
router.delete("/:id", mediaController.deleteMedia.bind(mediaController));

export default router;

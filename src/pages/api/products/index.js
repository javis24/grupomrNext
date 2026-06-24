import { authenticateToken } from '../../../lib/auth';
import Products from '../../../models/ProductsModel';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import { put } from '@vercel/blob';

export const config = {
    api: {
        bodyParser: false,
    },
};

const sanitizeFilename = (filename = 'producto.jpg') => {
    return filename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
};

const parseForm = (req) => {
    const form = formidable({
        uploadDir: os.tmpdir(),
        keepExtensions: true,
        multiples: false,
        maxFileSize: 5 * 1024 * 1024,
    });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
};

const getValue = (field) => {
    if (Array.isArray(field)) return field[0];
    return field;
};

export default async function handler(req, res) {
    authenticateToken(req, res, async () => {
        const { method } = req;
        const { role, id: userId } = req.user;

        try {
            if (method === 'GET') {
                const products = await Products.findAll({
                    order: [['createdAt', 'DESC']],
                });

                return res.status(200).json(products);
            }

            if (method === 'POST') {
                if (role !== 'admin' && role !== 'gerencia') {
                    return res.status(403).json({
                        message: 'Acceso denegado: No tienes permisos para crear productos.',
                    });
                }

                const { fields, files } = await parseForm(req);

                const code = getValue(fields.code) || '';
                const name = getValue(fields.name) || '';
                const description = getValue(fields.description) || '';
                const unitMeasure = getValue(fields.unitMeasure) || 'Pieza';
                const leadTime = getValue(fields.leadTime) || '';
                const cost = getValue(fields.cost) || 0;
                const price = getValue(fields.price) || 0;
                const businessUnit = getValue(fields.businessUnit) || '';

                if (!name || !unitMeasure || !businessUnit) {
                    return res.status(400).json({
                        message: 'Nombre, unidad de medida y unidad de negocio son requeridos.',
                    });
                }

                let imageUrl = null;

                const imageFile = Array.isArray(files.image)
                    ? files.image[0]
                    : files.image;

                if (imageFile) {
                    if (!imageFile.mimetype?.startsWith('image/')) {
                        return res.status(400).json({
                            message: 'Solo se permiten archivos de imagen.',
                        });
                    }

                    const originalName =
                        imageFile.originalFilename ||
                        imageFile.newFilename ||
                        'producto.jpg';

                    const safeName = sanitizeFilename(originalName);
                    const blobPath = `productos/${Date.now()}-${safeName}`;
                    const fileBuffer = fs.readFileSync(imageFile.filepath);

                    const blob = await put(blobPath, fileBuffer, {
                        access: 'public',
                        contentType: imageFile.mimetype,
                        addRandomSuffix: false,
                        token: process.env.BLOB_READ_WRITE_TOKEN,
                    });

                    imageUrl = blob.url;
                }

                const newProduct = await Products.create({
                    code,
                    name,
                    description,
                    unitMeasure,
                    leadTime,
                    cost: parseFloat(cost || 0),
                    price: parseFloat(price || 0),
                    businessUnit,
                    imageUrl,
                    userId,
                });

                return res.status(201).json(newProduct);
            }

            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({
                message: `Método ${method} no permitido`,
            });
        } catch (error) {
            console.error('ERROR API PRODUCTS:', error);

            return res.status(500).json({
                message: 'Error interno en productos',
                error: error.message,
            });
        }
    });
}
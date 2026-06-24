import { authenticateToken } from '../../../lib/auth';
import Products from '../../../models/ProductsModel';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import { put, del } from '@vercel/blob';

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
    const { id } = req.query;

    authenticateToken(req, res, async () => {
        const { method } = req;
        const { role } = req.user;

        try {
            const product = await Products.findByPk(id);

            if (!product) {
                return res.status(404).json({
                    message: 'Producto no encontrado',
                });
            }

            if (method === 'PUT' || method === 'DELETE') {
                if (role !== 'admin' && role !== 'gerencia') {
                    return res.status(403).json({
                        message: 'Acceso denegado: Se requieren permisos de administrador.',
                    });
                }
            }

            if (method === 'PUT') {
                const { fields, files } = await parseForm(req);

                const code = getValue(fields.code) || '';
                const name = getValue(fields.name) || '';
                const description = getValue(fields.description) || '';
                const unitMeasure = getValue(fields.unitMeasure) || 'Pieza';
                const leadTime = getValue(fields.leadTime) || '';
                const cost = getValue(fields.cost) || 0;
                const price = getValue(fields.price) || 0;
                const businessUnit = getValue(fields.businessUnit) || '';

                let imageUrl = product.imageUrl;

                const imageFile = Array.isArray(files.image)
                    ? files.image[0]
                    : files.image;

                if (imageFile) {
                    if (!imageFile.mimetype?.startsWith('image/')) {
                        return res.status(400).json({
                            message: 'Solo se permiten archivos de imagen.',
                        });
                    }

                    if (product.imageUrl?.includes('blob.vercel-storage.com')) {
                        try {
                            await del(product.imageUrl, {
                                token: process.env.BLOB_READ_WRITE_TOKEN,
                            });
                        } catch (blobError) {
                            console.error('Error eliminando imagen anterior:', blobError);
                        }
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

                await product.update({
                    code,
                    name,
                    description,
                    unitMeasure,
                    leadTime,
                    businessUnit,
                    cost: parseFloat(cost || 0),
                    price: parseFloat(price || 0),
                    imageUrl,
                });

                return res.status(200).json({
                    message: 'Producto actualizado con éxito',
                    product,
                });
            }

            if (method === 'DELETE') {
                if (product.imageUrl?.includes('blob.vercel-storage.com')) {
                    try {
                        await del(product.imageUrl, {
                            token: process.env.BLOB_READ_WRITE_TOKEN,
                        });
                    } catch (blobError) {
                        console.error('Error eliminando imagen del producto:', blobError);
                    }
                }

                await product.destroy();

                return res.status(200).json({
                    message: 'Producto eliminado correctamente',
                });
            }

            res.setHeader('Allow', ['PUT', 'DELETE']);
            return res.status(405).end(`Method ${method} Not Allowed`);
        } catch (error) {
            console.error('ERROR API PRODUCTS [ID]:', error);

            return res.status(500).json({
                message: 'Error interno',
                error: error.message,
            });
        }
    });
}
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import * as XLSX from "xlsx";
import BusinessUnitReport from "../../../models/BusinessUnitReport";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() }); // en memoria

export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "reportes_excel",
        resource_type: "raw", // permite archivos como .xlsx
        public_id: filename.replace(/\.[^/.]+$/, ""), // sin extensión
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await runMiddleware(req, res, upload.single("file"));

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No se proporcionó un archivo" });
      }

      // Leer el archivo Excel desde buffer
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Subir a Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file.buffer, file.originalname);

      // Guardar en la base de datos
      const savedFile = await BusinessUnitReport.create({
        name: file.originalname,
        total: jsonData.reduce((acc, item) => acc + (item["Total Vendido"] || 0), 0),
        fileData: cloudinaryResult.secure_url, // URL pública del archivo
        userId: 1, // o usa req.user.id si ya está autenticado
      });

      return res.status(200).json({
        message: "Archivo procesado y subido a Cloudinary correctamente",
        data: jsonData,
        report: savedFile,
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      return res.status(500).json({ message: "Error al procesar el archivo", error: error.message });
    }
  }

  // GET - lista de archivos
  else if (req.method === "GET") {
    try {
      const reports = await BusinessUnitReport.findAll({
        attributes: ["id", "name", "fileData", "total", "createdAt"],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
      return res.status(500).json({ message: "Error al obtener los reportes", error: error.message });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res.status(405).json({ message: `Método ${req.method} no permitido` });
}

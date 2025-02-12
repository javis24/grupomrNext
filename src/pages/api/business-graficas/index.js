import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import BusinessUnitReport from "../../../models/BusinessUnitReport";

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "tmp"); // Ruta relativa al proyecto
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Crear la carpeta si no existe
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Deshabilitar bodyParser para usar Multer
  },
};

// Middleware para manejar Multer
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Procesar archivo con Multer
      await runMiddleware(req, res, upload.single("file"));

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No se proporcionó un archivo" });
      }

      const filePath = path.join("/tmp", report.fileData); // Usa barras normales
      console.log("Ruta del archivo:", filePath);

      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error("El archivo no se guardó correctamente.");
        return res.status(500).json({ message: "Error al guardar el archivo" });
      }

      // Leer el archivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log("Datos procesados del archivo:", jsonData);

      // Guardar en la base de datos
      const savedFile = await BusinessUnitReport.create({
        name: file.originalname,
        total: jsonData.reduce((acc, item) => acc + (item["Total Vendido"] || 0), 0),
        fileData: file.filename, // Guardar solo el nombre del archivo
        userId: 1, // Cambiar según el usuario autenticado
      });

      return res.status(200).json({
        message: "Archivo procesado correctamente",
        data: jsonData,
        report: savedFile,
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      return res.status(500).json({ message: "Error al procesar el archivo", error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      // Obtener la lista de archivos desde la base de datos
      const reports = await BusinessUnitReport.findAll({
        attributes: ["id", "name", "createdAt"],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
      return res.status(500).json({ message: "Error al obtener los reportes", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ message: `Método ${req.method} no permitido` });
  }
}
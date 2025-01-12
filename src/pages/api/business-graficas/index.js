import multer from "multer";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import BusinessUnitReport from "../../../models/BusinessUnitReport";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
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
      await runMiddleware(req, res, upload.single("file"));
  
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No se proporcionó un archivo" });
      }
  
      // Ruta relativa del archivo
      const filePath = `/uploads/${file.filename}`;
  
      // Leer el archivo Excel
      const workbook = XLSX.readFile(path.join(process.cwd(), "public", filePath));
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      // Calcular el total
      const total = jsonData.reduce((acc, item) => acc + (item["Total Vendido"] || 0), 0);
  
      // Guardar en la base de datos
      const savedFile = await BusinessUnitReport.create({
        name: file.originalname,
        total,
        fileData: filePath, // Guardar ruta relativa
        userId: 1,
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
  }
   else if (req.method === "GET") {
    try {
      // Obtener la lista de archivos
      const reports = await BusinessUnitReport.findAll({
        attributes: ["id", "name", "createdAt"],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener los reportes:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener los reportes", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

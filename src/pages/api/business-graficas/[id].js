import path from "path";
import fs from "fs";
import BusinessUnitReport from "../../../models/BusinessUnitReport";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      // Buscar el registro en la base de datos
      const report = await BusinessUnitReport.findOne({ where: { id } });
      if (!report) {
        return res.status(404).json({ message: "Archivo no encontrado" });
      }

      // Construir la ruta completa del archivo
      const filePath = path.join(process.cwd(), "public", report.fileData);
      console.log("Intentando eliminar archivo en:", filePath);

      // Eliminar archivo físico si existe
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn("El archivo no existe en el sistema de archivos:", filePath);
      }

      // Eliminar el registro de la base de datos
      await report.destroy();
      res.status(200).json({ message: "Archivo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el archivo:", error.message);
      return res.status(500).json({ message: "Error al eliminar el archivo", error: error.message });
    }
  } else if (req.method === "GET") {
    try {
      // Buscar el registro en la base de datos
      const report = await BusinessUnitReport.findOne({ where: { id } });
      if (!report) {
        return res.status(404).json({ message: "Archivo no encontrado" });
      }

      // Construir la ruta completa del archivo
      const filePath = path.join(process.cwd(), "public", report.fileData);
      console.log("Intentando descargar archivo desde:", filePath);

      if (!fs.existsSync(filePath)) {
        console.error("El archivo no existe en el servidor:", filePath);
        return res.status(404).json({ message: "El archivo no existe en el servidor" });
      }

      // Configurar headers para la descarga del archivo
      res.setHeader("Content-Disposition", `attachment; filename="${report.name}"`);
      res.setHeader("Content-Type", "application/octet-stream");

      // Leer y enviar el archivo
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error al descargar el archivo:", error.message);
      return res.status(500).json({ message: "Error al descargar el archivo", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["DELETE", "GET"]);
    return res.status(405).json({ message: `Método ${req.method} no permitido` });
  }
}

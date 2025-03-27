import BusinessUnitReport from "../../../models/BusinessUnitReport";
import { v2 as cloudinary } from "cloudinary";
import https from "https";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const report = await BusinessUnitReport.findOne({ where: { id } });
      if (!report) {
        return res.status(404).json({ message: "Archivo no encontrado" });
      }

      const fileUrl = report.fileData;

      // Headers para descarga
      res.setHeader("Content-Disposition", `attachment; filename="${report.name}"`);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      https.get(fileUrl, (streamRes) => {
        streamRes.pipe(res);
        streamRes.on("end", () => res.end());
      }).on("error", (err) => {
        console.error("Error al descargar desde Cloudinary:", err.message);
        res.status(500).json({ message: "Error al descargar archivo desde Cloudinary" });
      });

    } catch (error) {
      console.error("Error en GET:", error.message);
      return res.status(500).json({ message: "Error interno", error: error.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const report = await BusinessUnitReport.findOne({ where: { id } });
      if (!report) {
        return res.status(404).json({ message: "Archivo no encontrado" });
      }

      const publicIdMatch = report.fileData.match(/\/upload\/(?:v\d+\/)?(.+)\.xlsx/);
      const publicId = publicIdMatch ? publicIdMatch[1] : null;

      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        console.log(`Archivo eliminado de Cloudinary: ${publicId}`);
      }

      await report.destroy();
      return res.status(200).json({ message: "Archivo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar:", error.message);
      return res.status(500).json({ message: "Error interno", error: error.message });
    }
  }

  // Si no es GET ni DELETE
  res.setHeader("Allow", ["GET", "DELETE"]);
  return res.status(405).json({ message: `Método ${req.method} no permitido` });
}

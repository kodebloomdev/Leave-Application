import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = (req.query.folder || req.body.folder || "guardian_photos").replace(/[^a-zA-Z0-9_\-]/g, "");
    const dir = `uploads/${folder}/`;
    try {
      // create folder if missing
      require("fs").mkdirSync(dir, { recursive: true });
    } catch {}
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const prefix = (req.query.prefix || req.body.prefix || "file").replace(/[^a-zA-Z0-9_\-]/g, "");
    cb(null, `${prefix}_` + Date.now() + ext);
  },
});

const upload = multer({ storage });

export default upload;

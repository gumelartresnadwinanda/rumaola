const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const supabase = require("../config/supabase");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileExt = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${fileExt}`;

    const { error } = await supabase.storage
      .from("uploads")
      .upload(`images/${fileName}`, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to upload to Supabase" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(`images/${fileName}`);

    res.json({
      success: true,
      message: "File uploaded to Supabase successfully",
      fileUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

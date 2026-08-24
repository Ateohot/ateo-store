const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Permitir conexiones desde la APK y otros clientes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

const DATA_FILE = path.join(__dirname, "tools", "productos.json");


// =========================
// SUBIDA DE IMÁGENES
// =========================

const IMAGES_DIR = path.join(__dirname, "public", "images");

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname) || ".jpg";
        const nombre = `${Date.now()}${extension}`;
        cb(null, nombre);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten imágenes"));
        }
    }
});

app.post("/api/upload-image", upload.single("imagen"), (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                ok: false,
                mensaje: "No se recibió ninguna imagen"
            });
        }

        const host =
            req.headers["x-forwarded-host"] ||
            req.headers.host;

        const protocolo =
            req.headers["x-forwarded-proto"] ||
            req.protocol;

        const imagen =
            `${protocolo}://${host}/images/${encodeURIComponent(req.file.filename)}`;

        return res.json({
            ok: true,
            nombre: req.file.filename,
            imagen: imagen
        });

    } catch (error) {

        return res.status(500).json({
            ok: false,
            mensaje: "Error al guardar la imagen",
            error: String(error?.message || error)
        });
    }
});

// =========================
// ERRORES DE SUBIDA
// =========================

app.use((error, _req, res, _next) => {

    if (error instanceof multer.MulterError) {

        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                ok: false,
                mensaje: "La imagen supera el límite de 10 MB"
            });
        }

        return res.status(400).json({
            ok: false,
            mensaje: error.message
        });
    }

    if (error) {

        return res.status(400).json({
            ok: false,
            mensaje: error.message || "Error al subir imagen"
        });
    }
});

// =========================
// PRODUCTOS
// =========================

function cargarProductos() {
    if (!fs.existsSync(DATA_FILE)) {
        return { productos: [] };
    }

    try {
        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );
    } catch {
        return { productos: [] };
    }
}

// =========================
// LOGIN DE PRUEBA
// =========================

app.post("/api/login", (req, res) => {

    const { usuario, password } = req.body;

    if (
        usuario === "admin" &&
        password === "ateo123"
    ) {
        return res.json({
            ok: true,
            mensaje: "Login correcto"
        });
    }

    res.status(401).json({
        ok: false,
        mensaje: "Usuario o contraseña incorrectos"
    });
});

// =========================
// OBTENER PRODUCTOS
// =========================

app.get("/api/productos", (req, res) => {

    const datos = cargarProductos();

    res.json({
        ok: true,
        productos: datos.productos
    });
});

// =========================
// SERVIR ATEO STORE
// =========================

app.use(express.static(
    path.join(__dirname, "public")
));

// =========================
// INICIAR SERVIDOR
// =========================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("================================");
    console.log("       ATEO STORE SERVER");
    console.log("================================");
    console.log("");
    console.log(`Servidor: http://127.0.0.1:${PORT}`);
    console.log("");
});

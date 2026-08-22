const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE = path.join(__dirname, "tools", "productos.json");

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

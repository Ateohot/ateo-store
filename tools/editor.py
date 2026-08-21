import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATOS = BASE / "tools" / "productos.json"
SALIDA = BASE / "public" / "js" / "productos.js"


def cargar():
    if not DATOS.exists():
        return {"productos": []}

    try:
        return json.loads(DATOS.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        print("\nError: productos.json no es válido.")
        return {"productos": []}


def guardar(datos):
    DATOS.write_text(
        json.dumps(datos, ensure_ascii=False, indent=4),
        encoding="utf-8"
    )


def listar(datos):
    productos = datos["productos"]

    print("\n===== ATEO STORE =====\n")

    if not productos:
        print("No hay productos guardados.")
        return

    for i, producto in enumerate(productos, 1):
        print(f"{i}. {producto['nombre']}")

        for precio in producto.get("precios", []):
            print(
                f"   - {precio['duracion']}: "
                f"{precio['precio']}"
            )


def agregar(datos):
    print("\n===== AGREGAR PRODUCTO =====\n")

    nombre = input("Nombre: ").strip()
    descripcion = input("Descripción: ").strip()
    imagen = input("Imagen: ").strip()
    tiktok = input("TikTok: ").strip() or "#"

    if not nombre:
        print("El nombre es obligatorio.")
        return

    if not imagen:
        print("La imagen es obligatoria.")
        return

    precios = []

    print("\nPRECIOS")
    print("Deja Duración vacía para terminar.\n")

    while True:
        duracion = input("Duración: ").strip()

        if not duracion:
            break

        precio = input("Precio: ").strip()

        if not precio:
            print("El precio es obligatorio.")
            continue

        precios.append({
            "duracion": duracion,
            "precio": precio
        })

    if not precios:
        print("Debes agregar al menos un precio.")
        return

    datos["productos"].append({
        "nombre": nombre,
        "descripcion": descripcion,
        "imagen": imagen,
        "precios": precios,
        "tiktok": tiktok
    })

    guardar(datos)

    print("\nProducto guardado en productos.json.")
    print("Todavía NO se modificó productos.js.")


def eliminar(datos):
    listar(datos)

    if not datos["productos"]:
        return

    try:
        numero = int(input("\nNúmero del producto: "))
        producto = datos["productos"][numero - 1]
    except (ValueError, IndexError):
        print("Producto inválido.")
        return

    confirmar = input(
        f'¿Eliminar "{producto["nombre"]}"? (s/n): '
    ).lower()

    if confirmar == "s":
        datos["productos"].pop(numero - 1)
        guardar(datos)
        print("Producto eliminado de productos.json.")


def generar(datos):
    productos = datos["productos"]

    if not productos:
        print("\nNo hay productos para generar.")
        return

    respaldo = SALIDA.with_suffix(".js.backup")

    if SALIDA.exists():
        respaldo.write_text(
            SALIDA.read_text(encoding="utf-8"),
            encoding="utf-8"
        )

    texto = 'const WHATSAPP = "50586058362";\n\n'
    texto += "const productos = "
    texto += json.dumps(
        productos,
        ensure_ascii=False,
        indent=4
    )
    texto += ";\n"

    texto += """
const contenedor = document.getElementById("productos");

if (contenedor) {

    productos.forEach(producto => {

        const tarjeta = document.createElement("article");

        tarjeta.className = "producto";

        let planesHTML = "";

        producto.precios.forEach(plan => {

            const mensaje =
                `Hola, quiero comprar ${producto.nombre} por ${plan.duracion}. Precio: ${plan.precio}`;

            const whatsapp =
                `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

            planesHTML += `
                <div class="plan">

                    <div class="plan-info">
                        <span>
                            ${plan.duracion}
                        </span>

                        <strong>
                            ${plan.precio}
                        </strong>
                    </div>

                    <a
                        class="comprar"
                        href="${whatsapp}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        COMPRAR
                    </a>

                </div>
            `;
        });

        tarjeta.innerHTML = `
            <div class="imagen-producto">

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    onerror="this.style.display='none'"
                >

            </div>

            <div class="producto-info">

                <span class="categoria">
                    MEMBRESÍA
                </span>

                <h2>
                    ${producto.nombre}
                </h2>

                ${planesHTML}

                <a
                    href="${producto.tiktok}"
                    class="tiktok"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>♪</span>
                    Ver vídeo del producto en TikTok
                </a>

            </div>
        `;

        contenedor.appendChild(tarjeta);

    });
}
"""

    SALIDA.write_text(texto, encoding="utf-8")

    print("\nproductos.js generado correctamente.")
    print(f"Respaldo creado en: {respaldo}")


def menu():
    while True:

        print("""
=========================
       ATEO STORE
=========================

1. Ver productos
2. Agregar producto
3. Eliminar producto
4. Generar productos.js
5. Salir
""")

        opcion = input("Selecciona una opción: ").strip()

        datos = cargar()

        if opcion == "1":
            listar(datos)

        elif opcion == "2":
            agregar(datos)

        elif opcion == "3":
            eliminar(datos)

        elif opcion == "4":
            generar(datos)

        elif opcion == "5":
            print("Saliendo...")
            break

        else:
            print("Opción inválida.")


if __name__ == "__main__":
    menu()

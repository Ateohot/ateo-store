import json
import shutil
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATOS = BASE / "tools" / "productos.json"
SALIDA = BASE / "public" / "js" / "productos.js"
IMAGES = BASE / "public" / "images"


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


def copiar_imagen(ruta):
    ruta = ruta.strip()

    if not ruta:
        return ""

    origen = Path(ruta).expanduser()

    if not origen.exists():
        print("\nNo se encontró la imagen:")
        print(origen)
        return None

    if not origen.is_file():
        print("\nLa ruta no corresponde a un archivo.")
        return None

    extensiones = {".jpg", ".jpeg", ".png", ".webp"}

    if origen.suffix.lower() not in extensiones:
        print(
            "\nFormato no permitido."
            "\nUsa JPG, JPEG, PNG o WEBP."
        )
        return None

    IMAGES.mkdir(parents=True, exist_ok=True)

    nombre = input(
        f"Nombre para la imagen [{origen.name}]: "
    ).strip()

    if not nombre:
        nombre = origen.name

    nombre = Path(nombre).name

    if Path(nombre).suffix.lower() not in extensiones:
        nombre += origen.suffix.lower()

    destino = IMAGES / nombre

    try:
        shutil.copy2(origen, destino)
    except Exception as e:
        print(f"\nNo se pudo copiar la imagen: {e}")
        return None

    print(f"\nImagen copiada a:")
    print(destino)

    return f"images/{nombre}"


def agregar(datos):
    print("\n===== AGREGAR PRODUCTO =====\n")

    nombre = input("Nombre: ").strip()
    descripcion = input("Descripción: ").strip()

    ruta_imagen = input(
        "Ruta de la imagen del teléfono: "
    ).strip()

    imagen = copiar_imagen(ruta_imagen)

    if imagen is None:
        print("\nProducto cancelado.")
        return

    tiktok = input("TikTok: ").strip() or "#"

    if not nombre:
        print("El nombre es obligatorio.")
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

    print("\nProducto guardado correctamente.")
    print("Imagen incluida en public/images/.")
    print("Todavía NO se modificó productos.js.")



def editar(datos):
    listar(datos)

    if not datos["productos"]:
        return

    try:
        numero = int(input("\nNúmero del producto a editar: "))
        producto = datos["productos"][numero - 1]
    except (ValueError, IndexError):
        print("Producto inválido.")
        return

    while True:
        print(f"""
===== EDITAR: {producto['nombre']} =====

1. Nombre
2. Descripción
3. Imagen
4. Precios / duraciones
5. TikTok
6. Guardar
7. Cancelar
""")

        opcion = input("Selecciona una opción: ").strip()

        if opcion == "1":
            nuevo = input(
                f"Nombre [{producto['nombre']}]: "
            ).strip()

            if nuevo:
                producto["nombre"] = nuevo

        elif opcion == "2":
            nuevo = input(
                f"Descripción [{producto.get('descripcion', '')}]: "
            ).strip()

            producto["descripcion"] = nuevo

        elif opcion == "3":
            ruta = input("Ruta de la nueva imagen: ").strip()

            if ruta:
                imagen = copiar_imagen(ruta)

                if imagen:
                    producto["imagen"] = imagen

        elif opcion == "4":
            print("\nPrecios actuales:")

            for i, precio in enumerate(
                producto.get("precios", []), 1
            ):
                print(
                    f"{i}. {precio['duracion']}: "
                    f"{precio['precio']}"
                )

            print("\n1. Reemplazar todos")
            print("2. Agregar duración")
            print("3. Eliminar duración")
            print("4. Volver")

            sub = input("\nSelecciona una opción: ").strip()

            if sub == "1":
                nuevos = []

                print(
                    "\nDeja Duración vacía para terminar.\n"
                )

                while True:
                    duracion = input("Duración: ").strip()

                    if not duracion:
                        break

                    precio = input("Precio: ").strip()

                    if precio:
                        nuevos.append({
                            "duracion": duracion,
                            "precio": precio
                        })

                if nuevos:
                    producto["precios"] = nuevos

            elif sub == "2":
                duracion = input("Nueva duración: ").strip()
                precio = input("Precio: ").strip()

                if duracion and precio:
                    producto.setdefault(
                        "precios", []
                    ).append({
                        "duracion": duracion,
                        "precio": precio
                    })

            elif sub == "3":
                precios = producto.get("precios", [])

                if precios:
                    try:
                        numero_precio = int(
                            input("Número de duración: ")
                        )
                        precios.pop(numero_precio - 1)
                    except (ValueError, IndexError):
                        print("Duración inválida.")

            elif sub == "4":
                continue

        elif opcion == "5":
            nuevo = input(
                f"TikTok [{producto.get('tiktok', '#')}]: "
            ).strip()

            producto["tiktok"] = nuevo or "#"

        elif opcion == "6":
            guardar(datos)
            print("\nProducto actualizado correctamente.")
            return

        elif opcion == "7":
            print("\nCambios cancelados.")
            return

        else:
            print("Opción inválida.")

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
        print("Producto eliminado.")


def generar(datos):
    productos = datos["productos"]

    if not productos:
        print("\nNo hay productos para generar.")
        return

    if SALIDA.exists():
        respaldo = SALIDA.with_suffix(".js.backup")
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
    print("Se creó un respaldo antes de modificarlo.")


def menu():
    while True:

        print("""
=========================
       ATEO STORE
=========================

1. Ver productos
2. Agregar producto
3. Editar producto
4. Eliminar producto
5. Generar productos.js
6. Salir
""")

        opcion = input("Selecciona una opción: ").strip()
        datos = cargar()

        if opcion == "1":
            listar(datos)

        elif opcion == "2":
            agregar(datos)

        elif opcion == "3":
            editar(datos)

        elif opcion == "4":
            eliminar(datos)

        elif opcion == "5":
            generar(datos)

        elif opcion == "6":
            print("Saliendo...")
            break

        else:
            print("Opción inválida.")


if __name__ == "__main__":
    menu()

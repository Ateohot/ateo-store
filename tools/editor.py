from pathlib import Path

PRODUCTOS = Path("public/js/productos.js")


def leer():
    if not PRODUCTOS.exists():
        print("No se encontró productos.js")
        return ""

    return PRODUCTOS.read_text(encoding="utf-8")


def mostrar():
    texto = leer()

    print("\n===== PRODUCTOS =====\n")

    encontrados = False

    for linea in texto.splitlines():
        linea = linea.strip()

        if linea.startswith("nombre:"):
            print(linea)
            encontrados = True

    if not encontrados:
        print("No hay productos.")


def agregar():
    print("\n===== NUEVO PRODUCTO =====\n")

    nombre = input("Nombre: ").strip()
    descripcion = input("Descripción: ").strip()
    imagen = input("Imagen: ").strip()

    if not nombre or not imagen:
        print("\nNombre e imagen son obligatorios.")
        return

    precios = []

    print("\nAgrega los precios uno por uno.")
    print("Cuando termines, deja Duración vacía.\n")

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
        print("\nDebes agregar al menos un precio.")
        return

    nuevo = "    {\n"
    nuevo += f'        nombre: "{nombre}",\n'
    nuevo += f'        descripcion: "{descripcion}",\n'
    nuevo += f'        imagen: "{imagen}",\n'
    nuevo += "        precios: [\n"

    for i, p in enumerate(precios):
        nuevo += "            {\n"
        nuevo += f'                duracion: "{p["duracion"]}",\n'
        nuevo += f'                precio: "{p["precio"]}"\n'
        nuevo += "            }"

        if i < len(precios) - 1:
            nuevo += ","

        nuevo += "\n"

    nuevo += "        ]\n"
    nuevo += "    }"

    texto = leer()

    posicion = texto.rfind("];")

    if posicion == -1:
        print("\nNo se encontró el formato esperado de productos.js.")
        return

    antes = texto[:posicion].rstrip()

    if not antes.endswith("["):
        antes += ","

    texto = antes + "\n" + nuevo + "\n];\n"

    PRODUCTOS.write_text(texto, encoding="utf-8")

    print("\nProducto agregado correctamente.")


def menu():
    while True:
        print("""
=========================
       ATEO STORE
=========================

1. Ver productos
2. Agregar producto
3. Salir
""")

        opcion = input("Selecciona una opción: ").strip()

        if opcion == "1":
            mostrar()

        elif opcion == "2":
            agregar()

        elif opcion == "3":
            print("Saliendo...")
            break

        else:
            print("Opción inválida.")


if __name__ == "__main__":
    menu()

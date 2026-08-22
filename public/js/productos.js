const WHATSAPP = "50586058362";

async function cargarProductos() {

    const contenedor = document.getElementById("productos");

    if (!contenedor) return;

    try {

        const respuesta =
            await fetch("/api/productos");

        if (!respuesta.ok) {
            throw new Error(
                "Error HTTP " + respuesta.status
            );
        }

        const datos =
            await respuesta.json();

        if (!datos.ok) {
            throw new Error(
                "No se pudieron cargar los productos"
            );
        }

        const productos =
            datos.productos;

        contenedor.innerHTML = "";

        productos.forEach(producto => {

            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "producto";

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

                    ${
                        producto.descripcion
                            ? `<p>${producto.descripcion}</p>`
                            : ""
                    }

                    <div class="planes">
                        ${planesHTML}
                    </div>

                    ${
                        producto.tiktok &&
                        producto.tiktok !== "#"
                            ? `
                                <a
                                    href="${producto.tiktok}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    VER TIKTOK
                                </a>
                              `
                            : ""
                    }

                </div>
            `;

            contenedor.appendChild(tarjeta);
        });

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        contenedor.innerHTML =
            "<p>No se pudieron cargar los productos.</p>";
    }
}

cargarProductos();

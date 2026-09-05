const WHATSAPP = "50586058362";

let productosDisponibles = [];
let productosMostrados = [];
let productoActual = 0;
let vistaCatalogo = "carrusel";

let inicioToqueX = 0;
let inicioToqueY = 0;


/* ==================================================
   CONFIGURACIÓN DE VISTA
   ================================================== */

async function cargarConfiguracionVista() {

    try {

        const respuesta =
            await fetch("/api/configuracion");

        if (!respuesta.ok) {
            throw new Error(
                "Error HTTP " + respuesta.status
            );
        }

        const datos =
            await respuesta.json();

        if (
            datos.ok &&
            (
                datos.vista === "carrusel" ||
                datos.vista === "clasico"
            )
        ) {
            vistaCatalogo = datos.vista;
        }

    } catch (error) {

        console.warn(
            "No se pudo cargar la vista del catálogo:",
            error
        );

        vistaCatalogo = "carrusel";
    }
}


/* ==================================================
   CARRUSEL PRINCIPAL
   ================================================== */

function mostrarProductosClasico(productos) {

    const contenedor =
        document.getElementById("productos");

    if (!contenedor) return;

    productosMostrados = productos;

    contenedor.dataset.vista = "clasico";

    if (!productosMostrados.length) {
        contenedor.innerHTML =
            "<p>No se encontraron productos.</p>";
        return;
    }

    contenedor.innerHTML = "";

    productos.forEach(producto => {

        const tarjeta =
            document.createElement("article");

        tarjeta.className =
            "producto";

        let planesHTML = "";

        if (producto.gratis) {

            if (producto.urlGratis) {

                planesHTML = `
                    <div class="plan" style="justify-content: center;">

                        <a
                            class="comprar"
                            href="${producto.urlGratis}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            OBTENER GRATIS
                        </a>

                    </div>
                `;
            }

        } else {

            const precios =
                Array.isArray(producto.precios)
                    ? producto.precios
                    : [];

            precios.forEach(plan => {

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
        }

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
                        ? `<p class="descripcion">${producto.descripcion}</p>`
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
                                VER VIDEO
                            </a>
                          `
                        : ""
                }

            </div>
        `;

        contenedor.appendChild(tarjeta);
    });
}


function mostrarProductos(productos) {

    if (vistaCatalogo === "clasico") {
        mostrarProductosClasico(productos);
        return;
    }

    const contenedor = document.getElementById("productos");

    if (!contenedor) return;

    productosMostrados = productos;

    contenedor.dataset.vista = "carrusel";

    if (!productosMostrados.length) {
        contenedor.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    productoActual = 0;

    renderProductoPrincipal();
}


function renderProductoPrincipal() {

    const contenedor = document.getElementById("productos");

    if (!contenedor || !productosMostrados.length) return;

    const total = productosMostrados.length;

    contenedor.innerHTML = "";

    const escena = document.createElement("div");
    escena.className = "carrusel-escena";

    const pista = document.createElement("div");
    pista.className = "carrusel-pista";

    productosMostrados.forEach((producto, indice) => {

        const tarjeta = document.createElement("article");

        tarjeta.className = "producto producto-carrusel";
        tarjeta.dataset.index = indice;

        tarjeta.innerHTML = `
            <div class="imagen-producto">

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    draggable="false"
                    onerror="this.style.display='none'"
                >

            </div>

            <div class="producto-info">

                <h2>${producto.nombre}</h2>

                <div class="producto-etiquetas">

                    ${
                        producto.gratis
                            ? '<span class="producto-badge gratis">🎁 GRATIS</span>'
                            : ''
                    }

                    ${
                        producto.tiktok && producto.tiktok !== "#"
                            ? '<span class="producto-badge video">▶ VIDEO</span>'
                            : ''
                    }

                </div>

            </div>
        `;

        tarjeta.addEventListener("click", event => {

            if (tarjeta.dataset.deslizando === "1") {
                event.preventDefault();
                tarjeta.dataset.deslizando = "0";
                return;
            }

            const indice =
                Number(tarjeta.dataset.index);

            if (indice === productoActual) {
                abrirProducto(producto);
            } else {
                productoActual = indice;
                centrarProducto(false);
            }

        });

        pista.appendChild(tarjeta);

    });

    escena.appendChild(pista);

    const indicador = document.createElement("div");

    indicador.className = "producto-indicador";

    indicador.innerHTML = `
        <span class="contador-producto">
            ${productoActual + 1} / ${total}
        </span>

        <div class="indicador-puntos">
            ${productosMostrados.map((_, i) =>
                `<span class="${i === productoActual ? "activo" : ""}"></span>`
            ).join("")}
        </div>

        <div class="progreso-productos">
            <div class="progreso-productos-barra"></div>
        </div>
    `;

    escena.appendChild(indicador);

    contenedor.appendChild(escena);


    function obtenerPosicion(indice) {

        const tarjeta =
            pista.querySelector(
                `.producto-carrusel[data-index="${indice}"]`
            );

        if (!tarjeta) return 0;

        return tarjeta.offsetLeft -
            ((pista.clientWidth - tarjeta.offsetWidth) / 2);

    }


    function centrarProducto(suave = true) {

        const posicion =
            obtenerPosicion(productoActual);

        pista.scrollTo({
            left: posicion,
            behavior: suave ? "smooth" : "auto"
        });

        actualizarIndicador();
    }


    function actualizarIndicador() {

        const contador =
            escena.querySelector(".contador-producto");

        if (contador) {
            contador.textContent =
                `${productoActual + 1} / ${total}`;
        }

        const puntos =
            escena.querySelectorAll(
                ".indicador-puntos span"
            );

        puntos.forEach((punto, indice) => {

            punto.classList.toggle(
                "activo",
                indice === productoActual
            );

        });

        const barra =
            escena.querySelector(".progreso-productos-barra");

        if (barra && productosMostrados.length > 0) {

            const porcentaje =
                ((productoActual + 1) / productosMostrados.length) * 100;

            barra.style.width = `${porcentaje}%`;

        }

    }


    /* ==========================================
       SWIPE MANUAL
       ========================================== */

    let inicioX = 0;
    let inicioY = 0;
    let scrollInicial = 0;
    let moviendo = false;

    pista.addEventListener("touchstart", event => {

        if (event.touches.length !== 1) return;

        inicioX =
            event.touches[0].clientX;

        inicioY =
            event.touches[0].clientY;

        scrollInicial =
            pista.scrollLeft;

        moviendo = false;

    }, { passive: true });


    pista.addEventListener("touchmove", event => {

        if (event.touches.length !== 1) return;

        const x =
            event.touches[0].clientX;

        const y =
            event.touches[0].clientY;

        const dx = x - inicioX;
        const dy = y - inicioY;

        if (
            Math.abs(dx) > 10 &&
            Math.abs(dx) > Math.abs(dy)
        ) {

            moviendo = true;

            pista.scrollLeft =
                scrollInicial - dx;

        }

    }, { passive: true });


    pista.addEventListener("touchend", event => {

        if (!moviendo) return;

        const finalX =
            event.changedTouches[0].clientX;

        const diferenciaX =
            finalX - inicioX;

        const distanciaMinima = 45;

        if (Math.abs(diferenciaX) >= distanciaMinima) {

            if (diferenciaX < 0) {

                productoActual =
                    Math.min(
                        productoActual + 1,
                        total - 1
                    );

            } else {

                productoActual =
                    Math.max(
                        productoActual - 1,
                        0
                    );

            }

        }

        pista.scrollTo({
            left: obtenerPosicion(productoActual),
            behavior: "smooth"
        });

        pista.querySelectorAll(
            ".producto-carrusel"
        ).forEach(tarjeta => {

            tarjeta.dataset.deslizando = "1";

        });

        actualizarIndicador();

        moviendo = false;

    }, { passive: true });


    requestAnimationFrame(() => {
        centrarProducto(false);
    });

}

function cambiarProductoPrincipal(direccion) {

    if (!productosMostrados.length) return;

    productoActual += direccion;

    if (productoActual < 0) {
        productoActual = productosMostrados.length - 1;
    }

    if (productoActual >= productosMostrados.length) {
        productoActual = 0;
    }

    desplazarAlProducto(productoActual);
}

function cambiarProductoPrincipal(direccion) {

    if (!productosMostrados.length) return;

    productoActual += direccion;

    if (productoActual < 0) {
        productoActual = productosMostrados.length - 1;
    }

    if (productoActual >= productosMostrados.length) {
        productoActual = 0;
    }

    renderProductoPrincipal();
}


/* ==================================================
   MODAL
   ================================================== */

function abrirProducto(producto) {

    productoActual = productosMostrados.findIndex(
        p => p.id === producto.id
    );

    if (productoActual < 0) {
        productoActual = 0;
    }

    const modal = document.getElementById("modalProducto");

    if (!modal) return;

    const fondo = modal.querySelector(".modal-fondo-producto");
    const nombre = modal.querySelector(".modal-nombre");
    const contenido = modal.querySelector(".modal-contenido");

    fondo.style.backgroundImage =
        `url("${producto.imagen}")`;

    nombre.textContent = producto.nombre;

    let planesHTML = "";

    if (producto.gratis) {

        if (producto.urlGratis) {

            planesHTML = `
                <a
                    class="modal-comprar"
                    href="${producto.urlGratis}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    🎁 OBTENER GRATIS
                </a>
            `;
        }

    } else {

        const precios = Array.isArray(producto.precios)
            ? producto.precios
            : [];

        precios.forEach(plan => {

            const mensaje =
                `Hola, quiero comprar ${producto.nombre} por ${plan.duracion}. Precio: ${plan.precio}`;

            const whatsapp =
                `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

            planesHTML += `
                <div class="modal-plan">

                    <div>
                        <span>${plan.duracion}</span>
                        <strong>${plan.precio}</strong>
                    </div>

                    <a
                        class="modal-comprar"
                        href="${whatsapp}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        COMPRAR
                    </a>

                </div>
            `;
        });
    }

    contenido.innerHTML = `

        ${
            producto.descripcion
                ? `<p class="modal-descripcion">${producto.descripcion}</p>`
                : ""
        }

        <div class="modal-planes">
            ${planesHTML}
        </div>

        <button
            type="button"
            class="modal-compartir"
        >
            ↗ COMPARTIR PRODUCTO
        </button>

        ${
            producto.tiktok && producto.tiktok !== "#"
                ? `
                    <a
                        class="modal-video"
                        href="${producto.tiktok}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ▶ VER VIDEO
                    </a>
                  `
                : ""
        }

    `;

    const botonCompartir =
        contenido.querySelector(".modal-compartir");

    if (botonCompartir) {

        botonCompartir.addEventListener("click", () => {
            compartirProducto(producto);
        });

    }

    modal.classList.add("activo");

    document.body.classList.add("modal-abierto");

    actualizarIndicador();
}


function cambiarProducto(direccion) {

    if (!productosMostrados.length) return;

    productoActual += direccion;

    if (productoActual < 0) {
        productoActual = productosMostrados.length - 1;
    }

    if (productoActual >= productosMostrados.length) {
        productoActual = 0;
    }

    abrirProducto(productosMostrados[productoActual]);
}


function actualizarIndicador() {

    const modal = document.getElementById("modalProducto");

    if (!modal) return;

    const indicador =
        modal.querySelector(".modal-indicador");

    if (!indicador) return;

    indicador.textContent =
        `${productoActual + 1} / ${productosMostrados.length}`;
}


async function compartirProducto(producto) {

    if (!producto) return;

    const tipoProducto = producto.gratis
        ? "🎁 GRATIS"
        : "💰 DE PAGO";

    const texto =
        `🔥 ${producto.nombre}\n` +
        `${tipoProducto}\n\n` +
        `${producto.descripcion || "Producto disponible en ATEO STORE."}\n\n` +
        `ATEO STORE`;

    const datos = {
        title: producto.nombre,
        text: texto,
        url:
            `https://ateo-store.skixm-13.workers.dev/producto/${producto.id}`
    };

    try {

        if (navigator.share) {

            await navigator.share(datos);

        } else if (navigator.clipboard) {

            await navigator.clipboard.writeText(
                `${texto}\n\n${datos.url}`
            );

            alert("Enlace del producto copiado.");

        } else {

            alert(
                `${texto}\n\n${datos.url}`
            );

        }

    } catch (error) {

        if (error.name !== "AbortError") {
            console.error(
                "Error compartiendo producto:",
                error
            );
        }

    }
}


function cerrarProducto() {

    const modal = document.getElementById("modalProducto");

    if (!modal) return;

    modal.classList.remove("activo");

    document.body.classList.remove("modal-abierto");
}


function crearModal() {

    if (document.getElementById("modalProducto")) return;

    const modal = document.createElement("div");

    modal.id = "modalProducto";
    modal.className = "modal-producto";

    modal.innerHTML = `

        <div class="modal-fondo-producto"></div>

        <div class="modal-overlay"></div>

        <div class="modal-caja">

            <button
                class="modal-cerrar"
                type="button"
                aria-label="Cerrar"
            >
                ×
            </button>

            <h2 class="modal-nombre"></h2>

            <div class="modal-contenido"></div>

            <div class="modal-indicador">
                1 / 1
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".modal-cerrar")
        .addEventListener("click", cerrarProducto);

    modal.addEventListener("click", event => {

        if (event.target === modal) {
            cerrarProducto();
        }

    });


    /* Swipe dentro del modal */

    modal.addEventListener("touchstart", event => {

        if (event.touches.length !== 1) return;

        inicioToqueX = event.touches[0].clientX;
        inicioToqueY = event.touches[0].clientY;

    }, { passive: true });


    modal.addEventListener("touchend", event => {

        if (!modal.classList.contains("activo")) return;

        const toqueX = event.changedTouches[0].clientX;
        const toqueY = event.changedTouches[0].clientY;

        const diferenciaX = toqueX - inicioToqueX;
        const diferenciaY = toqueY - inicioToqueY;

        if (Math.abs(diferenciaX) < 60) return;

        if (Math.abs(diferenciaX) < Math.abs(diferenciaY)) return;

        if (diferenciaX < 0) {
            cambiarProducto(1);
        } else {
            cambiarProducto(-1);
        }

    }, { passive: true });
}


/* ==================================================
   CARGAR PRODUCTOS
   ================================================== */

function abrirProductoDesdeHash() {

    const hash = window.location.hash;

    if (!hash.startsWith("#producto-")) {
        return;
    }

    const id = hash.substring("#producto-".length);

    const indice = productosMostrados.findIndex(
        producto => String(producto.id) === String(id)
    );

    if (indice < 0) {
        return;
    }

    productoActual = indice;

    requestAnimationFrame(() => {

        if (typeof centrarProducto === "function") {
            centrarProducto(false);
        }

        abrirProducto(productosMostrados[indice]);

    });
}


async function cargarProductos() {

    try {

        await cargarConfiguracionVista();

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

        productosDisponibles =
            datos.productos;

        mostrarProductos(productosDisponibles);

        abrirProductoDesdeHash();

    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        const contenedor =
            document.getElementById("productos");

        if (contenedor) {
            contenedor.innerHTML =
                "<p>No se pudieron cargar los productos.</p>";
        }
    }
}


/* ==================================================
   BUSCADOR
   ================================================== */

function filtrarProductos(texto) {

    const busqueda =
        texto.trim().toLowerCase();

    const productosFiltrados =
        productosDisponibles.filter(producto =>
            producto.nombre
                .toLowerCase()
                .includes(busqueda)
        );

    mostrarProductos(productosFiltrados);
}


/* ==================================================
   INICIO
   ================================================== */

crearModal();
cargarProductos();


const buscador =
    document.getElementById("busquedaProductos");

if (buscador) {

    buscador.addEventListener("input", () => {

        filtrarProductos(
            buscador.value
        );

    });

}

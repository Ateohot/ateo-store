const WHATSAPP = "50586058362";

const productos = [
    {
        "nombre": "Drip Mobile No Root",
        "imagen": "images/drip-client.jpg",
        "precios": [
            {
                "duracion": "7 días",
                "precio": "$8"
            },
            {
                "duracion": "30 días",
                "precio": "$16"
            }
        ],
        "tiktok": "#"
    },
    {
        "nombre": "PatoTeam FF",
        "imagen": "images/patoteam-ff.jpg",
        "precios": [
            {
                "duracion": "1 día",
                "precio": "$3"
            },
            {
                "duracion": "3 días",
                "precio": "$5"
            },
            {
                "duracion": "7 días",
                "precio": "$8"
            },
            {
                "duracion": "15 días",
                "precio": "$10"
            },
            {
                "duracion": "30 días",
                "precio": "$15"
            }
        ],
        "tiktok": "https://vt.tiktok.com/ZSVDM77Hm/"
    },
    {
        "nombre": "Cuban Mods Store",
        "descripcion": "Más de 50 juegos disponibles",
        "imagen": "images/cuban-mods-store.jpg",
        "precios": [
            {
                "duracion": "1 día",
                "precio": "$3"
            },
            {
                "duracion": "7 días",
                "precio": "$8"
            },
            {
                "duracion": "15 días",
                "precio": "$10"
            },
            {
                "duracion": "30 días",
                "precio": "$15"
            }
        ],
        "tiktok": "#"
    },
    {
        "nombre": "HG CHEATS",
        "imagen": "images/hg-cheats.jpg",
        "precios": [
            {
                "duracion": "1 día",
                "precio": "$3"
            },
            {
                "duracion": "10 días",
                "precio": "$8"
            },
            {
                "duracion": "30 días",
                "precio": "$15"
            }
        ],
        "tiktok": "#"
    },
    {
        "nombre": "EXTERNAL iOS FUL PARA CUENTA PRINCIPAL",
        "imagen": "images/external-ios-ful.jpg",
        "precios": [
            {
                "duracion": "1 día",
                "precio": "$4"
            },
            {
                "duracion": "7 días",
                "precio": "$10"
            },
            {
                "duracion": "30 días",
                "precio": "$18"
            }
        ],
        "tiktok": "#"
    },
    {
        "nombre": "Br Mods Root",
        "descripcion": "Membresía Br Mods Root",
        "imagen": "images/br-mods-root.jpg",
        "precios": [
            {
                "duracion": "1 día",
                "precio": "$3"
            },
            {
                "duracion": "7 días",
                "precio": "$6"
            },
            {
                "duracion": "15 días",
                "precio": "$10"
            },
            {
                "duracion": "30 días",
                "precio": "$15"
            }
        ],
        "tiktok": "#"
    },
    {
        "nombre": "Fluorite",
        "descripcion": "",
        "imagen": "images/fluorite.jpg",
        "precios": [
            {
                "duracion": "1 Día",
                "precio": "5 $"
            },
            {
                "duracion": "7 Dias",
                "precio": "15 $"
            },
            {
                "duracion": "30 Dias",
                "precio": "35 $"
            }
        ],
        "tiktok": "#"
    }
];

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

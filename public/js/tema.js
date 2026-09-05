(function () {
    const TEMAS_VALIDOS = ["neon", "cyberpunk", "premium"];

    function aplicarTema(tema) {
        if (!TEMAS_VALIDOS.includes(tema)) {
            tema = "neon";
        }

        document.body.dataset.tema = tema;
        localStorage.setItem("ateo_tema", tema);
    }

    // Aplicar inmediatamente el último tema conocido
    const temaGuardado = localStorage.getItem("ateo_tema");

    if (temaGuardado) {
        aplicarTema(temaGuardado);
    } else {
        aplicarTema("neon");
    }

    // Consultar el tema oficial guardado en D1
    fetch("/api/configuracion")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo obtener la configuración");
            }

            return response.json();
        })
        .then(data => {
            if (data.ok && TEMAS_VALIDOS.includes(data.tema)) {
                aplicarTema(data.tema);
            }
        })
        .catch(() => {
            // Si falla la conexión, mantenemos el último tema conocido.
        });
})();

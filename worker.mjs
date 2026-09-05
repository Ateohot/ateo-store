export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // =========================
    // IMÁGENES
    // =========================

    if (
      url.pathname === "/api/upload-image" &&
      request.method === "POST"
    ) {
      try {
        const formData = await request.formData();
        const archivo = formData.get("imagen");

        if (!(archivo instanceof File)) {
          return Response.json(
            {
              ok: false,
              mensaje: "No se recibió ninguna imagen"
            },
            { status: 400 }
          );
        }

        const extension =
          archivo.name.includes(".")
            ? archivo.name.substring(
                archivo.name.lastIndexOf(".")
              ).toLowerCase()
            : ".jpg";

        const nombre =
          `${Date.now()}${extension}`;

        const datosImagen =
          await archivo.arrayBuffer();

        const bytesRecibidos = datosImagen.byteLength;

        if (!bytesRecibidos) {
          throw new Error("La imagen recibida está vacía");
        }

        await env.IMAGENES.put(
          nombre,
          datosImagen,
          {
            httpMetadata: {
              contentType:
                archivo.type || "image/jpeg",
              cacheControl:
                "public, max-age=31536000"
            }
          }
        );

        return Response.json({
          ok: true,
          nombre,
          imagen:
            `${url.origin}/images/${encodeURIComponent(nombre)}`
        });

      } catch (error) {
        return Response.json(
          {
            ok: false,
            mensaje: "Error al guardar imagen",
            error: String(
              error?.message || error
            )
          },
          { status: 500 }
        );
      }
    }

    if (
      url.pathname.startsWith("/images/") &&
      request.method === "GET"
    ) {
      const nombre = decodeURIComponent(
        url.pathname.substring("/images/".length)
      );

      if (!nombre || nombre.includes("..")) {
        return new Response("Imagen no válida", {
          status: 400
        });
      }

      const resultado =
        await env.IMAGENES.getWithMetadata(
          nombre,
          { type: "arrayBuffer" }
        );

      if (!resultado.value) {
        return new Response(
          "Imagen no encontrada",
          { status: 404 }
        );
      }

      return new Response(
        resultado.value,
        {
          headers: {
            "Content-Type":
              resultado.metadata?.contentType ||
              "image/jpeg",
            "Cache-Control":
              resultado.metadata?.cacheControl ||
              "public, max-age=31536000"
          }
        }
      );
    }

    // =========================
    // PÁGINA COMPARTIBLE DE PRODUCTO
    // =========================

    if (
      url.pathname.startsWith("/producto/") &&
      request.method === "GET"
    ) {
      try {
        const id = url.pathname.substring("/producto/".length);

        if (!/^\d+$/.test(id)) {
          return new Response("Producto no válido", {
            status: 400,
            headers: {
              "Content-Type": "text/plain; charset=UTF-8"
            }
          });
        }

        const resultado = await env.DB
          .prepare(
            "SELECT id, nombre, descripcion, imagen FROM productos WHERE id = ?"
          )
          .bind(Number(id))
          .first();

        if (!resultado) {
          return new Response("Producto no encontrado", {
            status: 404,
            headers: {
              "Content-Type": "text/plain; charset=UTF-8"
            }
          });
        }

        const escaparHTML = (valor) =>
          String(valor || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const nombre = escaparHTML(resultado.nombre);
        const descripcion = escaparHTML(
          String(resultado.descripcion || "")
            .replace(/\s+/g, " ")
            .trim()
        );

        const imagen = resultado.imagen || "";
        const catalogoURL =
          `${url.origin}/catalogo.html#producto-${resultado.id}`;

        const titulo = `${resultado.nombre} | ATEO STORE`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${escaparHTML(titulo)}</title>

  <meta
    name="description"
    content="${descripcion}"
  >

  <meta
    property="og:type"
    content="product"
  >

  <meta
    property="og:title"
    content="${escaparHTML(titulo)}"
  >

  <meta
    property="og:description"
    content="${descripcion}"
  >

  <meta
    property="og:image"
    content="${escaparHTML(imagen)}"
  >

  <meta
    property="og:url"
    content="${escaparHTML(url.href)}"
  >

  <meta
    property="og:site_name"
    content="ATEO STORE"
  >

  <meta
    name="twitter:card"
    content="summary_large_image"
  >

  <meta
    name="twitter:title"
    content="${escaparHTML(titulo)}"
  >

  <meta
    name="twitter:description"
    content="${descripcion}"
  >

  <meta
    name="twitter:image"
    content="${escaparHTML(imagen)}"
  >

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080808;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    }

    main {
      width: min(90%, 420px);
      padding: 24px;
    }

    img {
      width: 100%;
      max-height: 360px;
      object-fit: contain;
      border-radius: 18px;
    }

    h1 {
      margin: 20px 0 10px;
    }

    p {
      opacity: .75;
      white-space: pre-line;
    }

    a {
      display: inline-block;
      margin-top: 18px;
      padding: 13px 20px;
      border-radius: 12px;
      background: #ffffff;
      color: #111;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <main>

    ${
      imagen
        ? `<img src="${escaparHTML(imagen)}" alt="${nombre}">`
        : ""
    }

    <h1>${nombre}</h1>

    ${
      descripcion
        ? `<p>${descripcion}</p>`
        : ""
    }

    <a href="${escaparHTML(catalogoURL)}">
      VER PRODUCTO EN ATEO STORE
    </a>

  </main>


</body>
</html>`;

        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=UTF-8",
            "Cache-Control": "public, max-age=60"
          }
        });

      } catch (error) {

        return new Response(
          "Error al generar producto: " +
          String(error?.message || error),
          {
            status: 500,
            headers: {
              "Content-Type": "text/plain; charset=UTF-8"
            }
          }
        );
      }
    }


    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const body = await request.json();

        if (
          body.usuario === "admin" &&
          body.password === "ateo123"
        ) {
          return Response.json({
            ok: true,
            mensaje: "Login correcto"
          });
        }

        return Response.json(
          {
            ok: false,
            mensaje: "Usuario o contraseña incorrectos"
          },
          { status: 401 }
        );
      } catch {
        return Response.json(
          {
            ok: false,
            mensaje: "JSON inválido"
          },
          { status: 400 }
        );
      }
    }

    if (url.pathname === "/api/productos" && request.method === "POST") {
      try {
        const body = await request.json();

        const esGratis = Boolean(body.gratis);

        if (!body.nombre) {
          return Response.json(
            { ok: false, mensaje: "El nombre es obligatorio" },
            { status: 400 }
          );
        }

        if (!esGratis && !body.precios) {
          return Response.json(
            { ok: false, mensaje: "Los precios son obligatorios para productos de pago" },
            { status: 400 }
          );
        }

        if (esGratis && !body.urlGratis) {
          return Response.json(
            { ok: false, mensaje: "La URL de obtención es obligatoria para productos gratis" },
            { status: 400 }
          );
        }

        const resultado = await env.DB
          .prepare(
            "INSERT INTO productos (nombre, descripcion, imagen, precios, tiktok, gratis, urlGratis) VALUES (?, ?, ?, ?, ?, ?, ?)"
          )
          .bind(
            body.nombre,
            body.descripcion || "",
            body.imagen || "",
            JSON.stringify(body.precios || []),
            body.tiktok || "#",
            body.gratis ? 1 : 0,
            body.urlGratis || ""
          )
          .run();

        return Response.json({
          ok: true,
          mensaje: "Producto creado",
          id: resultado.meta.last_row_id
        });

      } catch (error) {
        return Response.json(
          {
            ok: false,
            mensaje: "Error al crear producto",
            error: error.message
          },
          { status: 500 }
        );
      }
    }

    if (url.pathname === "/api/productos" && request.method === "GET") {
      const { results } = await env.DB
        .prepare(
          "SELECT id, nombre, descripcion, imagen, precios, tiktok, gratis, urlGratis FROM productos ORDER BY id"
        )
        .all();

      const productos = results.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        imagen: p.imagen || "",
        precios: JSON.parse(p.precios),
        tiktok: p.tiktok || "#",
        gratis: Boolean(p.gratis),
        urlGratis: p.urlGratis || ""
      }));

      return Response.json({
        ok: true,
        productos
      });
    }


    if (url.pathname === "/api/productos" && request.method === "PUT") {
      try {
        const body = await request.json();

        const esGratis = Boolean(body.gratis);

        if (!body.id || !body.nombre) {
          return Response.json(
            { ok: false, mensaje: "ID y nombre son obligatorios" },
            { status: 400 }
          );
        }

        if (!esGratis && !body.precios) {
          return Response.json(
            { ok: false, mensaje: "Los precios son obligatorios para productos de pago" },
            { status: 400 }
          );
        }

        if (esGratis && !body.urlGratis) {
          return Response.json(
            { ok: false, mensaje: "La URL de obtención es obligatoria para productos gratis" },
            { status: 400 }
          );
        }

        await env.DB
          .prepare(
            "UPDATE productos SET nombre = ?, descripcion = ?, imagen = ?, precios = ?, tiktok = ?, gratis = ?, urlGratis = ? WHERE id = ?"
          )
          .bind(
            body.nombre,
            body.descripcion || "",
            body.imagen || "",
            JSON.stringify(body.precios || []),
            body.tiktok || "#",
            body.gratis ? 1 : 0,
            body.urlGratis || "",
            body.id
          )
          .run();

        return Response.json({
          ok: true,
          mensaje: "Producto actualizado"
        });
      } catch (error) {
        return Response.json(
          {
            ok: false,
            mensaje: "Error al actualizar producto",
            error: String(error?.message || error)
          },
          { status: 500 }
        );
      }
    }

    if (url.pathname === "/api/productos" && request.method === "DELETE") {
      try {
        const body = await request.json();

        if (!body.id) {
          return Response.json(
            { ok: false, mensaje: "Falta el id" },
            { status: 400 }
          );
        }

        await env.DB
          .prepare("DELETE FROM productos WHERE id = ?")
          .bind(body.id)
          .run();

        return Response.json({
          ok: true,
          mensaje: "Producto eliminado"
        });
      } catch {
        return Response.json(
          { ok: false, mensaje: "Error al eliminar producto" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

// Forzar nuevo despliegue Cloudflare

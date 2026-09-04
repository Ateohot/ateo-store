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

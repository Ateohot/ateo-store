export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

        if (!body.nombre || !body.precios) {
          return Response.json(
            { ok: false, mensaje: "Faltan datos" },
            { status: 400 }
          );
        }

        const resultado = await env.DB
          .prepare(
            "INSERT INTO productos (nombre, descripcion, imagen, precios, tiktok) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(
            body.nombre,
            body.descripcion || "",
            body.imagen || "",
            JSON.stringify(body.precios),
            body.tiktok || "#"
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
          "SELECT id, nombre, descripcion, imagen, precios, tiktok FROM productos ORDER BY id"
        )
        .all();

      const productos = results.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        imagen: p.imagen || "",
        precios: JSON.parse(p.precios),
        tiktok: p.tiktok || "#"
      }));

      return Response.json({
        ok: true,
        productos
      });
    }


    if (url.pathname === "/api/productos" && request.method === "PUT") {
      try {
        const body = await request.json();

        if (!body.id || !body.nombre || !body.precios) {
          return Response.json(
            { ok: false, mensaje: "Faltan datos" },
            { status: 400 }
          );
        }

        await env.DB
          .prepare(
            "UPDATE productos SET nombre = ?, descripcion = ?, imagen = ?, precios = ?, tiktok = ? WHERE id = ?"
          )
          .bind(
            body.nombre,
            body.descripcion || "",
            body.imagen || "",
            JSON.stringify(body.precios),
            body.tiktok || "#",
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

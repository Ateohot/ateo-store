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

    return env.ASSETS.fetch(request);
  }
};

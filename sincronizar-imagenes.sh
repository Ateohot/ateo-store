#!/data/data/com.termux/files/usr/bin/bash

ORIGEN="$HOME/storage/shared/Pictures/ATEOImages"
DESTINO="$HOME/ateo-store/public/images"

mkdir -p "$DESTINO"

for archivo in "$ORIGEN"/*; do
    [ -f "$archivo" ] || continue

    nombre="$(basename "$archivo")"

    if [ ! -f "$DESTINO/$nombre" ]; then
        cp "$archivo" "$DESTINO/$nombre"
        echo "Imagen copiada: $nombre"
    fi
done

cd "$HOME/ateo-store" || exit 1

git add public/images

if git diff --cached --quiet; then
    echo "No hay imágenes nuevas para subir."
    exit 0
fi

git commit -m "Agregar imágenes de productos"
git push origin main

#!/data/data/com.termux/files/usr/bin/bash

CARPETA="$HOME/storage/shared/Pictures/ATEOImages"

echo "Vigilando imágenes en:"
echo "$CARPETA"
echo "Pulsa Ctrl+C para detener."

inotifywait -m -e close_write,moved_to,create \
    --format '%f' \
    "$CARPETA" |
while read archivo; do

    case "$archivo" in
        *.jpg|*.jpeg|*.png|*.webp|*.JPG|*.JPEG|*.PNG|*.WEBP)
            echo "Nueva imagen detectada: $archivo"
            "$HOME/ateo-store/sincronizar-imagenes.sh"
            ;;
    esac

done

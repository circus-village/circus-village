#!/usr/bin/env bash

INPUT=src/assets/img/gallery
OUTPUT=target

mkdir -p $OUTPUT

i=1

for f in src/assets/img/gallery/*; do
  dest="$OUTPUT/$i.jpg"
  convert -density 72 -resize 1024x "$f" $dest
  ((i++))
done

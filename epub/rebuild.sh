#!/bin/bash

rm Synth\ Secrets.epub
zip -X Synth\ Secrets.epub mimetype
zip -rg Synth\ Secrets.epub META-INF -x \*.DS_Store
zip -rg Synth\ Secrets.epub OPS -x \*.DS_Store

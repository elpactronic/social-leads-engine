---
name: generate-landing
description: Genera una landing page HTML simple con el catálogo de propiedades disponibles o productos del rubro. Usar cuando el usuario quiere una página para compartir por WhatsApp o poner en el bio. Modo intermedio.
allowed-tools: Read, Write(content/landings/**), Bash(npx tsx *)
---

# Generar landing page

## Leer contexto

1. Leer `config/rubro.yaml` para obtener: nombre_negocio, contacto, brand.
2. Si rubro es `inmuebles`: leer todas las propiedades en `content/propiedades/` con `estado: disponible`.
3. Para otros rubros: pedir al usuario que liste los productos/servicios a mostrar.

## Estructura de la landing

HTML simple, sin framework. Estilos inline o bloque `<style>`. Sin JS externo.

Secciones:
1. Header: nombre del negocio + logo/color de marca
2. Hero: frase corta + CTA a WhatsApp
3. Catálogo:
   - Para inmuebles: cards con foto, tipo, zona, precio, botón "Consultar"
   - Para productos: cards con foto, nombre, precio, botón "Pedir"
4. Footer: contacto (WhatsApp, Instagram, ciudad)

Cada botón "Consultar" / "Pedir" abre: `wa.me/<numero>?text=<mensaje precargado por propiedad o producto>`

## Guardar

Guardar en `content/landings/<rubro>-<fecha>.html`.
Abrir en el navegador si es posible.

## Informar al usuario

- Ruta del archivo generado
- Cómo compartirlo: "Podés subirlo a GitHub Pages, Netlify Drop, o simplemente compartirlo por WhatsApp como archivo."
- Nota: esta es una landing estática. Para actualizarla, volver a ejecutar `/generate-landing`.

## Limitaciones

- No incluye formularios de captura (requeriría backend).
- No tiene SEO ni analytics sin integración adicional.
- Para landing dinámica con formulario: documentar integración con Netlify Forms o similar (TODO v0.2).

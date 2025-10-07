# Vibecoding Clase 4 — Starter (React + Vite)

Proyecto base **intencionalmente monolítico** para practicar **refactorización masiva**.
La lógica de negocio, formato, logs y estado están mezclados en `src/App.jsx`.

## Requisitos
- Node.js 18+
- npm

## Cómo ejecutar
```bash
npm install
npm run dev
```
Abre http://localhost:5173

## Caso de referencia (smoke manual)
Agrega al carrito: Mouse (20), Teclado (35), Monitor (150).
Marca "Usuario Premium".
Selecciona cupón "PROMO10".
Región: "CR".
**Total esperado:** ~ $198.06

## Tu misión
1. Extrae utilidades (`formatCurrency`, logs).
2. Extrae dominio (subtotal, descuentos, cupones, impuestos) en `src/domain/`.
3. Implementa inyección de dependencias (política de impuestos).
4. Divide UI en componentes (`ProductList`, `Cart`, `Checkout`).
5. Mantén el total del smoke (~198.06).

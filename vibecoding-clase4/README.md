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

## Reto A — Política TEST (0% impuestos)

Descripción:

- Se añadió una política de impuestos personalizada `TEST` que aplica 0% de impuestos.
- El objetivo es poder calcular el total final sin impuestos para la región `TEST`.

Archivos modificados principales:

- `src/domain/policies/taxPolicy.js`: se añadió `taxPolicies.TEST = { id: 'TEST', rate: 0 }`.
- `src/domain/calculations.js`: `calcTotalNumber(items, user, coupon, taxPolicy)` acepta políticas y calcula impuestos usando la `rate` de la policy.
- `src/components/Checkout.jsx`: se agregó la opción de región `TEST` en el selector de regiones.
- `src/App.jsx`: mapea la región `TEST` a `taxPolicies.TEST` y usa la policy en los cálculos.
- `src/domain/calculations.test.js`: tests que verifican el resultado con `taxPolicies.CR` y con `taxPolicies.TEST`.

Cómo verificar localmente:

1. Instala dependencias y arranca la app (para ver la UI):

```bash
npm install
npm run dev
```

2. O ejecuta el test de cálculo rápido (Node):

```bash
node src/domain/calculations.test.js
```

Salida esperada del test:

```
PASS calcTotalNumber produces expected total: 198.06
PASS calcTotalNumber with TEST policy produces expected total: 175.28
```

Notas:

- El total sin impuestos (TEST) se obtiene aplicando primero descuentos de usuario y cupones y luego no sumando impuestos (rate 0). Con los datos de ejemplo el total es `175.28`.
- Si quieres que la política TEST sea la predeterminada, puedes seleccionarla en el selector de `Región` en la UI (opción `TEST`).


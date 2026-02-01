# 🧪 Tests y Verificaciones

Esta carpeta contiene todos los archivos de pruebas, demos y verificaciones del proyecto Clean Architecture + RETOS.

## 📋 Organización de Archivos

### 🔬 Pruebas Unitarias
- **`smokeTests.js`** - Suite completo de 20 pruebas unitarias (100% éxito)
  - Pruebas de funciones puras de checkout
  - Validación de políticas de impuestos
  - Verificación de aplicación de cupones

### 🎯 RETO A - TestRegionTaxPolicy (0% impuestos)
- **`verificarRetoA.js`** - Verificación completa del RETO A
- **`testRapidoRetoA.js`** - Tests rápidos específicos
- **`testRetoA.js`** - Tests detallados del RETO A
- **`ejecutarRetoA.js`** - Demo ejecutable del RETO A
- **`retoA_TestRegionDemo.js`** - Demostración interactiva
- **`demoRetoA_InterfazWeb.js`** - Guía para interfaz web

### 🎁 RETO B - BOGO_HALF (Buy One Get One Half)
- **`testRetoB.js`** - Tests del cupón BOGO_HALF
- **`ejecutarRetoB.js`** - Demo ejecutable del RETO B
- **`retoB_BogoHalfDocumentation.js`** - Documentación detallada

### 📦 RETO C - Catalog Service
- **`ejecutarRetoC.js`** - Demo del servicio de catálogo
- **`retoC_CatalogServiceDocumentation.js`** - Documentación del servicio

## 🚀 Cómo Ejecutar

### Ejecutar todas las pruebas unitarias
```bash
node tests/smokeTests.js
```

### Verificar RETO A
```bash
node tests/verificarRetoA.js
node tests/testRapidoRetoA.js
node tests/demoRetoA_InterfazWeb.js
```

### Demostrar RETO B
```bash
node tests/ejecutarRetoB.js
```

### Demostrar RETO C
```bash
node tests/ejecutarRetoC.js
```

### Ejecutar demos interactivos
```bash
node tests/retoA_TestRegionDemo.js
node tests/retoB_BogoHalfDocumentation.js
node tests/retoC_CatalogServiceDocumentation.js
```

## 📊 Resultados Esperados

- **Todas las pruebas**: ✅ 100% éxito
- **RETO A**: Impuesto 0% para región TEST
- **RETO B**: Segundo producto 50% descuento
- **RETO C**: Estados de carga manejados correctamente

## 🏗️ Estructura de Pruebas

Los archivos están organizados por:
1. **Tipo**: Pruebas unitarias vs demos vs verificaciones
2. **RETO**: Agrupados por funcionalidad (A, B, C)
3. **Propósito**: Ejecución rápida vs documentación detallada

---

**Nota**: Todos los archivos mantienen compatibilidad con las rutas relativas del proyecto.
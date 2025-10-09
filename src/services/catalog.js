/**
 * RETO C - Servicio de Catálogo
 * 
 * Extrae la funcionalidad de fetchProducts a un servicio dedicado con manejo
 * completo de estados de carga y error, siguiendo Clean Architecture.
 * 
 * RESPONSABILIDADES:
 * - Simular API de productos con realistic delays
 * - Manejo robusto de estados: loading, success, error
 * - Retry logic para recuperación de errores
 * - Logging detallado para debugging
 * - Validación de datos recibidos
 * 
 * ARQUITECTURA:
 * - Capa de Servicios: Comunicación con APIs externas
 * - Estados bien definidos para UI responsiva
 * - Error handling con información detallada
 * - Compatibilidad con el sistema de logging existente
 * 
 * @module CatalogService
 * @version 1.0.0
 * @author Juan Alberto Quiros Gonzalez
 */

import { logInfo, logWarn, logFinancialCalculation } from '../utils/log.js';

/**
 * Estados posibles del servicio de catálogo
 */
export const CATALOG_STATES = {
  IDLE: 'idle',           // Estado inicial
  LOADING: 'loading',     // Cargando productos
  SUCCESS: 'success',     // Productos cargados exitosamente
  ERROR: 'error'          // Error al cargar productos
};

/**
 * Tipos de errores del catálogo
 */
export const CATALOG_ERRORS = {
  NETWORK_ERROR: 'network_error',
  TIMEOUT_ERROR: 'timeout_error',
  VALIDATION_ERROR: 'validation_error',
  UNKNOWN_ERROR: 'unknown_error'
};

/**
 * Configuración del servicio de catálogo
 */
const CATALOG_CONFIG = {
  // Simular delay de red realista (500ms - 2s)
  MIN_DELAY: 500,
  MAX_DELAY: 2000,
  
  // Probabilidad de error simulado (5% para testing)
  ERROR_PROBABILITY: 0.05,
  
  // Timeout para requests
  REQUEST_TIMEOUT: 5000,
  
  // Intentos de retry
  MAX_RETRIES: 3
};

/**
 * Datos mock de productos
 * En una aplicación real, esto vendría de una API externa
 */
const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'Mouse Inalámbrico', 
    price: 20,
    category: 'Periféricos',
    inStock: true,
    description: 'Mouse inalámbrico ergonómico con sensor óptico'
  },
  { 
    id: 2, 
    name: 'Teclado Mecánico', 
    price: 35,
    category: 'Periféricos', 
    inStock: true,
    description: 'Teclado mecánico con switches azules'
  },
  { 
    id: 3, 
    name: 'Monitor LED 24"', 
    price: 150,
    category: 'Monitores',
    inStock: true,
    description: 'Monitor LED Full HD de 24 pulgadas'
  },
  {
    id: 4,
    name: 'Audífonos USB',
    price: 45,
    category: 'Audio',
    inStock: true,
    description: 'Audífonos USB con micrófono incorporado'
  }
];

/**
 * Simula delay de red realista
 * 
 * @param {number} min - Delay mínimo en ms
 * @param {number} max - Delay máximo en ms
 * @returns {Promise} Promise que resuelve después del delay
 */
function simulateNetworkDelay(min = CATALOG_CONFIG.MIN_DELAY, max = CATALOG_CONFIG.MAX_DELAY) {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simula errores aleatorios para testing de error handling
 * 
 * @returns {boolean} True si debe simular un error
 */
function shouldSimulateError() {
  return Math.random() < CATALOG_CONFIG.ERROR_PROBABILITY;
}

/**
 * Valida la estructura de un producto
 * 
 * @param {Object} product - Producto a validar
 * @returns {boolean} True si el producto es válido
 */
function validateProduct(product) {
  if (!product || typeof product !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'price'];
  return requiredFields.every(field => 
    product.hasOwnProperty(field) && 
    product[field] !== null && 
    product[field] !== undefined
  );
}

/**
 * Valida array de productos
 * 
 * @param {Array} products - Array de productos a validar
 * @returns {Object} Resultado de validación
 */
function validateProducts(products) {
  if (!Array.isArray(products)) {
    return { 
      isValid: false, 
      error: 'Products must be an array',
      errorType: CATALOG_ERRORS.VALIDATION_ERROR
    };
  }
  
  const invalidProducts = products.filter(product => !validateProduct(product));
  
  if (invalidProducts.length > 0) {
    return { 
      isValid: false, 
      error: `Invalid products found: ${invalidProducts.length}`,
      errorType: CATALOG_ERRORS.VALIDATION_ERROR,
      details: invalidProducts
    };
  }
  
  return { isValid: true };
}

/**
 * RETO C - Función principal para obtener productos del catálogo
 * 
 * Simula una llamada a API externa con manejo completo de estados.
 * Incluye delay realista, manejo de errores, validación y logging.
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} options.retryCount - Número de retry actual
 * @returns {Promise<Object>} Promise con resultado del servicio
 * 
 * @example
 * const result = await fetchProducts();
 * if (result.state === CATALOG_STATES.SUCCESS) {
 *   console.log('Productos:', result.data);
 * } else if (result.state === CATALOG_STATES.ERROR) {
 *   console.error('Error:', result.error);
 * }
 */
export async function fetchProducts({ retryCount = 0 } = {}) {
  const startTime = Date.now();
  
  logInfo('Iniciando carga de productos del catálogo', {
    attempt: retryCount + 1,
    maxRetries: CATALOG_CONFIG.MAX_RETRIES
  });
  
  try {
    // Simular delay de red
    await simulateNetworkDelay();
    
    // Simular error ocasional para testing
    if (shouldSimulateError() && retryCount === 0) {
      throw new Error('Simulated network error for testing');
    }
    
    // Simular obtención de datos de API
    const products = [...MOCK_PRODUCTS]; // Clone para evitar mutaciones
    
    // Validar datos recibidos
    const validation = validateProducts(products);
    if (!validation.isValid) {
      logWarn('Validación de productos falló', validation);
      return {
        state: CATALOG_STATES.ERROR,
        error: validation.error,
        errorType: validation.errorType,
        details: validation.details,
        timestamp: new Date().toISOString()
      };
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logInfo('Productos cargados exitosamente', {
      count: products.length,
      duration: `${duration}ms`,
      attempt: retryCount + 1
    });
    
    return {
      state: CATALOG_STATES.SUCCESS,
      data: products,
      metadata: {
        count: products.length,
        loadTime: duration,
        timestamp: new Date().toISOString(),
        attempt: retryCount + 1
      }
    };
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logWarn('Error cargando productos del catálogo', {
      error: error.message,
      duration: `${duration}ms`,
      attempt: retryCount + 1,
      willRetry: retryCount < CATALOG_CONFIG.MAX_RETRIES
    });
    
    // Intentar retry si no hemos excedido el máximo
    if (retryCount < CATALOG_CONFIG.MAX_RETRIES) {
      logInfo(`Reintentando carga de productos (${retryCount + 1}/${CATALOG_CONFIG.MAX_RETRIES})`);
      return await fetchProducts({ retryCount: retryCount + 1 });
    }
    
    // Determinar tipo de error
    let errorType = CATALOG_ERRORS.UNKNOWN_ERROR;
    if (error.message.includes('network')) {
      errorType = CATALOG_ERRORS.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      errorType = CATALOG_ERRORS.TIMEOUT_ERROR;
    }
    
    return {
      state: CATALOG_STATES.ERROR,
      error: error.message,
      errorType,
      metadata: {
        duration,
        attempts: retryCount + 1,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Hook personalizado para usar el servicio de catálogo en componentes React
 * 
 * Proporciona estado y funciones para manejar la carga de productos
 * de manera declarativa en componentes.
 * 
 * @returns {Object} Estado y funciones del catálogo
 * 
 * @example
 * const { products, state, error, reload } = useCatalogService();
 * 
 * if (state === CATALOG_STATES.LOADING) return <div>Cargando...</div>;
 * if (state === CATALOG_STATES.ERROR) return <div>Error: {error}</div>;
 * return <ProductList products={products} />;
 */
export function createCatalogState() {
  return {
    state: CATALOG_STATES.IDLE,
    products: [],
    error: null,
    errorType: null,
    metadata: null,
    isLoading: false,
    hasError: false,
    hasData: false
  };
}

/**
 * Utilidad para verificar si el estado es de carga
 * 
 * @param {string} state - Estado actual del catálogo
 * @returns {boolean} True si está cargando
 */
export function isLoadingState(state) {
  return state === CATALOG_STATES.LOADING;
}

/**
 * Utilidad para verificar si hay error
 * 
 * @param {string} state - Estado actual del catálogo
 * @returns {boolean} True si hay error
 */
export function isErrorState(state) {
  return state === CATALOG_STATES.ERROR;
}

/**
 * Utilidad para verificar si la carga fue exitosa
 * 
 * @param {string} state - Estado actual del catálogo
 * @returns {boolean} True si fue exitoso
 */
export function isSuccessState(state) {
  return state === CATALOG_STATES.SUCCESS;
}

/**
 * Formateador de mensajes de error para mostrar al usuario
 * 
 * @param {string} errorType - Tipo de error
 * @param {string} error - Mensaje de error
 * @returns {string} Mensaje formateado para el usuario
 */
export function formatCatalogError(errorType, error) {
  switch (errorType) {
    case CATALOG_ERRORS.NETWORK_ERROR:
      return 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
    case CATALOG_ERRORS.TIMEOUT_ERROR:
      return 'La solicitud tardó demasiado. Intente nuevamente.';
    case CATALOG_ERRORS.VALIDATION_ERROR:
      return 'Error en los datos recibidos. Contacte al soporte técnico.';
    default:
      return `Error inesperado: ${error}. Intente nuevamente.`;
  }
}
// Definir las URLs de la API para productos y carrito de compras
const API_URL = '/api/products'; // URL de la API para obtener los productos
const CART_API_URL = '/api/cart'; // URL de la API para manejar el carrito de compras
const productsContainer = document.getElementById('products-container'); // Contenedor de productos en el DOM

/**
 * Función para mostrar un mensaje de alerta en la página.
 * @param {string} message - El mensaje a mostrar.
 * @param {boolean} [isError=false] - Indica si el mensaje es un error (true) o un éxito (false).
 */
const showMessage = (message, isError = false) => {
    const alert = document.createElement('div'); // Crear un nuevo div para la alerta
    alert.className = `message ${isError ? 'error-message' : 'success-message'}`; // Establecer clases según el tipo de mensaje
    alert.textContent = message; // Asignar el texto al mensaje
    alert.style.position = 'fixed';
    alert.style.right = '25px';
    alert.style.top = '25px';
    alert.style.borderRadius = '6px';
    alert.style.padding = '15px';
    alert.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    alert.style.color = isError ? '#721c24' : '#155724';
    alert.style.border = `1px solid ${isError ? '#f5c6cb' : '#c3e6cb'}`;
    alert.style.zIndex = '1000';

    document.body.appendChild(alert); // Añadir la alerta al cuerpo del documento

    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => alert.remove(), 3000);
};

/**
 * Función para renderizar la lista de productos en el DOM.
 * @param {Array} products - Lista de productos a renderizar.
 */
const renderProducts = (products) => {
    if (!productsContainer) return; // Verificar si el contenedor de productos existe

    productsContainer.innerHTML = ''; // Limpiar los productos existentes en el contenedor

    // Crear y agregar cada producto al contenedor
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-card');

        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <span class="button-text">Agregar al carrito</span>
                    <span class="loading-spinner" style="display: none;">↻</span>
                </button>
            </div>
        `;

        productsContainer.appendChild(productElement);

        // Asignar evento al botón de agregar al carrito
        const addButton = productElement.querySelector('.add-to-cart-btn');
        addButton.addEventListener('click', async (e) => {
            e.preventDefault();
            await addToCart(product.id, products, addButton);
        });
    });
};

/**
 * Función para verificar si el usuario está autenticado.
 * Si no está autenticado, redirige a la página de inicio de sesión.
 * @returns {string|false} - El token de autenticación si está presente, o false si no está.
 */
const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/userLogin'; // Redirigir a la página de inicio de sesión si no hay token
        return false;
    }
    return token;
};

/**
 * Función para cambiar el estado del botón (cargando/no cargando).
 * @param {HTMLElement} button - El botón que se debe modificar.
 * @param {boolean} isLoading - Indica si el botón está en estado de carga (true) o no (false).
 */
const toggleButtonLoading = (button, isLoading) => {
    const buttonText = button.querySelector('.button-text');
    const loadingSpinner = button.querySelector('.loading-spinner');

    button.disabled = isLoading; // Deshabilitar el botón mientras se carga
    buttonText.style.display = isLoading ? 'none' : 'inline'; // Mostrar/ocultar el texto del botón
    loadingSpinner.style.display = isLoading ? 'inline' : 'none'; // Mostrar/ocultar el spinner de carga
};

/**
 * Función para agregar un producto al carrito.
 * @param {number} productId - ID del producto que se va a agregar.
 * @param {Array} products - Lista de productos disponibles.
 * @param {HTMLElement} button - El botón que activó la acción.
 */
const addToCart = async (productId, products, button) => {
    const token = checkAuthentication();
    if (!token) return;

    try {
        toggleButtonLoading(button, true); // Activar el estado de carga en el botón

        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const response = await fetch(`${CART_API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Enviar el token de autenticación en el encabezado
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error('Error al agregar al carrito');
        }

        const updatedCart = await response.json();
        showMessage(`¡${product.name} agregado al carrito!`); // Mostrar mensaje de éxito

        // Actualizar el contador del carrito
        updateCartCounter(updatedCart.length);

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, true); // Mostrar mensaje de error si ocurre una excepción
    } finally {
        toggleButtonLoading(button, false); // Desactivar el estado de carga en el botón
    }
};

/**
 * Función para actualizar el contador de productos en el carrito.
 * @param {number} itemCount - Número de artículos en el carrito.
 */
const updateCartCounter = (itemCount) => {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.textContent = itemCount;
        cartCounter.style.display = itemCount > 0 ? 'block' : 'none'; // Mostrar/ocultar el contador
    }
};

/**
 * Función para obtener los productos desde la API y renderizarlos en la página.
 */
const fetchProducts = async () => {
    try {
        const response = await fetch(API_URL); // Obtener productos desde la API
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        const products = await response.json();
        renderProducts(products); // Renderizar los productos en la página
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        showMessage('Error al cargar los productos', true); // Mostrar mensaje de error
    }
};

/**
 * Función para cargar el contador del carrito al inicio de la página.
 */
const loadCartCounter = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(CART_API_URL, {
            headers: {
                'Authorization': `Bearer ${token}` // Enviar el token de autenticación
            }
        });

        if (response.ok) {
            const cartItems = await response.json();
            updateCartCounter(cartItems.length); // Actualizar el contador del carrito
        }
    } catch (error) {
        console.error('Error al cargar el contador del carrito:', error);
    }
};

// Inicialización: ejecutar las funciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(); // Obtener y mostrar los productos
    loadCartCounter(); // Cargar el contador del carrito
});

// Función para manejar el cierre de sesión
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('token'); // Eliminar el token de autenticación
        window.location.href = '/userLogin'; // Redirigir a la página de inicio de sesión
    });
};

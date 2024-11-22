// Constantes
const API_URL = '/api/products';
const CART_API_URL = '/api/cart';
const productsContainer = document.getElementById('products-container');


// Función para mostrar mensajes de alerta personalizados
const showMessage = (message, isError = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '15px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    messageDiv.style.color = isError ? '#721c24' : '#155724';
    messageDiv.style.border = `1px solid ${isError ? '#f5c6cb' : '#c3e6cb'}`;
    messageDiv.style.zIndex = '1000';

    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3001);
};

// Función para renderizar productos
const renderProducts = (products) => {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = ''; // Limpia el contenedor

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">
                    <span class="button-text">Agregar al carrito</span>
                    <span class="loading-spinner" style="display: none;">
                        ↻
                    </span>
                </button>
            </div>
        `;

        productsContainer.appendChild(productCard);

        // Agregar evento al botón
        const addButton = productCard.querySelector('.add-to-cart-btn');
        addButton.addEventListener('click', async (event) => {
            event.preventDefault();
            await addToCart(product.id, products, addButton);
        });
    });
};

// Función para verificar el token
const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/userLogin.html';
        return false;
    }
    return token;
};

// Función para manejar el estado de carga del botón
const toggleButtonLoading = (button, isLoading) => {
    const buttonText = button.querySelector('.button-text');
    const loadingSpinner = button.querySelector('.loading-spinner');
    
    button.disabled = isLoading;
    buttonText.style.display = isLoading ? 'none' : 'inline';
    loadingSpinner.style.display = isLoading ? 'inline' : 'none';
};

// Función para agregar al carrito
const addToCart = async (productId, products, button) => {
    const token = checkAuthentication();
    if (!token) return;

    try {
        toggleButtonLoading(button, true);

        const product = products.find(p => p.id === productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const response = await fetch(`${CART_API_URL}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error('Error al agregar al carrito');
        }

        const updatedCart = await response.json();
        showMessage(`¡${product.name} agregado al carrito exitosamente!`);

        // Actualizar el contador del carrito si existe
        updateCartCounter(updatedCart.length);

    } catch (error) {
        console.error('Error:', error);
        showMessage(error.message, true);
    } finally {
        toggleButtonLoading(button, false);
    }
};


// Función para actualizar el contador del carrito
const updateCartCounter = (itemCount) => {
    const cartCounter = document.getElementById('cart-counter');
    if (cartCounter) {
        cartCounter.textContent = itemCount;
        cartCounter.style.display = itemCount > 0 ? 'block' : 'none';
    }
};


// Función para obtener productos del backend
const fetchProducts = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener productos');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        showMessage('Error al cargar los productos', true);
    }
};

// Función para cargar el contador inicial del carrito
const loadCartCounter = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(CART_API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const cartItems = await response.json();
            updateCartCounter(cartItems.length);
        }
    } catch (error) {
        console.error('Error al cargar el contador del carrito:', error);
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadCartCounter();
});

// Manejar el cierre de sesión si existe el botón
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/views/login.html';
    });
}
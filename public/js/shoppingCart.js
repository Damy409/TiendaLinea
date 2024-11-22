/**
 * Carrito de Compras - Interacciones en el cliente.
 * 
 * Este script maneja las operaciones del carrito de compras en la interfaz del usuario,
 * como cargar productos, actualizar cantidades, realizar el checkout y visualizar facturas.
 * También incluye el manejo del token JWT para autenticación y eventos de interacción.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const cartContainer = document.getElementById('cart-container'); // Contenedor del carrito.
    const cartTotalElement = document.getElementById('cart-total'); // Total del carrito.
    const checkoutBtn = document.getElementById('checkout-btn'); // Botón de compra.
    const billsBtn = document.getElementById('bills-btn'); // Botón para ver facturas.
    const billsModal = document.getElementById('bills-modal'); // Modal de facturas.
    const billsList = document.getElementById('bills-list'); // Lista de facturas.
    const closeBillsBtn = document.getElementById('close-bills'); // Botón para cerrar el modal de facturas.

    /**
     * Carga los productos del carrito del usuario autenticado.
     */
    async function loadCart() {
        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const cartItems = await response.json();
            renderCart(cartItems); // Renderiza los productos en el DOM.
        } catch (error) {
            console.error('Error:', error);
        }
    }

    /**
     * Renderiza los productos del carrito en el DOM.
     * 
     * @param {Array} items - Lista de productos en el carrito.
     */
    function renderCart(items) {
        cartContainer.innerHTML = ''; // Limpia el contenedor del carrito.
        let total = 0;

        if (items.length === 0) {
            // Si el carrito está vacío.
            cartContainer.innerHTML = '<div class="empty-cart">carrito vacío</div>';
            cartTotalElement.textContent = '0.00';
            return;
        }

        // Renderiza cada producto en el carrito.
        items.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>Precio: $${item.price}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <p>Subtotal: $${item.price * item.quantity}</p>
                </div>
            `;
            cartContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity; // Calcula el total del carrito.
        });

        cartTotalElement.textContent = total.toFixed(2); // Muestra el total en el DOM.
    }

    /**
     * Actualiza la cantidad de un producto en el carrito.
     * 
     * @param {string} productId - ID del producto a actualizar.
     * @param {number} newQuantity - Nueva cantidad del producto.
     */
    async function updateQuantity(productId, newQuantity) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ productId, quantity: newQuantity })
            });
            const updatedCart = await response.json();
            renderCart(updatedCart); // Actualiza el carrito en el DOM.
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
        }
    }

    /**
     * Realiza el checkout del carrito, generando una factura.
     */
    async function checkout() {
        try {
            const userEmail = parseJwt(localStorage.getItem('token')).email; // Extrae el email del token.
            const cartResponse = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const cartItems = await cartResponse.json();

            const billData = {
                userEmail: userEmail,
                items: cartItems,
                total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                date: new Date().toISOString()
            };

            const billResponse = await fetch('/api/bills/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(billData)
            });

            if (billResponse.ok) {
                alert('Compra realizada');
                renderCart([]); // Limpia el carrito tras la compra.
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    /**
     * Muestra las facturas del usuario en un modal.
     */
    async function showBills() {
        try {
            const response = await fetch('/api/bills', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const bills = await response.json();

            // Renderiza las facturas en el modal.
            billsList.innerHTML = bills.map(bill => `
                <div>
                    <h3>Factura - ${new Date(bill.date).toLocaleDateString()}</h3>
                    <p>Total: $${bill.total}</p>
                    <details>
                        <summary>Detalles de la compra</summary>
                        ${bill.items.map(item => `
                            <p>${item.name} - Cantidad: ${item.quantity} - Subtotal: $${item.price * item.quantity}</p>
                        `).join('')}
                    </details>
                </div>
            `).join('');

            billsModal.style.display = 'block'; // Muestra el modal.
        } catch (error) {
            console.error('Error cargando las facturas:', error);
        }
    }

    /**
     * Decodifica un token JWT.
     * 
     * @param {string} token - Token JWT.
     * @returns {Object} Información decodificada del token.
     */
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    // Event listeners
    checkoutBtn.addEventListener('click', checkout); // Listener para el botón de compra.
    billsBtn.addEventListener('click', showBills); // Listener para mostrar facturas.
    closeBillsBtn.addEventListener('click', () => {
        billsModal.style.display = 'none'; // Cierra el modal de facturas.
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token'); // Elimina el token del almacenamiento local.
        window.location.href = '/userLogin'; // Redirige a la página de login.
    });

    // Cargar carrito al iniciar la página.
    loadCart();
    window.updateQuantity = updateQuantity; // Hace accesible `updateQuantity` globalmente.
});

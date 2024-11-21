// Esperar a que el contenido del documento esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const billsBtn = document.getElementById('bills-btn');
    const billsModal = document.getElementById('bills-modal');
    const billsList = document.getElementById('bills-list');
    const closeBillsBtn = document.getElementById('close-bills');
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');


    // Cargar el carrito de compras desde la API
    async function loadCart() {
        try {
            // Obtener los artículos del carrito desde la API
            const cartResponse = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            // Convertir la respuesta en formato JSON
            const cartItems = await cartResponse.json();
            // Renderizar los artículos del carrito
            renderCart(cartItems);
        } catch (err) {
            console.error('Error al cargar el carrito:', err);
        }
    }

    // Renderizar los artículos en el carrito en el HTML
    function renderCart(items) {
        cartContainer.innerHTML = ''; // Limpiar el contenido del carrito
        let total = 0;

        // Si el carrito está vacío, mostrar mensaje
        if (items.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
            cartTotalElement.textContent = '0.00';
            return;
        }

        // Iterar sobre cada artículo y renderizarlo
        items.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
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
            cartContainer.appendChild(cartItemElement);
            total += item.price * item.quantity;
        });

        // Mostrar el total del carrito
        cartTotalElement.textContent = total.toFixed(2);
    }

    // Actualizar la cantidad de un producto en el carrito
    async function updateQuantity(productId, newQuantity) {
        try {
            // Hacer solicitud a la API para actualizar la cantidad del producto
            const response = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ productId, quantity: newQuantity })
            });
            // Obtener el carrito actualizado
            const updatedCart = await response.json();
            // Renderizar el carrito actualizado
            renderCart(updatedCart);
        } catch (err) {
            console.error('Error al actualizar la cantidad:', err);
        }
    }

    // Procedimiento para completar la compra
    async function checkout() {
        try {
            // Obtener el email del usuario desde el token JWT
            const userEmail = parseJwt(localStorage.getItem('token')).email;
            // Obtener los artículos del carrito
            const cartResponse = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const cartItems = await cartResponse.json();

            // Crear los datos de la factura
            const billData = {
                userEmail,
                items: cartItems,
                total: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
                date: new Date().toISOString()
            };

            // Enviar la factura a la API para crearla
            const billResponse = await fetch('/api/bills/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(billData)
            });

            if (billResponse.ok) {
                alert('Compra realizada con éxito');
                // Limpiar el carrito después de la compra
                renderCart([]);
            }
        } catch (err) {
            console.error('Error en la compra:', err);
        }
    }

    // Mostrar las facturas previas en el modal
    async function showBills() {
        try {
            // Obtener las facturas desde la API
            const billsResponse = await fetch('/api/bills', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const bills = await billsResponse.json();
            
            // Renderizar las facturas en la interfaz
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

            // Mostrar el modal con las facturas
            billsModal.style.display = 'block';
        } catch (err) {
            console.error('Error al cargar las facturas:', err);
        }
    }

    // Función para parsear el token JWT y extraer los datos
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    // Eventos de interacción con el usuario
    checkoutBtn.addEventListener('click', checkout); // Evento para finalizar la compra
    billsBtn.addEventListener('click', showBills); // Evento para mostrar las facturas previas
    closeBillsBtn.addEventListener('click', () => {
        billsModal.style.display = 'none'; // Cerrar el modal de facturas
    });

    // Cerrar sesión
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/userLogin'; // Redirigir a la página de login
    });

    // Cargar el carrito al iniciar la página
    loadCart();

    // Exponer la función `updateQuantity` al contexto global para su uso en el HTML
    window.updateQuantity = updateQuantity;
});

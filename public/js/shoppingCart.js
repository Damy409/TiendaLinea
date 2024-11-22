document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cart-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const billsBtn = document.getElementById('bills-btn');
    const billsModal = document.getElementById('bills-modal');
    const billsList = document.getElementById('bills-list');
    const closeBillsBtn = document.getElementById('close-bills');

    // Función para cargar el carrito
    async function loadCart() {
        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const cartItems = await response.json();
            renderCart(cartItems);
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
        }
    }

    // Función para renderizar el carrito
    function renderCart(items) {
        cartContainer.innerHTML = '';
        let total = 0;

        if (items.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
            cartTotalElement.textContent = '0.00';
            return;
        }

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
            total += item.price * item.quantity;
        });

        cartTotalElement.textContent = total.toFixed(2);
    }


    // Función para actualizar cantidad
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
            renderCart(updatedCart);
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
        }
    }

    // Función para comprar
    async function checkout() {
        try {
            const userEmail = parseJwt(localStorage.getItem('token')).email;
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
                alert('Compra realizada con éxito');
                // Recargar carrito vacío
                renderCart([]);
            }
        } catch (error) {
            console.error('Error en la compra:', error);
        }
    }

    // Función para ver facturas
    async function showBills() {
        try {
            const response = await fetch('/api/bills', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const bills = await response.json();
            
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

            billsModal.style.display = 'block';
        } catch (error) {
            console.error('Error al cargar facturas:', error);
        }
    }

    // Función para parsear JWT
    function parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }


    // Event listeners
    checkoutBtn.addEventListener('click', checkout);
    billsBtn.addEventListener('click', showBills);
    closeBillsBtn.addEventListener('click', () => {
        billsModal.style.display = 'none';
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/userLogin';
    });

    // Cargar carrito inicial
    loadCart();
    window.updateQuantity = updateQuantity;
});

/**
 * Gestión de Productos - Panel de Administración.
 * 
 * Este script maneja la interfaz del administrador para agregar, listar, y gestionar productos.
 * Incluye funcionalidades para validar el formulario, enviar datos al servidor y cargar
 * los productos existentes desde el backend.
 */

// Asegurarse de que el DOM está completamente cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
        loadProducts(); // Cargar productos existentes
    }


    /**
     * Muestra mensajes de éxito o error en la interfaz.
     * 
     * @param {string} message - Mensaje a mostrar.
     * @param {boolean} isError - Indica si el mensaje es de error (por defecto: false).
     */
    function showMessage(message, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
        messageDiv.textContent = message;
        messageDiv.style.padding = '10px';
        messageDiv.style.marginBottom = '10px';
        messageDiv.style.borderRadius = '4px';
        messageDiv.style.textAlign = 'center';
        
        // Eliminar mensaje anterior si existe
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Insertar el nuevo mensaje antes del formulario
        productForm.parentNode.insertBefore(messageDiv, productForm);

        // Remover el mensaje después de 3 segundos
        setTimeout(() => messageDiv.remove(), 3001);
    }

    /**
     * Maneja el envío del formulario para agregar un producto.
     * 
     * @param {Event} event - Evento submit del formulario.
     */
    async function handleAddProduct(event) {
        event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

        // Obtener los valores del formulario
        const formData = {
            name: document.getElementById('name').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value.trim()
        };

        // Validación básica
        if (!formData.name || !formData.price || !formData.image) {
            showMessage('Por favor, complete todos los campos', true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('No hay sesión activa. Por favor, inicie sesión nuevamente.', true);
                return;
            }

            console.log('Enviando datos:', formData); // Para debugging

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('Respuesta recibida:', response.status); // Para debugging

            const data = await response.json();

            if (response.ok) {
                showMessage('Producto agregado exitosamente');
                productForm.reset(); // Limpiar el formulario
                await loadProducts(); // Recargar la lista de productos
            } else {
                showMessage(data.message || 'Error al agregar producto', true);
            }
        } catch (error) {
            console.error('Error al agregar producto:', error);
            showMessage('Error de conexión. Por favor, intente nuevamente.', true);
        }
    }

    /**
     * Carga la lista de productos desde el servidor y los renderiza en la interfaz.
     */
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            
            const productList = document.getElementById('admin-product-list');
            if (productList) {
                productList.innerHTML = products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>$${product.price}</td>
                        <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
                        <td>
                            <button onclick="editProduct(${product.id})">Editar</button>
                            <button onclick="deleteProduct(${product.id})">Eliminar</button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            showMessage('Error al cargar los productos', true);
        }
    }

});

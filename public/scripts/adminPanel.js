// Asegurarse de que el DOM está cargado
document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
        loadProducts(); // Cargar productos existentes
    }

    // Función para mostrar mensajes
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

    // Función para manejar el envío del formulario
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

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

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

    // Función para cargar productos
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            
            const productList = document.getElementById('admin-product-list');
            if (productList) {
                productList.innerHTML = products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td><img src="${product.image}" alt="${product.name}" width="50" height="50"></td>
                        <td>
                            <button class="edit-btn" data-id="${product.id}">Editar</button>
                            <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                        </td>
                    </tr>
                `).join('');

                // Agregar eventos para editar y eliminar
                document.querySelectorAll('.edit-btn').forEach(button => {
                    button.addEventListener('click', () => editProduct(button.dataset.id));
                });

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', () => deleteProduct(button.dataset.id));
                });
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            showMessage('Error al cargar los productos', true);
        }
    }

    // Función para editar un producto
    async function editProduct(productId) {
        // Implementación de la funcionalidad de edición
        showMessage(`Función para editar producto con ID: ${productId}`, false);
    }

    // Función para eliminar un producto
    async function deleteProduct(productId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('No hay sesión activa. Por favor, inicie sesión nuevamente.', true);
                return;
            }

            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                showMessage('Producto eliminado exitosamente');
                await loadProducts(); // Recargar la lista de productos
            } else {
                const data = await response.json();
                showMessage(data.message || 'Error al eliminar producto', true);
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            showMessage('Error de conexión. Por favor, intente nuevamente.', true);
        }
    }
});

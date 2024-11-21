document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');

    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
        loadProducts(); // Cargar productos existentes
    }

    /**
     * Muestra un mensaje en la interfaz, puede ser de éxito o error.
     * 
     * @param {string} message El mensaje a mostrar.
     * @param {boolean} isError Define si es un mensaje de error.
     */
    const showMessage = (message, isError = false) => {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();  // Eliminar mensaje anterior

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isError ? 'error-message' : 'success-message');
        messageDiv.textContent = message;
        Object.assign(messageDiv.style, {
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            textAlign: 'center'
        });

        productForm.parentNode.insertBefore(messageDiv, productForm); // Insertar nuevo mensaje

        setTimeout(() => messageDiv.remove(), 3001); // Eliminar mensaje después de 3 segundos
    };

    /**
     * Maneja el evento de enviar el formulario para agregar un nuevo producto.
     * 
     * @param {Event} event El evento de envío del formulario.
     */
    const handleAddProduct = async (event) => {
        event.preventDefault(); // Prevenir comportamiento por defecto

        const formData = {
            name: document.getElementById('name').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            image: document.getElementById('image').value.trim()
        };

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
                productForm.reset(); // Limpiar formulario
                await loadProducts(); // Recargar lista de productos
            } else {
                showMessage(data.message || 'Error al agregar producto', true);
            }
        } catch (error) {
            console.error('Error al agregar producto:', error);
            showMessage('Error de conexión. Por favor, intente nuevamente.', true);
        }
    };

    /**
     * Carga la lista de productos desde la API y los muestra en la página.
     */
    const loadProducts = async () => {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();

            const productList = document.getElementById('admin-product-list');
            if (!productList) return;

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

            // Agregar eventos de edición y eliminación
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', () => editProduct(button.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', () => deleteProduct(button.dataset.id));
            });

        } catch (error) {
            console.error('Error al cargar productos:', error);
            showMessage('Error al cargar los productos', true);
        }
    };

    /**
     * Función para editar un producto (sin implementación todavía).
     * 
     * @param {string} productId El ID del producto.
     */
    const editProduct = (productId) => {
        showMessage(`Función para editar producto con ID: ${productId}`, false);
    };

    /**
     * Elimina un producto mediante la API.
     * 
     * @param {string} productId El ID del producto a eliminar.
     */
    const deleteProduct = async (productId) => {
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
                await loadProducts(); // Recargar productos
            } else {
                const data = await response.json();
                showMessage(data.message || 'Error al eliminar producto', true);
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            showMessage('Error de conexión. Por favor, intente nuevamente.', true);
        }
    };
});

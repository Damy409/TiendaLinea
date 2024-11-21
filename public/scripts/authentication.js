// public/js/authentications.js

// API base URL para las peticiones
const API_URL = 'http://localhost:3001/api';

/**
 * Muestra un mensaje de error o éxito en la página.
 * Si ya existe un mensaje previo, lo elimina antes de mostrar el nuevo.
 * 
 * @param {string} message - El mensaje que se desea mostrar.
 * @param {boolean} [isError=false] - Define si el mensaje es de error (true) o éxito (false).
 */
const showMessage = (message, isError = false) => {
    let existingMessage = document.querySelector('.message');
    if (existingMessage) existingMessage.remove(); // Elimina el mensaje previo

    // Crea un nuevo div para mostrar el mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message; // Asigna el texto del mensaje

    const form = document.querySelector('form');
    form.insertAdjacentElement('beforebegin', messageDiv); // Inserta el mensaje antes del formulario
};

/**
 * Guarda el token en el almacenamiento local del navegador.
 * 
 * @param {string} token - El token que se va a guardar.
 */
const saveToken = (token) => localStorage.setItem('token', token); // Guarda el token en localStorage

/**
 * Maneja el registro de un usuario, enviando los datos a la API y gestionando la respuesta.
 * 
 * @param {Event} e - El evento de submit del formulario.
 */
const handleRegister = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        // Realiza la petición POST a la API de registro
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json(); // Convierte la respuesta en JSON

        // Maneja la respuesta dependiendo de si la creación del usuario fue exitosa
        if (response.ok) {
            console.log('Usuario registrado:', data);
            alert('Registro exitoso');
            window.location.href = '/pages/userLogin.html'; // Redirige al login
        } else {
            console.error('Error en el registro:', data.message);
            showMessage(data.message || 'Error al registrar usuario', true); // Muestra mensaje de error
        }
    } catch (error) {
        console.error('Error de red:', error);
        showMessage('Error de red. Intente nuevamente.', true); // Muestra mensaje de error en caso de fallo de red
    }
};

/**
 * Maneja el inicio de sesión del usuario, enviando los datos de login a la API.
 * Si el login es exitoso, guarda el token y redirige según el rol del usuario.
 * 
 * @param {Event} e - El evento de submit del formulario.
 */
const handleUserLogin = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/userLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json(); // Convierte la respuesta en JSON

        // Maneja la respuesta dependiendo de si el login fue exitoso
        if (response.ok) {
            console.log('Inicio de sesión exitoso:', data);
            saveToken(data.token); // Guarda el token

            // Redirige según el rol del usuario, basado en la respuesta de la API
            window.location.href = data.redirectUrl;
        } else {
            console.error('Error en el inicio de sesión:', data.message);
            showMessage(data.message || 'Error al iniciar sesión', true); // Muestra mensaje de error
        }
    } catch (error) {
        console.error('Error de red:', error);
        showMessage('Error de red. Intente nuevamente.', true); // Muestra mensaje de error en caso de fallo de red
    }
};

/**
 * Agrega event listeners a los formularios de registro y login
 * cuando el documento está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const userLoginForm = document.getElementById('userLoginForm');

    // Si el formulario de registro existe, agrega el listener
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    // Si el formulario de login existe, agrega el listener
    if (userLoginForm) userLoginForm.addEventListener('submit', handleUserLogin);
});


// Agrega estilos CSS para los mensajes de error y éxito de manera dinámica.
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .error-message {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-left: 5px solid #f44336; /* Línea lateral roja para error */
    }
    .success-message {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-left: 5px solid #28a745; /* Línea lateral verde para éxito */
    }
`;
document.head.appendChild(style); // Agrega los estilos al <head> del documento

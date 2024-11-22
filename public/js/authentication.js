// public/js/authentications.js

// API base URL para las peticiones
const API_URL = 'http://localhost:3001/api';

// Función para mostrar mensajes de error/éxito
const showMessage = (message, isError = false) => {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isError ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    
    const form = document.querySelector('form');
    form.insertAdjacentElement('beforebegin', messageDiv);
};

// Función para guardar el token en localStorage
const saveToken = (token) => {
    localStorage.setItem('token', token);
};

// Función para manejar el registro de usuario
const handleRegister = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Usuario registrado:', data);
            alert('Registro exitoso');
            window.location.href = '/pages/userLogin.html';
        } else {
            console.error('Error en el registro:', data.message);
            showMessage(data.message || 'Error al registrar usuario', true);
        }
    } catch (error) {
        console.error('Error de red:', error);
        showMessage('Error de red. Intente nuevamente.', true);
    }
};

// Función para manejar el inicio de sesión
const handleLogin = async (e) => {
    e.preventDefault();
    
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

        const data = await response.json();

        if (response.ok) {
            // Inicio de sesión exitoso
            console.log('Inicio de sesión exitoso:', data);
            saveToken(data.token); // Guarda el token

            // Redirige a la URL proporcionada por el servidor según el rol
            window.location.href = data.redirectUrl; // Usamos redirectUrl de la respuesta
        } else {
            // Manejar errores
            console.error('Error en el inicio de sesión:', data.message);
            showMessage(data.message || 'Error al iniciar sesión', true);
        }
    } catch (error) {
        console.error('Error de red:', error);
        showMessage('Error de red.Intente Mas Tarde.', true);
    }
};

// Agregar event listeners según la página actual
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Agregar estilos para los mensajes
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 12px;
        margin-bottom: 18px;
        border-radius: 6px;
        text-align: center;
        font-size: 1rem;
        font-family: 'Arial', sans-serif;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .error-message {
        background-color: #f3e5f5; /* Morado claro */
        color: #6a1b9a; /* Morado oscuro */
        border: 1px solid #ce93d8; /* Morado suave */
    }
    .success-message {
        background-color: #e3f2fd; /* Azul claro */
        color: #1565c0; /* Azul oscuro */
        border: 1px solid #90caf9; /* Azul suave */
    }
`;
document.head.appendChild(style);
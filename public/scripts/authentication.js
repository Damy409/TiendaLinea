// public/js/auth.js
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
        const response = await fetch('${API_URL}/auth/register', {
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
const handleUserLogin = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('${API_URL}/auth/userLogin', {
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
        showMessage('Error de red. Intente nuevamente.', true);
    }
};


// Agregar event listeners según la página actual
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const userLoginForm = document.getElementById('userLoginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }
});

// Agregar estilos para los mensajes
const style = document.createElement('style');
style.textContent = `
    .message {
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 4px;
        text-align: center;
    }
    .error-message {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ffcdd2;
    }
    .success-message {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #c8e6c9;
    }
`;
document.head.appendChild(style);

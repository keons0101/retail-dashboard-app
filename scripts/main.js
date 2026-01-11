// Global settings
const API_BASE_URL = 'http://localhost:3000';
let allProducts = []; // Store all products
let currentView = 'products'; // products, dashboard, cart

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Retail Dashboard inicializado');
    
    initNavigation();
    
    await loadProducts();
    
    renderProducts();
    
    showSection('products');
});

async function loadProducts() {
    console.log('Cargando productos desde el servidor...');
    
    const productsContainer = document.getElementById('products-container');
    
    try {
        productsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Conectando con el servidor...</p>
            </div>
        `;
        
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            allProducts = result.data;
            console.log(`${allProducts.length} productos cargados:`, allProducts);
        } else {
            throw new Error(result.message || 'Error al cargar productos');
        }
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        
        productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No se pudieron cargar los productos</h3>
                <p>${error.message}</p>
                <p class="error-help">
                    <strong>Solución:</strong> Asegúrate de que el servidor esté corriendo en http://localhost:3000
                </p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .error-message {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                background: #fff5f5;
                border-radius: var(--border-radius);
                border: 2px solid #fed7d7;
            }
            .error-message i {
                font-size: 48px;
                color: #fc8181;
                margin-bottom: 20px;
            }
            .error-message h3 {
                color: #c53030;
                margin-bottom: 10px;
            }
            .error-message p {
                color: #718096;
                margin-bottom: 15px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .error-help {
                font-size: 14px;
                color: #4a5568;
                background: #edf2f7;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .retry-btn {
                margin-top: 20px;
                padding: 12px 24px;
                background-color: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
            }
            .retry-btn:hover {
                background-color: var(--primary-dark);
            }
        `;
        document.head.appendChild(style);
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove "active" class on every link
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add "active" class to the clicked link
            link.classList.add('active');
            
            // Show the clicked section
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        currentView = sectionId;
        console.log(`📌 Sección activa: ${sectionId}`);
        
        // Si es el dashboard, actualizar métricas
        if (sectionId === 'dashboard') {
            updateDashboardMetrics();
        }
    }
}
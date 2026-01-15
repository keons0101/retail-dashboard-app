const ChartsModule = {
    charts: {},

    initCharts(products) {
        console.log('Initializing charts with', products.length, 'products');

        this.destroyCharts();

        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection) {
            console.error('Dashboard section not found');
            return;
        }

        if (dashboardSection.style.display === 'none') {
            console.log('Dashboard is hidden, will initialize when shown');
            this.pendingProducts = products;
            return;
        }

        this.createChartContainers();

        const stockCanvas = document.getElementById('stock-chart');
        if (!stockCanvas) {
            console.error('Chart canvases not created properly');
            return;
        }

        this.createStockChart(products);
        this.createSalesChart(products);
        this.createRatingChart(products);
        this.createCategoryChart(products);

        console.log('All charts initialized successfully');
    },

    createChartContainers() {
        const dashboardSection = document.getElementById('dashboard');
        if (!dashboardSection) return;

        const comingSoon = dashboardSection.querySelector('.dashboard-coming-soon');
        if (comingSoon) {
            comingSoon.style.display = 'none';
        }

        let chartsContainer = dashboardSection.querySelector('.charts-container');
        if (!chartsContainer) {
            chartsContainer = document.createElement('div');
            chartsContainer.className = 'charts-container';
            chartsContainer.innerHTML = `
                <div class="chart-row">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4><i class="fas fa-boxes"></i> Stock Status</h4>
                            <div class="chart-legend" id="stock-legend"></div>
                        </div>
                        <div class="chart-container">
                            <canvas id="stock-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4><i class="fas fa-chart-line"></i> Sales Performance</h4>
                            <div class="chart-legend" id="sales-legend"></div>
                        </div>
                        <div class="chart-container">
                            <canvas id="sales-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="chart-row">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4><i class="fas fa-star"></i> Rating Distribution</h4>
                            <div class="chart-legend" id="rating-legend"></div>
                        </div>
                        <div class="chart-container">
                            <canvas id="rating-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h4><i class="fas fa-tags"></i> Products by Category</h4>
                            <div class="chart-legend" id="category-legend"></div>
                        </div>
                        <div class="chart-container">
                            <canvas id="category-chart"></canvas>
                        </div>
                    </div>
                </div>
            `;

            const metricsGrid = dashboardSection.querySelector('.dashboard-grid');
            if (metricsGrid) {
                metricsGrid.parentNode.insertBefore(chartsContainer, metricsGrid.nextSibling);
            } else {
                dashboardSection.appendChild(chartsContainer);
            }
        }

        this.addChartStyles();
    },

    createStockChart(products) {
        const ctx = document.getElementById('stock-chart');
        if (!ctx) return;

        const stockData = {
            labels: ['Out of Stock', 'Low Stock (<5)', 'Medium Stock (5-10)', 'Good Stock (>10)'],
            datasets: [{
                data: [
                    products.filter(p => p.stock === 0).length,
                    products.filter(p => p.stock > 0 && p.stock < 5).length,
                    products.filter(p => p.stock >= 5 && p.stock <= 10).length,
                    products.filter(p => p.stock > 10).length
                ],
                backgroundColor: [
                    '#e53e3e',
                    '#ed8936',
                    '#d69e2e',
                    '#38a169'
                ],
                borderWidth: 1
            }]
        };

        this.charts.stockChart = new Chart(ctx, {
            type: 'doughnut',
            data: stockData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} products (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.updateLegend('stock-legend', stockData);
    },

    createSalesChart(products) {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;

        const initialStock = 50;

        const salesData = products.map(product => {
            const sold = Math.max(0, initialStock - product.stock);
            const revenue = sold * product.price;
            return {
                name: product.name,
                sold: sold,
                revenue: revenue
            };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        this.charts.salesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: salesData.map(item => item.name.substring(0, 15) + (item.name.length > 15 ? '...' : '')),
                datasets: [{
                    label: 'Units Sold',
                    data: salesData.map(item => item.sold),
                    backgroundColor: '#4361ee',
                    borderColor: '#3a56d4',
                    borderWidth: 1
                }, {
                    label: 'Revenue ($)',
                    data: salesData.map(item => item.revenue),
                    backgroundColor: '#7209b7',
                    borderColor: '#5e0a9e',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Units Sold'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Revenue ($)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                const value = context.raw || 0;

                                if (label.includes('Revenue')) {
                                    return `${label}: $${value.toFixed(2)}`;
                                }
                                return `${label}: ${value} units`;
                            }
                        }
                    }
                }
            }
        });

        const legendData = {
            labels: ['Units Sold', 'Revenue'],
            colors: ['#4361ee', '#7209b7']
        };
        this.updateLegend('sales-legend', legendData);
    },

    createRatingChart(products) {
        const ctx = document.getElementById('rating-chart');
        if (!ctx) return;

        const ratingGroups = {
            '5.0': 0,
            '4.0-4.9': 0,
            '3.0-3.9': 0,
            '2.0-2.9': 0,
            '1.0-1.9': 0
        };

        products.forEach(product => {
            const rating = product.rating;
            if (rating >= 4.5) ratingGroups['5.0']++;
            else if (rating >= 4.0) ratingGroups['4.0-4.9']++;
            else if (rating >= 3.0) ratingGroups['3.0-3.9']++;
            else if (rating >= 2.0) ratingGroups['2.0-2.9']++;
            else ratingGroups['1.0-1.9']++;
        });

        this.charts.ratingChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(ratingGroups),
                datasets: [{
                    label: 'Products by Rating',
                    data: Object.values(ratingGroups),
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    borderColor: '#4cc9f0',
                    borderWidth: 2,
                    pointBackgroundColor: '#4cc9f0',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = products.length;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} products (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        const legendData = {
            labels: ['Products by Rating'],
            colors: ['#4cc9f0']
        };
        this.updateLegend('rating-legend', legendData);
    },

    createCategoryChart(products) {
        const ctx = document.getElementById('category-chart');
        if (!ctx) return;

        const categories = {};
        products.forEach(product => {
            categories[product.category] = (categories[product.category] || 0) + 1;
        });

        const categoryColors = {
            'Apparel': '#f72585',
            'Electronics': '#4361ee',
            'Home Goods': '#4cc9f0',
            'Accessories': '#7209b7'
        };

        this.charts.categoryChart = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: Object.keys(categories).map(cat => categoryColors[cat] || '#6c757d'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = products.length;
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} products (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.updateLegend('category-legend', {
            labels: Object.keys(categories),
            colors: Object.keys(categories).map(cat => categoryColors[cat] || '#6c757d')
        });
    },

    updateLegend(legendId, data) {
        const legendContainer = document.getElementById(legendId);
        if (!legendContainer || !data) return;

        if (Array.isArray(data.labels) && Array.isArray(data.colors)) {
            legendContainer.innerHTML = data.labels.map((label, index) => `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${data.colors[index]}"></span>
                    <span class="legend-label">${label}</span>
                </div>
            `).join('');
        } else if (Array.isArray(data.labels) && Array.isArray(data.datasets?.[0]?.backgroundColor)) {
            legendContainer.innerHTML = data.labels.map((label, index) => `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${data.datasets[0].backgroundColor[index]}"></span>
                    <span class="legend-label">${label}</span>
                </div>
            `).join('');
        }
    },

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    },

    addChartStyles() {
        const styleId = 'charts-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .charts-container {
                margin-top: 40px;
            }
            
            .chart-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 25px;
                margin-bottom: 25px;
            }
            
            @media (max-width: 900px) {
                .chart-row {
                    grid-template-columns: 1fr;
                }
            }
            
            .chart-card {
                background: white;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
                padding: 25px;
                display: flex;
                flex-direction: column;
            }
            
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .chart-header h4 {
                margin: 0;
                color: var(--dark);
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .chart-header h4 i {
                color: var(--primary);
            }
            
            .chart-legend {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--gray);
            }
            
            .legend-color {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                display: inline-block;
            }
            
            .chart-container {
                position: relative;
                height: 300px;
                flex-grow: 1;
            }
            
            canvas {
                width: 100% !important;
                height: 100% !important;
            }
        `;

        document.head.appendChild(style);
    },

    updateCharts(products) {
        console.log('Updating charts with new data');

        this.destroyCharts();
        this.initCharts(products);
    }
};

window.ChartsModule = ChartsModule;
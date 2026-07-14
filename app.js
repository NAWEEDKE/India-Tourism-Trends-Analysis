// India Tourism Field Notes - Shared JavaScript Controller

// Global State
let globalTourismData = null;

// Page Mapping for navigation tabs activation
const PAGE_TABS = {
    'index.html': 'tab-home',
    'seasonality.html': 'tab-season',
    'monuments.html': 'tab-monuments',
    'circles.html': 'tab-circles',
    'guide.html': 'tab-guide',
    'predict.html': 'tab-predict'
};

// Map ASI Circles to regional fallbacks so every location has a unique sketch style
const circleDoodleMap = {
    'Agra': 'taj_mahal',
    'Delhi': 'qutub_minar',
    'Aurangabad': 'ellora_caves',
    'Hyderabad': 'charminar',
    'Chennai': 'mamallapuram',
    'Tiruchirappalli': 'mamallapuram',
    'Bhubaneswar': 'sun_temple',
    'Hampi': 'hampi_chariot',
    'Dharwad': 'hampi_chariot',
    'Banglore': 'hampi_chariot',
    'Sarnath': 'sarnath_stupa',
    'Patna': 'sarnath_stupa',
    'Jhansi': 'sarnath_stupa',
    'Bhopal': 'sanchi_stupa',
    'Jabalpur': 'sanchi_stupa',
    'Goa': 'goa_fort',
    'Thrissur': 'goa_fort',
    'Vadodara': 'champaner_mosque',
    'Jodhpur': 'champaner_mosque',
    'Mumbai': 'elephanta_caves',
    'Raiganj': 'hazarduari_palace'
};

document.addEventListener("DOMContentLoaded", () => {
    activateNavigationTab();
    loadTourismData().then(data => {
        if (data) {
            initPageSpecifics(data);
        }
    });
});

// Activate the current tab based on pathname
function activateNavigationTab() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const activeTabId = PAGE_TABS[path] || 'tab-home';

    // Select all tab links and remove active class
    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.classList.remove('active');
        if (tab.classList.contains(activeTabId)) {
            tab.classList.add('active');
        }
    });
}

// Fetch and cache dataset
async function loadTourismData() {
    // Check session storage first for performance
    const cachedData = sessionStorage.getItem('tourism_summary_data');
    if (cachedData) {
        globalTourismData = JSON.parse(cachedData);
        return globalTourismData;
    }

    try {
        const response = await fetch('tourism_summary_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Normalize existing doodle keys and inject new details dynamically
        if (data.doodles) {
            if (data.doodles['Golconda Fort'] && !data.doodles['Golconda']) {
                data.doodles['Golconda'] = data.doodles['Golconda Fort'];
            }
            if (data.doodles['Mamallapuram'] && !data.doodles['Group of Monuments Mamallapuram']) {
                data.doodles['Group of Monuments Mamallapuram'] = data.doodles['Mamallapuram'];
            }

            data.doodles['Buddhist Monuments, Sanchi'] = {
                short_name: 'sanchi_stupa',
                title: 'Buddhist Monuments, Sanchi',
                circle: 'Bhopal',
                period: '3rd Century BCE to 12th Century CE',
                builder: 'Emperor Ashoka & successors',
                style: 'Buddhist / Ancient Indian Architecture',
                description: 'One of the oldest stone structures in India, commissioned by Emperor Ashoka. The Great Stupa is famous for its magnificently carved Toranas (gateways) depicting the Jataka tales.',
                field_notes: [
                    'Bhopal Circle\'s crown jewel of ancient Buddhist heritage.',
                    'The stone carvings on the Toranas represent the finest early Indian narrative art.'
                ]
            };
            data.doodles['Group of Monuments, Hampi'] = {
                short_name: 'hampi_chariot',
                title: 'Group of Monuments, Hampi',
                circle: 'Hampi',
                period: '14th–16th Century AD',
                builder: 'Vijayanagara Empire Kings',
                style: 'Vijayanagara / Dravidian Architecture',
                description: 'The spectacular capital of the Vijayanagara Empire, featuring the stone chariot, Virupaksha temple, and musical pillars.',
                field_notes: [
                    'Southern region\'s premier medieval archaeological site.',
                    'Highly visited by international heritage tours.'
                ]
            };
            data.doodles['Excavated Remains at sarnath'] = {
                short_name: 'sarnath_stupa',
                title: 'Excavated Remains at Sarnath',
                circle: 'Sarnath',
                period: '3rd Century BCE',
                builder: 'Emperor Ashoka & Gupta Empire',
                style: 'Buddhist Stupa Architecture',
                description: 'The sacred site of Lord Buddha\'s first sermon, marked by the towering Dhamek Stupa and ancient ruins.',
                field_notes: [
                    'Important international pilgrimage site.',
                    'Sarnath Circle shows highly concentrated footfalls.'
                ]
            };
            data.doodles['Upper Fort Aguada'] = {
                short_name: 'goa_fort',
                title: 'Upper Fort Aguada',
                circle: 'Goa',
                period: '17th Century (1612)',
                builder: 'Portuguese Colonial Rulers',
                style: 'Portuguese Military Architecture',
                description: 'A 17th-century Portuguese lighthouse and fort standing on the beach in Goa, built to defend against Dutch forces.',
                field_notes: [
                    'Extremely high domestic tourism density due to beach-adjacent location.',
                    'Aguada lighthouse represents early colonial navigation history.'
                ]
            };
            data.doodles['Rudabai Step Well, Adalaj'] = {
                short_name: 'champaner_mosque',
                title: 'Rudabai Step Well, Adalaj',
                circle: 'Vadodara',
                period: '15th Century (1498)',
                builder: 'Queen Rudabai / Solanki Dynasty',
                style: 'Solanki / Indo-Islamic Architecture',
                description: 'A unique five-story deep subterranean stepwell featuring intricate Solanki and Islamic stone carvings.',
                field_notes: [
                    'Vadodara Circle\'s architectural marvel of water engineering.',
                    'Subterranean layout keeps the interior 6 degrees cooler than the surface.'
                ]
            };
            data.doodles['Elephanta Caves'] = {
                short_name: 'elephanta_caves',
                title: 'Elephanta Caves',
                circle: 'Mumbai',
                period: '5th–7th Century AD',
                builder: 'Rashtrakuta & Silahara Dynasties',
                style: 'Rock-cut Cave Architecture',
                description: 'Cave temples dedicated to Shiva on Elephanta Island in Mumbai Harbour. Renowned for the colossal Trimurti sculpture.',
                field_notes: [
                    'Accessible via ferry from Gateway of India, popular weekend trip.',
                    'Trimurti representation is considered a masterpiece of Indian art.'
                ]
            };
            data.doodles['Hazarduari Palace'] = {
                short_name: 'hazarduari_palace',
                title: 'Hazarduari Palace',
                circle: 'Raiganj',
                period: '19th Century (1837)',
                builder: 'Nawab Nazim Humayun Jah',
                style: 'Indo-European / Italianate Architecture',
                description: 'A grand palace featuring a thousand doors (of which 900 are false) built in the Italianate style in West Bengal.',
                field_notes: [
                    'Raiganj Circle\'s most prominent heritage site.',
                    'Houses a vast museum of weapons and royal archives.'
                ]
            };
        }

        // Validate JSON structure to prevent crashes with empty skeleton files
        if (!data || !data.metrics || !data.monuments || !data.circles) {
            throw new Error("Dataset is empty or incomplete. Please run setup_assets.py.");
        }

        sessionStorage.setItem('tourism_summary_data', JSON.stringify(data));
        globalTourismData = data;
        return globalTourismData;
    } catch (error) {
        console.error("Could not load tourism summary data:", error);
        showLoadingError();
        return null;
    }
}

function showLoadingError() {
    const errorNotice = document.createElement('div');
    errorNotice.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f8d7da;
        color: #721c24;
        padding: 15px 30px;
        border: 1px solid #f5c6cb;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        text-align: center;
    `;
    errorNotice.innerHTML = `
        <p>⚠️ Cannot access <code>tourism_summary_data.json</code></p>
        <p style="font-size:0.85rem; font-weight:normal; margin-top:5px;">
           Please run the setup script: <code>python setup_assets.py</code> in your project directory.
        </p>
    `;
    document.body.appendChild(errorNotice);
}

// Chart.js Style helper to generate a hand-drawn pencil/ruled aesthetic
const pencilChartStyles = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    gridColor: "#e3dec9", // ruled paper lines color
    gridDash: [5, 5],
    textColor: "#2b2b2b",

    // Style configurations for Chart.js
    getOptions(customTitle) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: this.fontFamily,
                            size: 11,
                            weight: '600'
                        },
                        color: this.textColor,
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(35, 43, 40, 0.9)',
                    titleFont: { family: this.fontFamily, weight: 'bold' },
                    bodyFont: { family: this.fontFamily },
                    padding: 12,
                    cornerRadius: 6
                }
            },
            scales: {
                x: {
                    grid: {
                        color: this.gridColor,
                        tickColor: this.gridColor,
                        borderDash: this.gridDash
                    },
                    ticks: {
                        font: { family: this.fontFamily, size: 10 },
                        color: this.textColor
                    }
                },
                y: {
                    grid: {
                        color: this.gridColor,
                        tickColor: this.gridColor,
                        borderDash: this.gridDash
                    },
                    ticks: {
                        font: { family: this.fontFamily, size: 10 },
                        color: this.textColor,
                        // Format numbers on axis nicely
                        callback: function (value) {
                            if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
                            if (value >= 1e3) return (value / 1e3).toFixed(0) + 'K';
                            return value;
                        }
                    }
                }
            }
        };
    }
};

// Utility function to format numbers
function formatNum(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// Dispatch to page specific initializations
function initPageSpecifics(data) {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    if (path === 'index.html' || path === '') {
        initHomePage(data);
    } else if (path === 'seasonality.html') {
        initSeasonalityPage(data);
    } else if (path === 'monuments.html') {
        initMonumentsPage(data);
    } else if (path === 'circles.html') {
        initCirclesPage(data);
    } else if (path === 'predict.html') {
        initPredictPage();
    }
}

// 1. HOME PAGE INITIALIZATION
function initHomePage(data) {
    // Set Metric cards
    document.getElementById('m-records').textContent = formatNum(data.metrics.total_records);
    document.getElementById('m-domestic').textContent = formatNum(data.metrics.total_domestic);
    document.getElementById('m-foreign').textContent = formatNum(data.metrics.total_foreign);

    // Calculate and format domestic ratio
    const domRatio = (data.metrics.total_domestic / data.metrics.total_all * 100).toFixed(1);
    document.getElementById('m-ratio').textContent = `${domRatio}%`;

    // Init Feature Importance List
    const impList = document.getElementById('importance-list');
    if (impList) {
        impList.innerHTML = '';
        data.feature_importance.forEach(item => {
            const li = document.createElement('li');
            li.className = 'importance-item';
            li.innerHTML = `
                <span class="importance-name">${item.label}</span>
                <span class="importance-val">${(item.value * 100).toFixed(1)}%</span>
            `;
            impList.appendChild(li);
        });
    }

    // Init Yearly Trends Line Chart
    const ctx = document.getElementById('yearlyTrendsChart').getContext('2d');
    const years = data.yearly_trends.map(t => t.year);
    const domestic = data.yearly_trends.map(t => t.domestic);
    const foreign = data.yearly_trends.map(t => t.foreign);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Domestic Visitors',
                    data: domestic,
                    borderColor: '#c85a49', // terracotta
                    backgroundColor: 'rgba(200, 90, 73, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#c85a49'
                },
                {
                    label: 'Foreign Visitors',
                    data: foreign,
                    borderColor: '#3d687a', // indigo
                    backgroundColor: 'rgba(61, 104, 122, 0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#3d687a'
                }
            ]
        },
        options: pencilChartStyles.getOptions('Yearly Trends')
    });
}

// 2. SEASONALITY PAGE INITIALIZATION
function initSeasonalityPage(data) {
    const years = data.heatmap.years;
    const months = data.heatmap.months;
    const domesticMatrix = data.heatmap.domestic; // 12 months x 10 years array

    const grid = document.getElementById('heatmap-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Create month header labels
    grid.appendChild(document.createElement('div')); // empty corner cell
    months.forEach(m => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-label heatmap-header';
        cell.textContent = m;
        grid.appendChild(cell);
    });

    // Populate matrix rows (Year label followed by 12 month values)
    years.forEach((yr, yrIdx) => {
        // Add year label
        const yrLabel = document.createElement('div');
        yrLabel.className = 'heatmap-label';
        yrLabel.textContent = yr;
        grid.appendChild(yrLabel);

        // Add 12 month cells for this year
        for (let mIdx = 0; mIdx < 12; mIdx++) {
            const val = domesticMatrix[mIdx][yrIdx];
            const cell = document.createElement('div');

            // Calculate color scale bin (0-6)
            // Min domestic monthly is around 1.4M, Max is 4.4M.
            // Let's bin using dynamic ranges
            let scaleClass = 'scale-0';
            if (val > 4.2e6) scaleClass = 'scale-6';
            else if (val > 3.7e6) scaleClass = 'scale-5';
            else if (val > 3.1e6) scaleClass = 'scale-4';
            else if (val > 2.5e6) scaleClass = 'scale-3';
            else if (val > 2.1e6) scaleClass = 'scale-2';
            else if (val > 1.6e6) scaleClass = 'scale-1';

            cell.className = `heatmap-cell ${scaleClass}`;
            cell.textContent = formatNum(val);
            cell.title = `${months[mIdx]} ${yr}: ${formatNum(val)} Domestic Visitors`;
            grid.appendChild(cell);
        }
    });

    // Populate Seasonality Trend Bar Chart (Aggregated monthly averages)
    const ctx = document.getElementById('seasonalityBarChart').getContext('2d');
    const sMonths = data.seasonality.map(s => s.month_name);
    const sDomestic = data.seasonality.map(s => s.domestic);
    const sForeign = data.seasonality.map(s => s.foreign);

    // 1. Fetch your custom theme options first
    const chartOptions = pencilChartStyles.getOptions('Seasonality Averages');

    // 2. Safely apply layout overrides directly to the object properties
    chartOptions.responsive = true;
    chartOptions.maintainAspectRatio = false;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sMonths,
            datasets: [
                {
                    label: 'Domestic (Monthly Avg)',
                    data: sDomestic,
                    backgroundColor: 'rgba(200, 90, 73, 0.85)',
                    borderColor: '#c85a49',
                    borderWidth: 1.5
                },
                {
                    label: 'Foreign (Monthly Avg)',
                    data: sForeign,
                    backgroundColor: 'rgba(61, 104, 122, 0.85)',
                    borderColor: '#3d687a',
                    borderWidth: 1.5
                }
            ]
        },
    });
}

// 3. MONUMENTS PAGE INITIALIZATION
function initMonumentsPage(data) {
    const listContainer = document.getElementById('doodles-grid');
    if (!listContainer) return;

    // Helper to render monuments grid
    function renderMonumentsList(items) {
        listContainer.innerHTML = '';
        items.forEach(mon => {
            const card = document.createElement('div');
            card.className = 'specimen-card doodle-card';

            // Full key names from JSON: name, circle, domestic, foreign
            const monName = mon.name || mon.n || '';
            const monCircle = mon.circle || mon.c || '';
            const monDom = mon.domestic || mon.d || 0;

            const hasDoodle = data.doodles && data.doodles[monName] !== undefined;
            const doodleShortName = hasDoodle ? data.doodles[monName].short_name : (circleDoodleMap[monCircle] || 'placeholder');
            const imgSrc = `http://localhost:5050/doodles/${doodleShortName}.png`;

            card.innerHTML = `
                <div class="tape"></div>
                <div class="doodle-image-container">
                    <img src="${imgSrc}" alt="${monName}" onerror="this.src='http://localhost:5050/doodles/placeholder.png'">
                </div>
                <h3 class="doodle-title">${monName}</h3>
                <p class="doodle-subtitle">${monCircle} Circle</p>
                <div style="font-size: 0.8rem; margin-top: 8px; color: var(--ink-medium);">
                    Visitors: <strong>${(monDom / 1e6).toFixed(1)}M</strong>
                </div>
            `;

            card.addEventListener('click', () => showMonumentPopup(monName, mon));
            listContainer.appendChild(card);
        });
    }

    // Initial render
    renderMonumentsList(data.monuments);

    // Search bar functionality
    const searchInput = document.getElementById('search-monument');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filtered = data.monuments.filter(m => {
                const n = (m.name || m.n || '').toLowerCase();
                const c = (m.circle || m.c || '').toLowerCase();
                return n.includes(query) || c.includes(query);
            });
            renderMonumentsList(filtered);
        });
    }

    // Sort Selector
    const sortSelect = document.getElementById('sort-monument');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const mode = e.target.value;
            let sorted = [...data.monuments];
            const dom = m => m.domestic || m.d || 0;
            const for_ = m => m.foreign || m.f || 0;
            const nm = m => m.name || m.n || '';
            if (mode === 'total') sorted.sort((a, b) => (dom(b) + for_(b)) - (dom(a) + for_(a)));
            else if (mode === 'domestic') sorted.sort((a, b) => dom(b) - dom(a));
            else if (mode === 'foreign') sorted.sort((a, b) => for_(b) - for_(a));
            else if (mode === 'name') sorted.sort((a, b) => nm(a).localeCompare(nm(b)));
            renderMonumentsList(sorted);
        });
    }
}

// Popup Details Handler for Monuments
function showMonumentPopup(name, stats) {
    const modal = document.getElementById('specimen-modal');
    if (!modal) return;

    const data = globalTourismData;

    // Support both full keys (from JSON) and short keys (legacy)
    const statCircle = stats.circle || stats.c || '';
    const statDomestic = stats.domestic || stats.d || 0;
    const statForeign = stats.foreign || stats.f || 0;

    // Check if we have specialized notebook doodles data
    const doodleInfo = data.doodles && data.doodles[name];
    const hasDoodle = !!doodleInfo;

    // Populate Modal elements
    document.getElementById('pop-title').textContent = name;
    document.getElementById('pop-circle').textContent = statCircle;
    document.getElementById('pop-domestic').textContent = formatNum(statDomestic);
    document.getElementById('pop-foreign').textContent = formatNum(statForeign);
    document.getElementById('pop-total').textContent = formatNum(statDomestic + statForeign);

    // Reset specialized fields
    const popDoodle = document.getElementById('pop-doodle');
    const popPeriod = document.getElementById('pop-period');
    const popBuilder = document.getElementById('pop-builder');
    const popStyle = document.getElementById('pop-style');
    const popDesc = document.getElementById('pop-desc');
    const popNotesList = document.getElementById('pop-notes');

    if (hasDoodle) {
        popDoodle.src = `http://localhost:5050/doodles/${doodleInfo.short_name}.png`;
        popPeriod.textContent = doodleInfo.period || 'Unknown';
        popBuilder.textContent = doodleInfo.builder || 'Unknown';
        popStyle.textContent = doodleInfo.style || 'Varies';
        popDesc.textContent = doodleInfo.description || '';

        // Populate field notes
        popNotesList.innerHTML = '';
        if (doodleInfo.field_notes) {
            doodleInfo.field_notes.forEach(note => {
                const li = document.createElement('li');
                li.style.marginBottom = '6px';
                li.style.fontFamily = "var(--font-hand)";
                li.style.fontSize = "1.2rem";
                li.style.color = "var(--accent-blue)";
                li.textContent = `${note}`;
                popNotesList.appendChild(li);
            });
        }
    } else {
        const doodleShortName = circleDoodleMap[statCircle] || 'placeholder';
        popDoodle.src = `http://localhost:5050/doodles/${doodleShortName}.png`;
        popPeriod.textContent = 'Archaeological Specimen';
        popBuilder.textContent = 'Ancient Builders';
        popStyle.textContent = 'Indian Architectural Heritage';
        const totalVis = statDomestic + statForeign;
        const domPct = totalVis > 0 ? ((statDomestic / totalVis) * 100).toFixed(1) : '0.0';
        popDesc.textContent = `A historical site cataloged within the ${statCircle} Circle of the Archaeological Survey of India. Over the 10-year period, it recorded a total visitor volume of ${formatNum(totalVis)} people.`;
        popNotesList.innerHTML = `
            <li style="font-family: var(--font-hand); font-size: 1.25rem; color: var(--accent-blue);">
                This site is primarily a domestic attraction (${domPct}% domestic).
            </li>
            <li style="font-family: var(--font-hand); font-size: 1.25rem; color: var(--accent-blue); margin-top: 5px;">
                Recommended for heritage tourism circle study.
            </li>
        `;
    }

    // Show Modal
    modal.classList.add('show');

    // Close modal triggers
    const closeBtn = modal.querySelector('.modal-close');
    const handler = () => {
        modal.classList.remove('show');
        closeBtn.removeEventListener('click', handler);
        modal.removeEventListener('click', outsideHandler);
    };

    const outsideHandler = (e) => {
        if (e.target === modal) handler();
    };

    closeBtn.addEventListener('click', handler);
    modal.addEventListener('click', outsideHandler);
}

// 4. CIRCLES PAGE INITIALIZATION
function initCirclesPage(data) {
    const listContainer = document.getElementById('circles-list');
    if (!listContainer) return;

    // Populate Circles table/list (support both full keys and short keys)
    listContainer.innerHTML = '';

    const getName = c => c.name || c.n || '';
    const getDom = c => c.domestic || c.d || 0;
    const getFor = c => c.foreign || c.f || 0;

    // Sort circles by total volume first
    const sortedCircles = [...data.circles].sort((a, b) => (getDom(b) + getFor(b)) - (getDom(a) + getFor(a)));

    sortedCircles.forEach((c, idx) => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--paper-line)';
        tr.innerHTML = `
            <td style="padding: 10px 5px; font-weight: bold; font-family: var(--font-sketch); color: var(--ink-light);">${idx + 1}</td>
            <td style="padding: 10px 5px; font-weight: 600;">${getName(c)}</td>
            <td style="padding: 10px 5px; text-align: right;">${formatNum(getDom(c))}</td>
            <td style="padding: 10px 5px; text-align: right;">${formatNum(getFor(c))}</td>
            <td style="padding: 10px 5px; text-align: right; font-weight: bold;">${formatNum(getDom(c) + getFor(c))}</td>
        `;
        listContainer.appendChild(tr);
    });

    // Populate Circle Wise Bar Chart (Top 10 Circles)
    const ctx = document.getElementById('circleComparisonChart').getContext('2d');
    const topCircles = sortedCircles.slice(0, 10);
    const cLabels = topCircles.map(getName);
    const cDomestic = topCircles.map(getDom);
    const cForeign = topCircles.map(getFor);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cLabels,
            datasets: [
                {
                    label: 'Domestic',
                    data: cDomestic,
                    backgroundColor: 'rgba(200, 90, 73, 0.85)',
                    borderColor: '#c85a49',
                    borderWidth: 1
                },
                {
                    label: 'Foreign',
                    data: cForeign,
                    backgroundColor: 'rgba(61, 104, 122, 0.85)',
                    borderColor: '#3d687a',
                    borderWidth: 1
                }
            ]
        },
        options: {
            ...pencilChartStyles.getOptions('Top 10 Circles Comparison'),
            indexAxis: 'y',
        }
    });
}

// ── 5. ML PREDICTION PANEL ────────────────────────────────────────────────────
const ML_API = 'http://localhost:5050';
let predictChart = null;

async function initPredictPage() {
    const statusEl = document.getElementById('predict-status');
    const monSelect = document.getElementById('predict-monument');
    const runBtn = document.getElementById('predict-run');
    if (!statusEl || !monSelect) return;

    // Check if API is running
    try {
        const res = await fetch(`${ML_API}/status`, { signal: AbortSignal.timeout(2000) });
        const json = await res.json();
        statusEl.innerHTML = `<span style="color:#2d6a4f"> ML Model online — ${json.monuments} monuments loaded</span>`;

        // Populate monument dropdown
        const meta = await fetch(`${ML_API}/metadata`).then(r => r.json());
        monSelect.innerHTML = meta.monuments.map(m => `<option value="${m}">${m}</option>`).join('');

    } catch (e) {
        statusEl.innerHTML = `<span style="color:#c85a49">ML API offline — run <code>python model_api.py</code> in the project folder</span>`;
        if (runBtn) runBtn.disabled = true;
        return;
    }

    // Handle Predict button click
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            const monument = monSelect.value;
            const year = parseInt(document.getElementById('predict-year').value || 2025);
            const resultEl = document.getElementById('predict-result');

            runBtn.textContent = 'Predicting...';
            runBtn.disabled = true;

            try {
                // Get full year trend (12 months)
                const res = await fetch(`${ML_API}/trend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monument, year })
                });
                const data = await res.json();

                const totalDom = data.predicted_domestic.reduce((a, b) => a + b, 0);
                const peak = Math.max(...data.predicted_domestic);
                const peakMon = data.months[data.predicted_domestic.indexOf(peak)];

                // Estimate foreign visitors using historical domestic:foreign ratio
                const monData = globalTourismData.monuments.find(m =>
                    (m.name || m.n) === monument
                );
                const histDom = monData ? (monData.domestic || monData.d || 1) : 1;
                const histFor = monData ? (monData.foreign || monData.f || 0) : 0;
                const foreignRatio = histDom > 0 ? (histFor / histDom) : 0.05;

                // Apply ratio to each month's domestic prediction
                const predictedForeign = data.predicted_domestic.map(d =>
                    Math.round(d * foreignRatio)
                );
                const totalFor = predictedForeign.reduce((a, b) => a + b, 0);
                const totalAll = totalDom + totalFor;
                const foreignPct = totalAll > 0 ? ((totalFor / totalAll) * 100).toFixed(1) : '0.0';

                resultEl.innerHTML = `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px;">
                        <div class="specimen-card" style="padding:14px;">
                            <span style="font-size:0.7rem;color:var(--ink-light);text-transform:uppercase;letter-spacing:0.04em;">Domestic ${year}</span>
                            <div style="font-size:1.5rem;font-weight:800;color:var(--accent-terracotta);margin:4px 0 2px;">${formatNum(totalDom)}</div>
                            <span style="font-size:0.72rem;color:var(--ink-medium);">predicted visitors</span>
                        </div>
                        <div class="specimen-card" style="padding:14px;">
                            <span style="font-size:0.7rem;color:var(--ink-light);text-transform:uppercase;letter-spacing:0.04em;">Foreign ${year} (est.)</span>
                            <div style="font-size:1.5rem;font-weight:800;color:var(--accent-blue);margin:4px 0 2px;">${formatNum(totalFor)}</div>
                            <span style="font-size:0.72rem;color:var(--ink-medium);">${foreignPct}% of total</span>
                        </div>
                        <div class="specimen-card" style="padding:14px;">
                            <span style="font-size:0.7rem;color:var(--ink-light);text-transform:uppercase;letter-spacing:0.04em;">Combined Total</span>
                            <div style="font-size:1.5rem;font-weight:800;color:var(--accent-moss);margin:4px 0 2px;">${formatNum(totalAll)}</div>
                            <span style="font-size:0.72rem;color:var(--ink-medium);">all visitors</span>
                        </div>
                        <div class="specimen-card" style="padding:14px;">
                            <span style="font-size:0.7rem;color:var(--ink-light);text-transform:uppercase;letter-spacing:0.04em;">Peak Month</span>
                            <div style="font-size:1.5rem;font-weight:800;color:var(--accent-mustard);margin:4px 0 2px;">${peakMon}</div>
                            <span style="font-size:0.72rem;color:var(--ink-medium);">${formatNum(peak)} domestic</span>
                        </div>
                    </div>
                `;

                // Render dual-bar prediction chart (Domestic + Foreign)
                const ctx = document.getElementById('predict-chart');
                if (ctx) {
                    if (predictChart) predictChart.destroy();
                    predictChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: data.months.map(m => m.slice(0, 3)),
                            datasets: [
                                {
                                    label: 'Domestic (predicted)',
                                    data: data.predicted_domestic,
                                    backgroundColor: data.predicted_domestic.map(v =>
                                        v === peak ? 'rgba(200,90,73,0.95)' : 'rgba(200,90,73,0.6)'
                                    ),
                                    borderRadius: 4
                                },
                                {
                                    label: 'Foreign (estimated)',
                                    data: predictedForeign,
                                    backgroundColor: 'rgba(61,104,122,0.65)',
                                    borderRadius: 4
                                }
                            ]
                        },
                        options: pencilChartStyles.getOptions(`${monument} — ${year} Forecast`)
                    });
                }

            } catch (err) {
                resultEl.innerHTML = `<span style="color:#c85a49;"> Prediction failed: ${err.message}</span>`;
            } finally {
                runBtn.textContent = ' Predict Visitors';
                runBtn.disabled = false;
            }
        });
    }
}

import { getRawData } from './excel.js';

// Tracks current table state
let currentPage = 1;
let rowsPerPage = 4;
let currentData = [];
let currentSortColumn = null;
let currentSortAsc = true;

// Reset paging back to page 1, optionally load new data
export function resetPagination(newData = null) {
    currentPage = 1;
    currentData = newData || [];
}

// Render a specific page of data into the table body
export function displayPage(data, page) {
    const tbody = document.getElementById('resultTableBody');
    const start = (page - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, data.length);

    tbody.innerHTML = '';

    if (data.length === 0) {
        // Show “no data” message if nothing to display
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 100; // span all possible columns
        cell.textContent = 'No data to display.';
        cell.style.textAlign = 'center';
        row.appendChild(cell);
        tbody.appendChild(row);
    } else {
        // Create table rows for each visible item
        for (let i = start; i < end; i++) {
            const tr = document.createElement('tr');
            data[i].forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    }

    // Update the “Page X of Y” display
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = data.length > 0
        ? `Page ${page} of ${Math.ceil(data.length / rowsPerPage)}`
        : 'No results found.';
}

// Store filtered data and display a given page of it
export function filterAndDisplayRows(filteredData, page) {
    currentData = filteredData;
    displayPage(currentData, page);
}

// Navigate forward/backward between pages
export function changePage(delta) {
    const dataSet = currentData.length > 0 ? currentData : getRawData();
    const totalPages = Math.ceil(dataSet.length / rowsPerPage);
    const nextPage = currentPage + delta;

    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;
        displayPage(dataSet, currentPage);
    }
}

// Render clickable table headers that trigger sorting
export function renderHeaders(headers) {
    const headRow = document.getElementById('resultTableHeadRow');
    headRow.innerHTML = '';

    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => handleSort(index));
        headRow.appendChild(th);
    });
}

// Handle sorting when a column header is clicked
function handleSort(index) {
    const dataset = currentData.length > 0 ? currentData : getRawData();
    if (!dataset || dataset.length === 0) return;

    // Toggle sort direction if clicking same column
    if (currentSortColumn === index) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortColumn = index;
        currentSortAsc = true;
    }

    // Sort dataset (localeCompare handles numbers if { numeric: true })
    const sorted = [...dataset].sort((a, b) => {
        const valA = a[index] || '';
        const valB = b[index] || '';
        return currentSortAsc
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
    });

    // Show the sorted results starting at page 1
    resetPagination(sorted);
    filterAndDisplayRows(sorted, 1);
    updateSortIndicators(index, currentSortAsc);
}

// Add ▲ / ▼ arrows to indicate sort state
export function updateSortIndicators(activeIndex, asc) {
    const headers = document.querySelectorAll('#resultTable thead th');
    headers.forEach((th, idx) => {
        th.textContent = th.textContent.replace(/ ▲| ▼/, '');
        if (idx === activeIndex) {
            th.textContent += asc ? ' ▲' : ' ▼';
        }
    });
}

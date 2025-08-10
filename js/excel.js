import { displayPage, resetPagination, filterAndDisplayRows, renderHeaders } from './table.js';

// Stores the spreadsheet's raw rows and headers in memory
let rawData = [];
let currentHeaders = [];

// Simple getter so other modules can grab the raw table data
export function getRawData() {
    return rawData;
}

// Getter for whatever headers we’ve currently got loaded
export function getCurrentHeaders() {
    return currentHeaders;
}

// Reads the first sheet from an Excel file and kicks off processing
export function loadExcelData(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        // Parse the workbook from binary data
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        // Just grab the first sheet for now
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Convert the sheet into a 2D array (rows/columns)
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processData(json);
    };
    reader.readAsBinaryString(file); // Read file contents as binary so SheetJS can parse it
}

// Takes raw array data from SheetJS and gets it ready for display
function processData(json) {
    const [headers, ...rows] = json; // First row is headers, rest is the data

    // Store the table data as strings to keep things consistent
    rawData = rows.map(row => row.map(cell => cell.toString()));
    // Ensure headers are strings, fall back to "Column" if blank
    currentHeaders = headers.map(header => header?.toString?.() || 'Column');

    // Reset paging to the start and render table
    resetPagination();
    displayPage(rawData, 1);
    renderHeaders(currentHeaders);
}

// Filters rows based on a search term, then updates the table
export function searchSuburbs(query) {
    const lower = query.toLowerCase().trim();
    if (!lower) {
        // No search term — show the full table from page 1
        resetPagination();
        displayPage(rawData, 1);
    } else {
        // Match rows where ANY cell contains the query
        const filtered = rawData.filter(row =>
            row.some(cell => cell?.toLowerCase?.().includes(lower))
        );
        // Reset pagination for the filtered list
        resetPagination(filtered);
        filterAndDisplayRows(filtered, 1);
    }
}

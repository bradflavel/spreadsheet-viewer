export function setupNotepad() {
    const notePad = document.getElementById('notePad');
    const versionSelector = document.getElementById('versionSelector');

    // Save a version every 30 seconds
    const saveInterval = 30 * 1000; 
    // Delete versions older than 1 hour
    const deleteAfter = 60 * 60 * 1000; 

    // Fill dropdown with existing versions and load the newest one
    populateVersionSelector();
    loadMostRecentVersion();

    // Kick off autosave timer
    setInterval(saveCurrentVersion, saveInterval);

    // Wire up navigation buttons for going through saved versions
    document.getElementById('prevVersion').addEventListener('click', () => changeVersion(-1));
    document.getElementById('nextVersion').addEventListener('click', () => changeVersion(1));

    // Load whatever version the user picks from the dropdown
    versionSelector.addEventListener('change', loadSelectedVersion);

    // Save the current text into localStorage with a timestamp key
    function saveCurrentVersion() {
        const currentText = notePad.value;
        const mostRecentKey = getMostRecentKey();
        const mostRecentText = mostRecentKey ? localStorage.getItem(mostRecentKey) : null;

        // Skip save if nothing has changed
        if (currentText === mostRecentText) return;

        const timestamp = Date.now();
        localStorage.setItem(`textData_${timestamp}`, currentText);

        // Clean out old versions and refresh dropdown list
        deleteOldVersions();
        populateVersionSelector();
    }

    // Remove any saved versions older than deleteAfter
    function deleteOldVersions() {
        const now = Date.now();
        Object.keys(localStorage)
            .filter(key => key.startsWith('textData_'))
            .forEach(key => {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (now - timestamp > deleteAfter) {
                    localStorage.removeItem(key);
                }
            });
    }

    // Rebuild the version dropdown from localStorage entries
    function populateVersionSelector() {
        versionSelector.innerHTML = '';
        const versions = Object.keys(localStorage)
            .filter(key => key.startsWith('textData_'))
            .map(key => parseInt(key.split('_')[1], 10))
            .sort((a, b) => b - a); // newest first

        versions.forEach(timestamp => {
            const option = document.createElement('option');
            const date = new Date(timestamp);
            option.value = `textData_${timestamp}`;
            option.textContent = `Saved at ${date.toLocaleDateString('en-AU')} ${date.toLocaleTimeString('en-AU')}`;
            versionSelector.appendChild(option);
        });
    }

    // Load the version currently selected in the dropdown
    function loadSelectedVersion() {
        const selectedKey = versionSelector.value;
        if (selectedKey && localStorage.getItem(selectedKey)) {
            notePad.value = localStorage.getItem(selectedKey);
        }
    }

    // Auto-load the most recent saved version (if there is one)
    function loadMostRecentVersion() {
        const mostRecentKey = getMostRecentKey();
        if (mostRecentKey) {
            notePad.value = localStorage.getItem(mostRecentKey);
        }
    }

    // Find the storage key with the latest timestamp
    function getMostRecentKey() {
        let mostRecentTime = 0;
        let mostRecentKey = null;

        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('textData_')) {
                const timestamp = parseInt(key.split('_')[1], 10);
                if (timestamp > mostRecentTime) {
                    mostRecentTime = timestamp;
                    mostRecentKey = key;
                }
            }
        });

        return mostRecentKey;
    }

    // Move to a different version in the dropdown (prev/next buttons)
    function changeVersion(delta) {
        const newIndex = versionSelector.selectedIndex + delta;
        if (newIndex >= 0 && newIndex < versionSelector.options.length) {
            versionSelector.selectedIndex = newIndex;
            loadSelectedVersion();
        }
    }
}

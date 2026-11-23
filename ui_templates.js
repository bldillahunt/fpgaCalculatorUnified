export const FORMAT_DEFS = [
    { id: 'REAL', label: 'REAL (Signed Decimal)' },
    { id: 'HEX',  label: "HEX (2's Complement)" },
    { id: 'BIN',  label: "BIN (2's Complement / Q-Format)", spaced: true },
    { id: 'FP32', label: 'FP32 (IEEE-754 Single Hex)' },
    { id: 'FP64', label: 'FP64 (IEEE-754 Double Hex)' }
];

const KEYS = [
    ['7',''], ['8',''], ['9',''], ['/','op-btn'], ['%','op-btn'],
    ['4',''], ['5',''], ['6',''], ['*','op-btn'], ['&','op-btn'],
    ['1',''], ['2',''], ['3',''], ['-','op-btn'], ['|','op-btn'],
    ['0',''], ['.',''], ['Reset','reset-btn'], ['+','op-btn'], ['^','op-btn'],
    ['A',''], ['B',''], ['C',''], ['D',''], ['~','op-btn'],
    ['E',''], ['F',''], ['Back','reset-btn'], ['=','action-btn'], ['!','op-btn', "2's"]
];

export function renderDynamicUI() {
    document.getElementById('all_formats_list').innerHTML = FORMAT_DEFS.map(f => `
        <div class="format-row" id="row_${f.id}">
            <div class="format-row-top">
                <span class="format-tag">${f.label}</span>
                <div class="format-actions">
                    <button type="button" class="mini-btn use-input-btn" data-target-mode="${f.id}" data-source-id="${f.id === 'BIN' ? 'val_BIN_raw' : 'val_' + f.id}">Use as Input</button>
                    <button type="button" class="mini-btn copy-btn" data-source-id="${f.id === 'BIN' ? 'val_BIN_raw' : 'val_' + f.id}">Copy</button>
                </div>
            </div>
            <div class="format-val ${f.spaced ? 'nibble-spaced' : ''}" id="val_${f.id}">&mdash;</div>
            ${f.id === 'BIN' ? '<span id="val_BIN_raw" style="display:none;"></span>' : ''}
        </div>
    `).join('');

    document.getElementById('keypad_container').innerHTML = KEYS.map(([key, cls, label]) =>
        `<button type="button" data-key="${key}" class="${cls}">${label || key}</button>`
    ).join('');

}

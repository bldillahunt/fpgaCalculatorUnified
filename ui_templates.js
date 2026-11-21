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

    document.getElementById('help_modal').innerHTML = `
        <div class="help-panel">
            <div class="help-text">
                <h3>How It Works</h3>
                <p>This calculator emulates how an FPGA performs hardware math and bitwise logic. All operands convert to binary before execution, and results convert into all output formats simultaneously without built-in floating-point shortcuts.</p>
                <h3>Supported Data Types</h3>
                <ul>
                    <li><strong>REAL:</strong> Standard signed decimal numbers (e.g., <code>-12.75</code>).</li>
                    <li><strong>HEX:</strong> 2's complement hexadecimal (optional <code>0x</code> prefix stripped).</li>
                    <li><strong>BIN:</strong> 2's complement binary (optional <code>0b</code> prefix stripped); supports a binary point (e.g., <code>101.11</code>) for Q-format fixed-point values. Short binary inputs are <strong>sign-extended</strong> automatically.</li>
                    <li><strong>FP32 (Hex) &amp; FP64 (Hex):</strong> Raw IEEE-754 32-bit (8 hex digits) or 64-bit (16 hex digits) bit-patterns. To convert a decimal number into FP32/FP64 hex, select <strong>REAL</strong> as Input Format.</li>
                </ul>
                <h3>Operations &amp; Syntax</h3>
                <ul>
                    <li><strong>Math:</strong> <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, and modulo (<code>%</code>).</li>
                    <li><strong>Bitwise &amp; Logic:</strong> AND (<code>&amp;</code>), OR (<code>|</code>), XOR (<code>^</code>), NOT (<code>~</code>), and 2's complement (<code>!</code>).</li>
                    <li><strong>Forgiving Formatting:</strong> Spaces and <code>0x</code> / <code>0b</code> prefixes are cleaned automatically.</li>
                </ul>
                <p style="margin-top: 12px;">Found a bug or have a feature request? <a href="https://github.com" target="_blank" rel="noopener noreferrer">Report an issue on GitHub</a>.</p>
            </div>
            <button type="button" id="btn_close_help" class="close-help-btn">Close Guide</button>
        </div>
    `;
}

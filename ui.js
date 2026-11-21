import { compute_evaluation_step } from './calculator_top.js';
import { FORMAT_DEFS, renderDynamicUI } from './ui_templates.js';

renderDynamicUI();

const inputBox = document.getElementById('input_box');
const outputBox = document.getElementById('output_box');
const primaryOutputLabel = document.getElementById('primary_output_label');
const intBitsBox = document.getElementById('int_bits_box');
const fracBitsBox = document.getElementById('frac_bits_box');
const qValueBox = document.getElementById('q_output_format');
const useKeypadCheckbox = document.getElementById('use_keypad');
const keypadContainer = document.getElementById('keypad_container');
const pcButtonsContainer = document.getElementById('pc_buttons_container');
const helpModal = document.getElementById('help_modal');

const getRadio = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || "REAL";
const setRadio = (name, val) => { const r = document.querySelector(`input[name="${name}"][value="${val}"]`); if (r) r.checked = true; };
function sanitize(str, inMode) {
    let cleaned = str.replace(/\s+/g, '');
    if (inMode === 'HEX') cleaned = cleaned.replace(/^0x|(?<=[+\-*/%&|^~!])0x/gi, '');
    if (inMode === 'BIN') cleaned = cleaned.replace(/^0b|(?<=[+\-*/%&|^~!])0b/gi, '');
    return cleaned;
}

function formatBinaryNibbles(binStr) {
    if (!binStr || binStr === "ERROR") return binStr;
    const [intPart, fracPart = ''] = binStr.split('.');
    const padLen = (4 - (intPart.length % 4)) % 4;
    const signChar = intPart[0] === '1' ? '1' : '0';
    const groupedInt = (signChar.repeat(padLen) + intPart).match(/.{1,4}/g).join(' ');
    if (!fracPart) return groupedInt;
    const fracPadLen = (4 - (fracPart.length % 4)) % 4;
    const groupedFrac = (fracPart + '0'.repeat(fracPadLen)).match(/.{1,4}/g).join(' ');
    return `${groupedInt} . ${groupedFrac}`;
}

function clearAllOutputs() {
    outputBox.textContent = "";
    outputBox.classList.remove('error-text');
    qValueBox.textContent = `Q${intBitsBox.value || 16}.${fracBitsBox.value || 16}`;
    FORMAT_DEFS.forEach(f => { document.getElementById(`val_${f.id}`).textContent = "—"; });
    document.getElementById('val_BIN_raw').textContent = "";
}

function runCalculation(trigger = 'Enter') {
	const inMode = getRadio("input_mode");
	const cleaned = sanitize(inputBox.value, inMode);
    if (!cleaned) { clearAllOutputs(); return; }

    const outMode = getRadio("output_mode");
    const intBits = parseInt(intBitsBox.value, 10) || 16;
    const fracBits = parseInt(fracBitsBox.value, 10) || 16;

    const [mainVal, calcResult, qValue] = compute_evaluation_step(cleaned, inMode, outMode, intBits, fracBits, false, "Left");
    inputBox.value = mainVal;
    outputBox.textContent = calcResult;
    qValueBox.textContent = qValue || `Q${intBits}.${fracBits}`;
    primaryOutputLabel.textContent = `SELECTED OUTPUT (${outMode})`;

    FORMAT_DEFS.forEach(f => document.getElementById(`row_${f.id}`).classList.toggle('active-target', f.id === outMode));
    const isErr = !calcResult || calcResult.toUpperCase().includes("ERROR") || calcResult.toUpperCase().includes("INVALID");
    outputBox.classList.toggle('error-text', isErr);

    FORMAT_DEFS.forEach(f => {
        if (isErr) {
            document.getElementById(`val_${f.id}`).textContent = "—";
            if (f.id === 'BIN') document.getElementById('val_BIN_raw').textContent = "";
            return;
        }
        const res = (f.id === outMode) ? calcResult : compute_evaluation_step(cleaned, inMode, f.id, intBits, fracBits, false, "Right")[1];
        if (f.id === 'BIN') {
            document.getElementById('val_BIN_raw').textContent = res;
            document.getElementById('val_BIN').textContent = formatBinaryNibbles(res);
        } else {
            document.getElementById(`val_${f.id}`).textContent = res;
        }
    });

    if (typeof gtag === 'function') gtag('event', 'calculate', { trigger_method: trigger });
}

document.querySelectorAll('[data-key]').forEach(btn => btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-key');
    if (val === "R" || val === "Reset") { inputBox.value = ""; clearAllOutputs(); }
    else if (val === "Enter" || val === "=") { runCalculation(val); }
    else if (val === "Back") { inputBox.value = inputBox.value.slice(0, -1); }
    else { inputBox.value += val; }
}));

const flashCopy = (btn) => { const t = btn.textContent; btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = t; }, 1100); };

document.getElementById('copy_primary_btn').addEventListener('click', (e) => {
    if (outputBox.textContent && outputBox.textContent !== "—") { navigator.clipboard.writeText(outputBox.textContent); flashCopy(e.target); }
});

document.querySelectorAll('.copy-btn').forEach(btn => btn.addEventListener('click', () => {
    const txt = document.getElementById(btn.getAttribute('data-source-id'))?.textContent || "";
    if (txt && txt !== "—") { navigator.clipboard.writeText(txt); flashCopy(btn); }
}));

document.querySelectorAll('.use-input-btn').forEach(btn => btn.addEventListener('click', () => {
    const txt = document.getElementById(btn.getAttribute('data-source-id'))?.textContent || "";
    if (txt && txt !== "—" && !txt.toUpperCase().includes("ERROR")) {
        const mode = btn.getAttribute('data-target-mode');
        inputBox.value = txt;
        setRadio('input_mode', mode);
        if (mode !== 'REAL') setRadio('output_mode', 'REAL');
        runCalculation('UseAsInput');
    }
}));

inputBox.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runCalculation('Enter'); } });
document.getElementById('output_mode_container').addEventListener('change', () => { if (inputBox.value.trim()) runCalculation('OutputFormatSwitch'); });
[intBitsBox, fracBitsBox].forEach(el => el.addEventListener('change', () => { if (inputBox.value.trim()) runCalculation('BitWidthChange'); }));

function setKeypadVisibility(show) {
    useKeypadCheckbox.checked = show;
    keypadContainer.style.display = show ? 'grid' : 'none';
    pcButtonsContainer.style.display = show ? 'none' : 'flex';
    if (show) inputBox.setAttribute('readonly', true); else inputBox.removeAttribute('readonly');
}

window.addEventListener('DOMContentLoaded', () => {
    const isTouch = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '') || window.matchMedia('(pointer: coarse)').matches;
    setKeypadVisibility(isTouch);
    runCalculation('InitialLoad');
});

useKeypadCheckbox.addEventListener('change', () => setKeypadVisibility(useKeypadCheckbox.checked));
document.getElementById('btn_help').addEventListener('click', () => { helpModal.style.display = 'flex'; });
document.getElementById('btn_close_help').addEventListener('click', () => { helpModal.style.display = 'none'; });
helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });

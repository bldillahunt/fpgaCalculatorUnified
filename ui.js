import { compute_evaluation_step } from './calculator_top.js';
import { FORMAT_DEFS, renderDynamicUI } from './ui_templates.js';

renderDynamicUI();

const inputBox = document.getElementById('input_box');
const outputBox = document.getElementById('output_box');
const operandAbox = document.getElementById('simple-op-a');
const operandBbox = document.getElementById('simple-op-b');
const unaryBoxA = document.getElementById('simple-prefix-a');
const unaryBoxB = document.getElementById('simple-prefix-b');

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


const btnSimple = document.getElementById('btn-mode-simple');
const btnAdvanced = document.getElementById('btn-mode-advanced');
const panelSimple = document.getElementById('simple-input-panel');
const panelAdvanced = document.getElementById('advanced-input-panel');
//const mainInput = document.getElementById('input_box');

const intBits = parseInt(intBitsBox.value, 10) || 16;
const fracBits = parseInt(fracBitsBox.value, 10) || 16;

// Simple mode state
const state = {
	prefixA: '',
	prefixB: '',
	operator: '+'
};

let displayMode = "Simple";

// 1. Toggle between Simple & Advanced modes
function setMode(mode) {
	const isSimple = mode === 'simple';
	btnSimple.classList.toggle('active', isSimple);
	btnAdvanced.classList.toggle('active', !isSimple);
	panelSimple.classList.toggle('hidden', !isSimple);
	panelAdvanced.classList.toggle('hidden', isSimple);
	localStorage.setItem('fpgaCalcInputMode', mode);

//	if (isSimple) syncSimpleToMain();
}

btnSimple.addEventListener('click', () => setMode('simple'));
btnAdvanced.addEventListener('click', () => {
	displayMode = "Advanced";
	setMode('advanced')
});

// Restore saved user preference (defaults to 'simple' for first-time visitors)
const savedMode = localStorage.getItem('fpgaCalcInputMode') || 'simple';
setMode(savedMode);

document.querySelectorAll('.bin-op').forEach(btn => {
	btn.addEventListener('click', () => {
	  document.querySelectorAll('.bin-op').forEach(b => b.classList.remove('active'));
	  btn.classList.add('active');
	  state.operator = btn.dataset.op;
//	  syncSimpleToMain();
	});
});

// 3. Bridge Simple Mode to Your Existing Radio-Button Evaluator
function syncSimpleToMain() {
	const typeA = document.getElementById('simple-type-a').value;
	const valA = sanitize(operandAbox.value, typeA);
	const typeB = document.getElementById('simple-type-b').value;
	const valB = sanitize(operandBbox.value, typeB);
	const outMode = getRadio("output_mode");
	let virtual_input_value = "";

	if (!valA) return;

	// If only Operand A is entered, set the main Input Radio to typeA directly
	if (!valB) {
	  selectInputRadio(typeA);
	  virtual_input_value = `${unaryBoxA.value}${valA}`;
	  triggerCalculation(virtual_input_value, typeA, typeB, outMode, intBits, fracBits);
	  return;
	}

	// If both operands share the same type, pass them straight through
	if (typeA === typeB) {
	  selectInputRadio(typeA);
	  virtual_input_value = `${unaryBoxA.value}${valA}${state.operator}${unaryBoxB.value}${valB}`;
	  triggerCalculation(virtual_input_value, typeA, typeB, outMode, intBits, fracBits);
	  return;
	}

	// MIXED TYPES: Convert both operands into BIN (your internal common format)
	// and automatically switch the active Input Type radio button to BIN
	const binA = valA; // Hook into your existing converter
	const binB = valB; // Hook into your existing converter

	selectInputRadio('BIN');
	virtual_input_value = `${unaryBoxA.value}${binA}${state.operator}${unaryBoxB.value}${binB}`;
	triggerCalculation(virtual_input_value, typeA, typeB, outMode, intBits, fracBits);
}

// Helper: Programmatically check the matching Input Type radio button
function selectInputRadio(typeValue) {
	const radio = document.querySelector(`input[name="inputType"][value="${typeValue}"]`);
	if (radio && !radio.checked) {
	  radio.checked = true;
	  radio.dispatchEvent(new Event('change'));
	}
}

function triggerCalculation(virtual_display, inModeA, inModeB, outMode, intBits, fracBits) {
	const [mainVal, calcResult, qValue] = compute_evaluation_step(virtual_display, inModeA, inModeB, outMode, intBits, fracBits, false, "Left")
    outputBox.textContent = calcResult;
    qValueBox.textContent = qValue || `Q${intBits}.${fracBits}`;
    format_defs_right_panel(calcResult, virtual_display, inModeA, inModeB, outMode, intBits, fracBits, "Right");
}

// Listen for typing or dropdown changes in Simple Mode
['simple-op-a', 'simple-type-a', 'simple-op-b', 'simple-type-b'].forEach(id => {
//document.getElementById(id).addEventListener('input', syncSimpleToMain);
//  document.getElementById(id).addEventListener('change', syncSimpleToMain);
});

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

function format_defs_right_panel(calcResult, cleaned, inModeA, inModeB, outMode, intBits, fracBits, panel) {
    FORMAT_DEFS.forEach(f => document.getElementById(`row_${f.id}`).classList.toggle('active-target', f.id === outMode));
    const isErr = !calcResult || calcResult.toUpperCase().includes("ERROR") || calcResult.toUpperCase().includes("INVALID");
    outputBox.classList.toggle('error-text', isErr);

    FORMAT_DEFS.forEach(f => {
        if (isErr) {
            document.getElementById(`val_${f.id}`).textContent = "—";
            if (f.id === 'BIN') document.getElementById('val_BIN_raw').textContent = "";
            return;
        }
        const res = (f.id === outMode) ? calcResult : compute_evaluation_step(cleaned, inModeA, inModeA, f.id, intBits, fracBits, false, panel)[1];
        if (f.id === 'BIN') {
            document.getElementById('val_BIN_raw').textContent = res;
            document.getElementById('val_BIN').textContent = formatBinaryNibbles(res);
        } else {
            document.getElementById(`val_${f.id}`).textContent = res;
        }
    });
}
function runCalculation(trigger = 'Enter') {
	const inMode = getRadio("input_mode");
	const cleaned = sanitize(inputBox.value, inMode);
    if (!cleaned) { clearAllOutputs(); return; }

    const outMode = getRadio("output_mode");
    const intBits = parseInt(intBitsBox.value, 10) || 16;
    const fracBits = parseInt(fracBitsBox.value, 10) || 16;

    const [mainVal, calcResult, qValue] = compute_evaluation_step(cleaned, inMode, inMode, outMode, intBits, fracBits, false, "Left");
    inputBox.value = mainVal;
    outputBox.textContent = calcResult;
    qValueBox.textContent = qValue || `Q${intBits}.${fracBits}`;
    primaryOutputLabel.textContent = `SELECTED OUTPUT (${outMode})`;

	format_defs_right_panel(calcResult, cleaned, inMode, inMode, outMode, intBits, fracBits, "Right");

    if (typeof gtag === 'function') gtag('event', 'calculate', { trigger_method: trigger });
}

document.querySelectorAll('[data-key]').forEach(btn => btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-key');
    if (val === "R" || val === "Reset") {
		inputBox.value = "";
		operandAbox.value = "";
		operandBbox.value = "";
		unaryBoxA.value = "";
		unaryBoxB.value = "";
		clearAllOutputs();
	}
    else if (val === "Enter" || val === "=") {
		if (displayMode === "Simple") {
			syncSimpleToMain();
		}
		else {
			runCalculation(val);
		}
	}
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

inputBox.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		e.preventDefault();
		runCalculation('Enter');
	}
});
operandAbox.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		e.preventDefault();
		syncSimpleToMain();
	}
});
operandBbox.addEventListener('keydown', (e) => {
	if (e.key === 'Enter') {
		e.preventDefault();
		syncSimpleToMain();
	}
});

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


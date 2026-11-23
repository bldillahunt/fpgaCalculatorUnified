function runSimpleCalculation(trigger = 'Enter') {
    const intBits = parseInt(intBitsBox.value, 10) || 16;
    const fracBits = parseInt(fracBitsBox.value, 10) || 16;
    const outMode = getRadio("output_mode");

    // 1. Read Simple Mode DOM elements (adjust IDs to match your HTML)
    const opA = sanitize(document.getElementById('simple_input_a').value, modeA);
    const prefixA = getRadio('prefix_a'); // "", "~", or "!"
    const modeA = getRadio('mode_a');     // "REAL", "HEX", "BIN", "FP32", "FP64"

    const operator = document.getElementById('simple_operator').value; // "+", "-", "*", etc.

    const opB = sanitize(document.getElementById('simple_input_b').value, modeB);
    const prefixB = getRadio('prefix_b');
    const modeB = getRadio('mode_b');

    if (!opA) { clearAllOutputs(); return; }

    // 2. Resolve Operand A (Convert to a common format like BIN or REAL, applying prefix if selected)
    // Using 'BIN' preserves exact fixed-point bit widths across mismatched operands
    const targetIntermediate = 'BIN'; 
    let valA = opA;
    if (prefixA || modeA !== targetIntermediate) {
        const [, resA] = compute_evaluation_step(`${prefixA}${opA}`, modeA, targetIntermediate, intBits, fracBits, false, "Left");
        valA = resA;
    }

    // If Operand B is empty, treat as a single-operand conversion
    if (!opB) {
        updateAllOutputCards(valA, targetIntermediate, outMode, intBits, fracBits);
        return;
    }

    // 3. Resolve Operand B
    let valB = opB;
    if (prefixB || modeB !== targetIntermediate) {
        const [, resB] = compute_evaluation_step(`${prefixB}${opB}`, modeB, targetIntermediate, intBits, fracBits, false, "Right");
        valB = resB;
    }

    // 4. Combine & Display Final Result
    const combinedExpr = `${valA}${operator}${valB}`;
    updateAllOutputCards(combinedExpr, targetIntermediate, outMode, intBits, fracBits);
}

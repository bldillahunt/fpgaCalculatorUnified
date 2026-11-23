document.addEventListener('DOMContentLoaded', () => {
  const btnSimple = document.getElementById('btn-mode-simple');
  const btnAdvanced = document.getElementById('btn-mode-advanced');
  const panelSimple = document.getElementById('simple-input-panel');
  const panelAdvanced = document.getElementById('advanced-input-panel');
  const mainInput = document.getElementById('main-expression-input');

  // Simple mode state
  const state = {
    prefixA: '',
    prefixB: '',
    operator: '+'
  };

  // 1. Toggle between Simple & Advanced modes
  function setMode(mode) {
    const isSimple = mode === 'simple';
    btnSimple.classList.toggle('active', isSimple);
    btnAdvanced.classList.toggle('active', !isSimple);
    panelSimple.classList.toggle('hidden', !isSimple);
    panelAdvanced.classList.toggle('hidden', isSimple);
    localStorage.setItem('fpgaCalcInputMode', mode);

    if (isSimple) syncSimpleToMain();
  }

  btnSimple.addEventListener('click', () => setMode('simple'));
  btnAdvanced.addEventListener('click', () => setMode('advanced'));

  // Restore saved user preference (defaults to 'simple' for first-time visitors)
  const savedMode = localStorage.getItem('fpgaCalcInputMode') || 'simple';
  setMode(savedMode);

  // 2. Handle Unary & Binary Operator Button Clicks
  document.querySelectorAll('.unary-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target; // 'a' or 'b'
      document.querySelectorAll(`.unary-btn[data-target="${target}"]`)
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (target === 'a') state.prefixA = btn.dataset.op;
      if (target === 'b') state.prefixB = btn.dataset.op;
      syncSimpleToMain();
    });
  });

  document.querySelectorAll('.bin-op').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bin-op').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.operator = btn.dataset.op;
      syncSimpleToMain();
    });
  });

  // 3. Bridge Simple Mode to Your Existing Radio-Button Evaluator
  function syncSimpleToMain() {
    const valA = document.getElementById('simple-op-a').value.trim();
    const typeA = document.getElementById('simple-type-a').value;
    const valB = document.getElementById('simple-op-b').value.trim();
    const typeB = document.getElementById('simple-type-b').value;

    if (!valA) return;

    // If only Operand A is entered, set the main Input Radio to typeA directly
    if (!valB) {
      selectInputRadio(typeA);
      mainInput.value = `${state.prefixA}${valA}`;
      triggerCalculation();
      return;
    }

    // If both operands share the same type, pass them straight through
    if (typeA === typeB) {
      selectInputRadio(typeA);
      mainInput.value = `${state.prefixA}${valA} ${state.operator} ${state.prefixB}${valB}`;
      triggerCalculation();
      return;
    }

    // MIXED TYPES: Convert both operands into BIN (your internal common format)
    // and automatically switch the active Input Type radio button to BIN
    const binA = convertAnyToBinaryString(valA, typeA); // Hook into your existing converter
    const binB = convertAnyToBinaryString(valB, typeB); // Hook into your existing converter

    selectInputRadio('BIN');
    mainInput.value = `${state.prefixA}${binA} ${state.operator} ${state.prefixB}${binB}`;
    triggerCalculation();
  }

  // Helper: Programmatically check the matching Input Type radio button
  function selectInputRadio(typeValue) {
    const radio = document.querySelector(`input[name="inputType"][value="${typeValue}"]`);
    if (radio && !radio.checked) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    }
  }

  // Stub: Connect to your existing conversion & calculate functions
  function convertAnyToBinaryString(val, fromType) {
    // Replace with your existing parser's toBinary(val, fromType) function
    return val; 
  }

  function triggerCalculation() {
    // Replace with your existing calculate() call
    if (typeof calculate === 'function') calculate();
  }

  // Listen for typing or dropdown changes in Simple Mode
  ['simple-op-a', 'simple-type-a', 'simple-op-b', 'simple-type-b'].forEach(id => {
    document.getElementById(id).addEventListener('input', syncSimpleToMain);
    document.getElementById(id).addEventListener('change', syncSimpleToMain);
  });
});

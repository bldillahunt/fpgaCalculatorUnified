import {
    twos_complement,
    binary_string_to_int_list, int_list_to_binary_string,
    binary_point_alignment, list_to_string
} from './binary_support.js';

import {
    real_to_twos_comp_binary, hexadecimal_to_binary,
    ieee754_hex_to_binary, binary_to_real,
    binary_to_hexadecimal, binary_to_ieee754
} from './binary_conversions.js';

import {
    binary_division, binary_multiplier, binary_adder,
    binary_subtraction, binary_modulo, binary_twos_complement
} from './binary_math.js';

import { binary_and, binary_or, binary_xor, binary_not } from './binary_logic.js';
import {
	precision_profile, lookup_table
} from './binary_constants.js';

const HEX_NEGATIVE_LIST = ["8", "9", "A", "B", "C", "D", "E", "F", "a", "b", "c", "d", "e", "f"];

function isAlnum(ch) {
    return /^[a-z0-9]$/i.test(ch);
}

export function compute_evaluation_step(main_display_value, input_mode1, input_mode2, output_mode, int_bits, frac_bits, enable_print_statements = false, gui_panel) {
    const nibble_size = Math.floor(int_bits / 4);
    let input_index = 0;
	let	operand1 = "";
	let	left_unary = "";
	let	operator = "";
	let	operand1_present = false;
	let	operator_present = false;
	let current_index = 0;
	let input_error = false;

	console.log(main_display_value);

	[operand1, left_unary, operator, operand1_present, operator_present, input_error, current_index] = parse_input_string(main_display_value, input_index);

	let	operand2 = "";
	let	right_unary = "";
	let	null_operator = "";
	let	operand2_present = false;
	let	null_operator_present = false;
	let	output_index = 0;

	if (operator_present === true) {
		[operand2, right_unary, null_operator, operand2_present, null_operator_present, input_error, output_index] = parse_input_string(main_display_value, current_index);
	}
	else {
		operand2 = "";
		right_unary = "";
		operand2_present = false;
	}

	console.log(operand1, operator, operand2, input_error, input_mode1, input_mode2, operand1_present, operand2_present);

    let operand1_data_error = false;
    let operand2_data_error = false;

    if (!input_error) {
        if (input_mode1 === "REAL") {
            operand1_data_error = verify_real_input(operand1);
        } else if (input_mode1 === "HEX") {
            if (operand1.length > 0 && operand1.length < nibble_size) {
                const padChar = HEX_NEGATIVE_LIST.includes(operand1[0]) ? "F" : "0";
                operand1 = operand1.padStart(nibble_size, padChar);
            }
            operand1_data_error = verify_hex_input(operand1, int_bits, frac_bits);
        } else if (input_mode1 === "BIN") {
            operand1_data_error = verify_bin_input(operand1);
        } else if (input_mode1 === "FP32") {
            operand1_data_error = verify_fp32_input(operand1);
        } else if (input_mode1 === "FP64") {
            operand1_data_error = verify_fp64_input(operand1);
        }

		if (operator_present === true) {
			if (input_mode2 === "REAL") {
				operand2_data_error = verify_real_input(operand2);
			} else if (input_mode2 === "HEX") {
				if (operand2.length > 0 && operand2.length < nibble_size) {
					const padChar = HEX_NEGATIVE_LIST.includes(operand2[0]) ? "F" : "0";
					operand2 = operand2.padStart(nibble_size, padChar);
				}
				operand2_data_error = verify_hex_input(operand2, int_bits, frac_bits);
			} else if (input_mode2 === "BIN") {
				operand2_data_error = verify_bin_input(operand2);
			} else if (input_mode2 === "FP32") {
				operand2_data_error = verify_fp32_input(operand2);
			} else if (input_mode2 === "FP64") {
				operand2_data_error = verify_fp64_input(operand2);
			}
		}
    }

    const operator_error = verify_operator(operator, input_mode1, output_mode);

    if (!input_error) {
        if (((operand1.includes('.') || operand2.includes('.')) && ["&", "|", "^", "~", "!"].includes(operator)) || (operator_error && operator !== "")) {
			if (gui_panel === "Left") {
				if (["&", "|", "^", "~", "!"].includes(operator)){
					if (((input_mode1 !== "BIN") && (input_mode1 !== "HEX")) || ((input_mode2 !== "BIN") && (input_mode2 !== "HEX"))) {
						return ["", "Use hex or binary input", ""];
					}
					else if ((output_mode === "BIN") || (output_mode === "HEX")) {
						return ["", "Radix point not supported", ""];
					}
					else {
						return ["", "Use hex or binary output", ""];
					}
				}
			}
			else {
            	return ["", "", ""];
			}
        } else if (!operand1_data_error && !operand2_data_error && !operator_error) {
            let operand1_binary;
            let operand1_unary;

            if (left_unary === "~" || left_unary === "!") {
				operand1_unary = convert_to_binary(operand1, input_mode1, int_bits, 0);
				operand1_binary = binary_math_operation(operand1_unary, "", left_unary, int_bits, frac_bits, "BIN", enable_print_statements);
			}
			else {
				if (["~", "!"].includes(operator) || (operand2_present && ["&", "|", "^"].includes(operator))) {
					operand1_binary = convert_to_binary(operand1, input_mode1, int_bits, 0);
				} else {
					operand1_binary = convert_to_binary(operand1, input_mode1, int_bits, frac_bits);
				}
			}

            let calculator_result;
            let binary_result = "";

            if (operand2_present) {
                let operand2_binary;
				let operand2_unary;

				if (right_unary === "~" || right_unary === "!") {
					operand2_unary = convert_to_binary(operand2, input_mode2, int_bits, 0);
					operand2_binary = binary_math_operation(operand2_unary, "", right_unary, int_bits, frac_bits, "BIN", enable_print_statements);
				}
				else {
					if (["&", "|", "^"].includes(operator)) {
						operand2_binary = convert_to_binary(operand2, input_mode2, int_bits, 0);
					} else {
						operand2_binary = convert_to_binary(operand2, input_mode2, int_bits, frac_bits);
					}
				}
                binary_result = binary_math_operation(operand1_binary, operand2_binary, operator, int_bits, frac_bits, output_mode, enable_print_statements);
                calculator_result = convert_from_binary(binary_result, output_mode);
            } else if (["~", "!", "2'S", "2's"].includes(operator)) {
                binary_result = binary_math_operation(operand1_binary, null, operator, int_bits, frac_bits, output_mode, enable_print_statements);
                calculator_result = convert_from_binary(binary_result, output_mode);
            } else {
				binary_result = operand1_binary;
                calculator_result = convert_from_binary(binary_result, output_mode);
            }

			let q_display_value = "";

			if (output_mode === "HEX") {
				let binary_size = binary_result.length;
				let result_size = calculator_result.length * 4;

				if (binary_result.includes('.')) {
					let radix_index = binary_result.indexOf('.');
					let q_fraction_size = binary_size - (radix_index + 1);
					let q_integer_size = result_size - q_fraction_size;
					q_display_value = `Q${q_integer_size}.${q_fraction_size}`;
				}
				else {
					let q_integer_size = result_size;
					let q_fraction_size = 0;
					q_display_value = `Q${q_integer_size}.${q_fraction_size}`;
				}
			}
			else {
				q_display_value = "";
			}
            return [main_display_value, calculator_result, q_display_value];
        } else {
            return ["", "ERROR", ""];
        }
    } else {
        return ["", "ERROR", ""];
    }
}

function parse_input_string(input_string, input_index) {
    let state = 'Empty_String_Check';
    const data_length = input_string.length;
    let operand = "";
    let unary = ""
    let operator = "";
    let operand_present = false;
    let operator_present = false;
    let input_error = false;

    while (true) {
        if (state === 'Empty_String_Check') {
            if (!input_string) {
				console.log("No input string", operand, input_index);
                return [ operand, unary, operator, operand_present, operator_present, true, input_index ];
            }
            state = 'First_Character';
        } else if (state === 'First_Character') {
            const ch = input_string[input_index];

            if (['+', '~', '!'].includes(ch)) {
                if (['~', '!'].includes(ch)) unary = ch;

                if (data_length > 1) {
                    input_index += 1;
                    state = 'CAPTURE_OPERAND';
                } else {
					console.log("Single character", operand, input_index, ch);
                    return [ operand, unary, operator, operand_present, operator_present, true, input_index ];
                }
            } else if (ch === '-') {
                operand += ch;

                if (data_length > 1) {
                    input_index += 1;
                    state = 'CAPTURE_OPERAND';
                } else {
					console.log("Minus sign", operand, input_index, ch);
                    return [ operand, unary, operator, operand_present, operator_present, true, input_index ];
                }
            }
            else if (isAlnum(ch)) {
                operand += ch;
                operand_present = true;

                if (data_length > 1) {
                    input_index += 1;
                    state = 'CAPTURE_OPERAND';
                } else {
                    return [ operand, unary, operator, operand_present, operator_present, input_error, input_index ];
                }
			}
            else {
				console.log("Unknown first character", operand, input_index, ch);
                return [ operand, unary, operator, operand_present, operator_present, true, input_index ];
            }
        } else if (state === 'CAPTURE_OPERAND') {
            const ops = ["+", "-", "*", "/", "%", "&", "|", "^"];

            while ((input_index < data_length) && (!ops.includes(input_string[input_index]))) {
                const ch = input_string[input_index];

                if (isAlnum(ch) || ch === '.') {
                    operand += ch;

                    if (input_index < data_length - 1) {
                        input_index += 1;
                    } else {
                        operand_present = true;
                        return [ operand, unary, operator, operand_present, operator_present, input_error, input_index ];
                    }
                } else {
					console.log("Unknown character in operand", operand, input_index, ch);
                    return [ operand, unary, operator, operand_present, operator_present, true, input_index ];
                }
            }

            operand_present = true;
            operator_present = true;
			operator = input_string[input_index];
			input_index += 1;
            return [ operand, unary, operator, operand_present, operator_present, input_error, input_index ];
    	}
	}
}
function verify_real_input(input_string) {
    return input_string.trim() === "" || isNaN(Number(input_string));
}

function verify_hex_input(input_string, int_bits, frac_bits) {
    if (!/^[0-9a-fA-F]+$/.test(input_string)) return true;
    return input_string.length > (int_bits + frac_bits) / 4;
}

function verify_bin_input(input_string) {
    const dotCount = (input_string.match(/\./g) || []).length;
    if (!/^[01.]+$/.test(input_string)) return true;
    return (dotCount > 1 || (input_string[0] !== '0' && input_string[0] !== '1') || input_string[input_string.length - 1] === '.');
}

function verify_fp32_input(input_string) {
    if (!/^[0-9a-fA-F]+$/.test(input_string)) return true;
    return input_string.length !== 8;
}

function verify_fp64_input(input_string) {
    if (!/^[0-9a-fA-F]+$/.test(input_string)) return true;
    return input_string.length !== 16;
}

function verify_operator(input_string, input_mode1, output_mode) {
    let logic_error = false;
    if (["&", "|", "^", "~", "!", "2'S", "2's"].includes(input_string)) {
        logic_error = ["REAL", "FP32", "FP64"].includes(input_mode1) || ["REAL", "FP32", "FP64"].includes(output_mode);
    }
    return (!["+", "-", "*", "/", "%", "&", "|", "^", "~", "!", "2'S", "2's", ""].includes(input_string)) || logic_error;
}

function convert_to_binary(operand, input_mode1, int_bits, frac_bits) {
    if (input_mode1 === "REAL") {
        return binary_string_to_int_list(real_to_twos_comp_binary(operand, int_bits, frac_bits));
    } else if (input_mode1 === "HEX") {
        return binary_string_to_int_list(hexadecimal_to_binary(operand, int_bits, lookup_table));
    } else if (input_mode1 === "FP32") {
        return ieee754_hex_to_binary(operand, precision_profile["SINGLE"], lookup_table);
    } else if (input_mode1 === "FP64") {
        return ieee754_hex_to_binary(operand, precision_profile["DOUBLE"], lookup_table);
    } else {
        return binary_string_to_int_list(operand);
    }
}

function binary_math_operation(operand1, operand2, operator, int_bits, frac_bits, output_mode, enable_print_statements = false) {
    if (operator === "/") {
        let max_size = int_bits + frac_bits;
        if (output_mode === "FP32") max_size = Math.max(64, int_bits + frac_bits);
        else if (output_mode === "FP64") max_size = Math.max(128, int_bits + frac_bits);
        return binary_division(operand1, operand2, max_size);
    } else if (operator === "*") {
        return binary_multiplier(operand1, operand2);
    } else if (operator === "+") {
        const [addend_a, addend_b, op1_f, op2_f] = binary_point_alignment(operand1, operand2, false);
        const fraction_size = Math.max(op1_f, op2_f);
        const [n_sum, n_carry] = binary_adder(addend_a, addend_b);

        let sum_result;
        if ((operand1[0] === 0 && operand2[0] === 0 && n_sum[0] === 1) || (operand1[0] === 1 && operand2[0] === 1 && n_sum[0] === 0)) {
            sum_result = [n_carry, ...n_sum];
        } else {
            sum_result = n_sum;
        }

        const binary_point_index = sum_result.length - fraction_size;
        return [...sum_result.slice(0, binary_point_index), '.', ...sum_result.slice(binary_point_index)];
    } else if (operator === "-") {
        return binary_subtraction(operand1, operand2);
    } else if (operator === "%") {
        return binary_modulo(operand1, operand2, int_bits + frac_bits);
    } else if (operator === "&") {
        return binary_and(operand1, operand2);
    } else if (operator === "|") {
        return binary_or(operand1, operand2);
    } else if (operator === "^") {
        return binary_xor(operand1, operand2);
    } else if (operator === "~") {
        return binary_not(operand1);
    } else if (["!", "2'S", "2's"].includes(operator)) {
        return binary_twos_complement(operand1);
    }
}

function convert_from_binary(operand, output_mode) {
    if (output_mode === "REAL") {
        return binary_to_real(operand);
    } else if (output_mode === "HEX") {
        return binary_to_hexadecimal(operand, lookup_table);
    } else if (output_mode === "FP32") {
        return binary_to_ieee754(operand, precision_profile["SINGLE"], lookup_table);
    } else if (output_mode === "FP64") {
        return binary_to_ieee754(operand, precision_profile["DOUBLE"], lookup_table);
    } else {
        return int_list_to_binary_string(operand, operand.length).join("");
    }
}

// =====================================================================
// UI EVENT ROUTING
// =====================================================================

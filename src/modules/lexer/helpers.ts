export function isWhitespace(input: string) {
    const WHITESPACE = [" ", "\n", "\t", "\r", "\f", "\v"];
    return WHITESPACE.includes(input);
}

export function stringsByLen(a: string, b: string) {
    return b.length - a.length; // desc
}

export function isNumeric(input: string) {
    // 0-9 or decimal point
    return /^[0-9.]+$/.test(input);
}

export function isLegalIdentifier(input: string) {
    // any letter, numeric, underscore or dollar sign
    return /^[\p{L}0-9_$]+$/u.test(input);
}

export function isCharAlpha(ch: string) {
    const start = 'a'.charCodeAt(0);
    const end = 'z'.charCodeAt(0);
    const val = ch.toLowerCase().charCodeAt(0);
    return start <= val && end >= val;
}

export function isCharNumber(ch: string) {
    const start = '0'.charCodeAt(0);
    const end = '9'.charCodeAt(0);
    const val = ch.charCodeAt(0);
    return start <= val && end >= val;
}

export function isCharAlphanumeric(ch: string) {
    return isCharAlpha(ch) || isCharNumber(ch);
}

export function isCharWhitespace(ch: string) {
    return ch === " " || ch === "\n";
}

export function isCharSign(ch: string) {
    const val = ch.charCodeAt(0);
    return ("!".charCodeAt(0) <= val && val <= "/".charCodeAt(0))
        || (";".charCodeAt(0) <= val && val <= "@".charCodeAt(0))
        || ("[".charCodeAt(0) <= val && val <= "`".charCodeAt(0))
        || ("{".charCodeAt(0) <= val && val <= "~".charCodeAt(0));
}


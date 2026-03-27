'use strict';

import {B64, convertBase} from './third-party/convertBase.js';
const RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function pad(str) {    
    const padding = str.length % 4;

    if (padding === 2) {
        str += '==';
    } else if (padding === 3) {
        str += '=';
    }

    return str;
}
function unpad(str) {
    return str.replace(/=+$/, '');
}

function convertB64(str, chars, toStandard = false) {
    const source = toStandard ? chars : RFC4648;
    const target = toStandard ? RFC4648 : chars;
    
    let out = [];
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === '=') {
            out.push('=');
            continue;
        }
        const index = source.indexOf(char);
        out.push(index !== -1 ? target[index] : char);
    }
    return out.join('');
}

function random() {
    const index = Math.floor(Math.random() * 62) + 1;
    return RFC4648[index];
}

/**
 * Converts UTF-16 string to any base
 * 
 * @param {string} str - UTF-16 string
 * @param {number?} base - Base number (`optional`) (`64` by default)
 * @param {string?} baseChars - Base characters string (`optional`) (supports up to Base64 by default)
 * @param {number?} setData - Set encoded integer (1-63) (`optional`)
 * @returns {string} Encoded string
 */
export function encode(str, base = 64, baseChars = B64, setData = 0) {
    let bytes = [];

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        bytes.push(code >> 8);
        bytes.push(code & 0xFF);
    }

    const b64 = pad((
        setData > 0 && setData < 64 ? RFC4648[setData] : base == 64 ? '' : random()
    ) + unpad(btoa(String.fromCharCode(...bytes))));
    if (base == 64) {
        if (baseChars != RFC4648) return convertB64(b64, baseChars);
        return b64;
    } else return pad(convertBase(unpad(b64), 64, base, baseChars));
}

function parseEncoded(str, base, getData) {
    const hasData = base != 64 || getData;
    if (hasData) return [
        str.slice(1), str.slice(0,1)
    ]; else return [
        str, null
    ];
}

/**
 * Converts any base string to UTF-16
 * 
 * @param {string} str - Encoded string
 * @param {number?} base - Base number (`optional`) (`64` by default)
 * @param {string?} baseChars - Base characters string (`optional`) (supports up to Base64 by default)
 * @param {boolean?} getData - Get encoded integer (1-63), returns an array `[string, number]` (`optional`) (`false` by default)
 * @returns {string|[string,number]} UTF-16 string
 */
export function decode(str, base = 64, baseChars = B64, getData = false) {
    let [b64, data] = parseEncoded(str, base, getData);
    if (base != 64) {
        const input = pad(convertBase(unpad(str), base, 64, baseChars));
        [b64, data] = parseEncoded(input, base, getData);
    } else if (baseChars != RFC4648) {
        const input = convertB64(str, baseChars, true);
        [b64, data] = parseEncoded(input, base, getData);
    }

    const bytes = atob(b64);
    let out = '';

    for (let i = 0; i < bytes.length; i += 2) {
        const code = (bytes.charCodeAt(i) << 8) | bytes.charCodeAt(i + 1);
        out += String.fromCharCode(code);
    }

    return getData ? [out, RFC4648.indexOf(data)] : out;
}

export const internal = {RFC4648, convertB64, B64};

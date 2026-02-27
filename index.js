'use strict';

import { B64, convertBase } from "./third-party/convertBase.js";
import emojiObject from 'unicode-emoji-json' with {type: 'json'};

const emoji = Object.keys(emojiObject);
const emojiOffset = 0x10001;
function buildTrie(sequences) {
    const root = Object.create(null);

    for (let index = 0; index < sequences.length; index++) {
        const str = sequences[index];
        let node = root;

        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            node = node[code] ??= Object.create(null);
        }

        node.$ = index;
    }

    return root;
}
const emojiTrie = buildTrie(emoji);

function stringChunks(str, num) {
    const output = [];
    for (let i = 0; i < str.length; i += num) {
        output.push(str.slice(i, i + num))
    }
    return output
}

function check(s, b, bc) {
    const prefix = 'JSSC: UTF-16-to-any-Base: ';
    
    if (typeof s != 'string')   throw new Error(prefix+'Input UTF-16 string ("str" / argument 0) should be a string.');
    if (typeof b != 'number')   throw new Error(prefix+'Input Base number ("base" / argument 1) should be a number.');
    if (typeof bc!= 'string')   throw new Error(prefix+'Input Base characters string ("baseChars" / argument 2) should be a string.');
    if (b < 2)                  throw new Error(prefix+'Base ' + b + ' does not exist.');
    if (b > bc.length)          throw new Error(prefix+'Cannot use a higher base than the length of the provided base characters string.');
}

/**
 * Converts UTF-16 string to any base
 * 
 * @param {string} str - UTF-16 string
 * @param {number?} base - Base number (`optional`) (`64` by default)
 * @param {string?} baseChars - Base characters string (`optional`) (supports up to Base64 by default)
 * @returns {string} Encoded string
 */
export function encode(str, base = 64, baseChars = B64) {
    check(str, base, baseChars);

    let output = '';

    for (let i = 0; i < str.length;) {

        let node = emojiTrie;
        let j = i;
        let lastMatch = -1;
        let lastIndex = -1;

        while (j < str.length) {
            const code = str.charCodeAt(j);
            node = node[code];
            if (!node) break;

            if (node.$ !== undefined) {
                lastMatch = j;
                lastIndex = node.$;
            }

            j++;
        }

        if (lastMatch !== -1) {
            const packed = emojiOffset + lastIndex;
            output += convertBase(packed.toString(10), 10, 41).padStart(3, '0');
            i = lastMatch + 1;
        } else {
            const packed = str.charCodeAt(i) + 1;
            output += convertBase(packed.toString(10), 10, 41).padStart(3, '0');
            i++;
        }
    }

    return convertBase(output, 41, base);
}

/**
 * Converts any base string to UTF-16
 * 
 * @param {string} str - Encoded string
 * @param {number?} base - Base number (`optional`) (`64` by default)
 * @param {string?} baseChars - Base characters string (`optional`) (supports up to Base64 by default)
 * @returns {string} UTF-16 string
 */
export function decode(str, base = 64, baseChars = B64) {
    check(str, base, baseChars);

    let base41 = convertBase(str, base, 41);
    let output = '';

    const d3 = base41.length % 3;
    if (d3 == 1) base41 = '00' + base41;
    if (d3 == 2) base41 = '0' + base41;

    for (const chunk of stringChunks(base41, 3)) {
        const value = parseInt(convertBase(chunk, 41, 10), 10);

        if (value >= emojiOffset) {
            const index = value - emojiOffset;
            output += emoji[index];
        } else {
            output += String.fromCharCode(value - 1);
        }
    }

    return output;
}

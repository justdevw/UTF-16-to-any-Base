'use strict';

import { B64, convertBase } from "./third-party/convertBase.js";
import emojiObject from 'unicode-emoji-json' with {type: 'json'};
import { EN, RU, FR, UA, BN } from "./third-party/encoder.js";

const emoji = Object.keys(emojiObject);

function d835(char) {
    return '\ud835'+char;
}
function d834(char) {
    return '\ud834'+char;
}
const dict = [
    'th', 'he', 'in', 'er', 'an', 're', 'on', 'at', 'nd', 'ing', 'un', 'ab', 'ir',
    'Th', 'He', 'In', 'Er', 'An', 'Re', 'On', 'At', 'Nd', 'Ing', 'Un', 'Ab', 'Ir',
    'TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ON', 'AT', 'ND', 'ING', 'UN', 'AB', 'IR',

    ' a ', ' you ', ' we ', ' they ', ' i ', ' is ', ' are ', ' was ', ' were ', ' to ', ' in ', ' on ', ' at ', ' and ', ' or ', ' but ',
    ' A ', ' You ', ' We ', ' They ', ' I ', ' Is ', ' Are ', ' Was ', ' Were ', ' To ', ' In ', ' On ', ' At ', ' And ', ' Or ', ' But ',
    ' A' , ' YOU ', ' WE ', ' THEY ', ' I',  ' IS ', ' ARE ', ' WAS ', ' WERE ', ' TO ', ' IN ', ' ON ', ' AT ', ' AND ', ' OR ', ' BUT ',

    ' he ', ' she ', ' it ', ' his ', ' her ', ' its ', ' am ', ' do ', ' cause ', ' because ', ' like ', ' fortunately ', ' unfortunately ',
    ' He ', ' She ', ' It ', ' His ', ' Her ', ' Its ', ' Am ', ' Do ', ' Cause ', ' Because ', ' Like ', ' Fortunately ', ' Unfortunately ',
    ' HE ', ' SHE ', ' IT ', ' HIS ', ' HER ', ' ITS ', ' AM ', ' DO ', ' CAUSE ', ' BECAUSE ', ' LIKE ', ' FORTUNATELY ', ' UNFORTUNATELY ',

    'hi', 'wsg', 'hru', 'wdym', 'idk', 'imo', 'jk', 'tbh', 'ig', 'wow', 'lol', 'ez', 'gg',

    'ст', 'но', 'то', 'на', 'ен', 'ов', 'ни', 'пре', 'при', 'ри', 'ть', 'рю', 'шь', 'за', 'от', 'под', 'да', 'не', 'из',
    'Ст', '\u041d\u043e', '\u0422\u043e', '\u041d\u0430', 'Ен', 'Ов', 'Ни', 'Пре', 'При', 'Ри', 'Ть', 'Рю', 'Шь', '\u0417\u0430', 
    'От', 'Под', 'Да', '\u041d\u0435', 'Из',
    '\u0421\u0422', '\u041d\u041e', '\u0422\u041e', '\u041d\u0410', '\u0415\u041d', '\u041e\u0412', 'НИ', 'ПРЕ', 'ПРИ', 'РИ', '\u0422\u042c', 
    'РЮ', 'ШЬ', '\u0417\u0410', '\u041e\u0422', 'ПОД', 'ДА', '\u041d\u0415', 'ИЗ',

    'прив', 'крч', 'крут', 'хз', 'кд', 'ку', 'пон', 'ок', 'всм', 'щас', 'лол', 'изи', '\u0433'.repeat(2),

    ' '.repeat(2), ' '.repeat(3), '!'.repeat(2), '?'.repeat(2), '.'.repeat(3), '-'.repeat(3), '='.repeat(2), '+'.repeat(2),
    '\n\n', '\r\n', ' \n', '\n ',

    'const', 'let', 'var', 'import', 'from', 'with', 'export', 'class', 'public', 'private',
    'static', 'function', 'end', 'if', 'else', 'elseif', 'elif', 'try', 'catch', 'new',
    'for', 'typeof', 'type', 'of', 'return', 'switch', 'case', 'esac', 'finally', 'fi',
    '/*', '*/', '--', 'while', 'do', 'true', 'false', 'null', 'nil', 'nullptr', 'throw',

    '://', 'https', 'data', 'sms', 'mms', 'tel', 'file', 'mailto', 'http', 'ftp', 'wss', 'websocket', 'docs.',
    'www.', 'www', '.com', '.org', '.dev', 'tld', 'subdomain', 'domain', 'website', 'site', 'web', 'email', 'mail',
    'GET', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'com', 'org', 'dev', 'xhr', 'fetch',

    '//#', '//', '/>', '()', '{}', '[]', '<>',

    ...(()=>{
        const out = [];
        for (let i = 0xDC00; i < 0xDC9B + 1; i++) {
            if (i != 0xDC55) out.push(d835(String.fromCharCode(i)));
        }
        return out;
    })(),
    ...(()=>{
        const out = [];
        for (let i = 0xDD38; i < 0xDD6B + 1; i++) {
            if (
                i != 0xDD3A && i != 0xDD3F && i != 0xDD45 &&
                i != 0xDD47 && i != 0xDD48 && i != 0xDD49 && 
                i != 0xDD51
            ) out.push(d835(String.fromCharCode(i)));
        }
        return out;
    })(),
    ...(()=>{
        const out = [];
        for (let i = 0xDEA8; i < 0xDEE1 + 1; i++) {
            out.push(d835(String.fromCharCode(i)));
        }
        return out;
    })(),
    
    ...(()=>{
        const out = [];
        for (let i = 0xDD00; i < 0xDD26 + 1; i++) {
            out.push(d834(String.fromCharCode(i)));
        }
        return out;
    })(),
];
const seq = [
    ...emoji,
    ...EN,
    ...RU,
    ...FR,
    ...UA,
    ...BN,
    ...dict    
];
const seqOffset = 0x10001;
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
const seqTrie = buildTrie(seq);

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

const MAX_BASE41 = 41 ** 3;
const RLE_OFFSET = seqOffset + seq.length;
const RLE_MAX = MAX_BASE41 - RLE_OFFSET;
function RLE(arr) {
    const result = [];
    let i = 0;

    while (i < arr.length) {
        const current = arr[i];
        let j = i + 1;

        while (j < arr.length && arr[j] === current) j++;

        let count = j - i;

        result.push(current);

        if (count >= 3 && current !== '000') {
            let remaining = count - 1;

            while (remaining > 0) {

                if (remaining === 2) {
                    result.push('000');
                    remaining -= 2;
                    continue;
                }

                let bestBlock = 0;
                let bestCode = -1;

                for (let r = 0; r < RLE_MAX; r++) {
                    let size;

                    if (r < 18) {
                        size = 2 ** (r + 1);
                    } else {
                        size = 2 * (r + 1);
                    }

                    if (size <= remaining && size > bestBlock) {
                        bestBlock = size;
                        bestCode = r;
                    }
                }

                if (bestBlock > 0) {
                    const packed = RLE_OFFSET + bestCode;
                    result.push(
                        convertBase(packed.toString(10), 10, 41).padStart(3, '0')
                    );
                    remaining -= bestBlock;
                } else {
                    result.push(current);
                    remaining--;
                }
            }

        } else {
            for (let k = 1; k < count; k++) {
                result.push(current);
            }
        }

        i = j;
    }

    return result;
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

    const output = [];

    for (let i = 0; i < str.length;) {

        let node = seqTrie;
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
            const packed = seqOffset + lastIndex;
            output.push(convertBase(packed.toString(10), 10, 41).padStart(3, '0'));
            i = lastMatch + 1;
        } else {
            const packed = str.charCodeAt(i) + 1;
            output.push(convertBase(packed.toString(10), 10, 41).padStart(3, '0'));
            i++;
        }
    }

    return convertBase(RLE(output).join(''), 41, base);
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

    let last = '';
    for (const chunk of stringChunks(base41, 3)) {
        const value = parseInt(convertBase(chunk, 41, 10), 10);

        let back = [false, last];
        if (value == 0) {
            last = last.repeat(2);
            back[0] = true;
        } else if (value >= seq.length + seqOffset) {
            const val = value - seq.length - seqOffset;
            if (val < 18) {
                last = last.repeat(2 ** (val + 1));
            } else {
                last = last.repeat(2 * (val + 1));
            }
            back[0] = true;
        } else if (value >= seqOffset) {
            const index = value - seqOffset;
            last = seq[index];
        } else {
            last = String.fromCharCode(value - 1);
        }
        output += last;

        if (back[0]) {
            last = back[1];
        }
    }

    return output;
}

export const internal = {
    B64, EN, RU, FR, UA, BN, dict
}

import { encode, decode, internal } from "./index.js";

function random(to) {
    return Math.floor(Math.random() * to);
}
function randombase() {
    return 2 + random(62);
}
function randomStr() {
    let output = [];
    const length = random(100);
    for (let i = 0; i < length; i++) {
        output.push(String.fromCharCode(random(0xFFFF)));
    }
    return output.join('');
}
function test(base = randombase(), input = randomStr()) {
    try {
        const encoded = encode(input, base);
        const decoded = decode(encoded, base);
        console.log(input, base, encoded, decoded == input);
    } catch (err) {
        console.log(input, base, err);
    }
}

function h() {
    console.log('-'.repeat(100));
}

for (let i = 0; i < 10; i++) test();
h();
for (let i = 0; i < 10; i++) test(64);
h();
test(64, 'Hello, world!');
test(64, 'â䡥氲漬⁷潲汤!'); // JSSC-compressed
h();
console.log(atob(internal.convertB64('0e98pmMOrOMwtSZOr6g08g==', internal.B64, true)));
h();
for (let i = 0; i < 10; i++) {
    const rnd = 1 + random(62);
    const enc = encode('Test', 64, internal.B64, rnd);
    const dec = decode(enc, 64, internal.B64, true);
    console.log(rnd, enc, dec, rnd == dec[1]);
}
const encd = encode('Test');
const decd = decode(encd);
console.log(encd, decd, decd == 'Test');

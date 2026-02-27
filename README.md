# `@strc/utf16-to-any-base`
A simple, small, fast, ES lib to convert UTF-16 to any base. <br>

> ## Warning
> This library does NOT implement standard Base64. <br>
> Encoded strings are NOT compatible with `atob`, `btoa`,
> `Buffer.from(..., 'base64')`, or other Base64 tools.

```
npm i @strc/utf16-to-any-base
```

This is an internal module of [`JSSC` (`strc`)](https://www.npmjs.com/package/strc).

```
npm i strc
```

## Usage
```js
import { encode, decode } from "@strc/utf16-to-any-base";

const encoded = encode("Hello, world!", 64); // returns "1Pu++nMttDPVQmwHZy0pCWg\viKqXttAA"
console.log("Base64:", encoded, "\nUTF-16:", decode(encoded, 64));
```

## Dependencies
- [`unicode-emoji-json`](https://www.npmjs.com/package/unicode-emoji-json) by [Mu-An Chiou](https://github.com/muan)

## License
[MIT © 2026 JustDeveloper](https://github.com/justdevw/UTF-16-to-any-Base/blob/main/LICENSE)

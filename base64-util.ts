import * as base64 from 'base-64';
export function decode(input:string) {
 return  base64.decode(input);
}
export function CharToHex(str) {
  let out, i, len, c, h;
  out = "";
  len = str.length;
  i = 0;
  while (i < len) {
    c = str.charCodeAt(i++);
    h = c.toString(16);
    if (h.length < 2)
      h = "0" + h;
    if (i != len) out += h + " ";
    if (i == len) out += h;
    if (i > 0 && i % 8 == 0)
      out += "\r\n";
  }

  return out;
}
/**
 * 将16进制数据（字符串、字节以空格隔开）转换成对应字符，并组成字符串
 * @param {*} string
 */
export function hexToChar(string) {
  let str_arr = [];
  let result = '';
  let str = string.toLocaleLowerCase();
  str_arr = str.split(' ');
  for (let i = 0; i < str_arr.length; i++) {
    let reg = /^[0-f]{2}$/;
    if (!reg.test(str_arr[i])) {
      throw new Error('error data format');
    }
    result += String.fromCharCode(parseInt(str_arr[i], 16));
  }
  return result;
}
/**
 * 将字符串进行base64加密，返回密文
 * @param {*} string
 */
export function hexEncode(string) {
  return base64.encode(hexToChar(string));
}

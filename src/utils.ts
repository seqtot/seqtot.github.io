export const safeKeys = [
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'End',
  'Home',
  'PageUp',
  'PageDown',
  'Insert',
];

export class Deferred<T = any> {
  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as any;
}

export function dataURItoBlob(dataURI: string): Blob {
  // convert base64 to raw binary data held in a string
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var arrayBuffer = new ArrayBuffer(byteString.length);
  var _ia = new Uint8Array(arrayBuffer);
  for (var i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i);
  }

  var dataView = new DataView(arrayBuffer);
  var blob = new Blob([dataView], { type: mimeString });
  return blob;
}

// function byName(name, $el) {
//     if ($el)
//       return $el.find(`[name="${name}"]`);

//     return $(`[name="${name}"]`);
// }

// function dyName(name, $el) {
//     if ($el)
//       return $el.find(`[data-name="${name}"]`);

//     return $(`[data-name="${name}"]`);
// }

export function getNearestIdFromText(
  // Русские символы в id
  // https://javascript.ru/basic/regular-expression
  rows: string | string[],
  row: number
): string | undefined {
  let id: string;
  rows = Array.isArray(rows) ? rows : (rows || '').split(/\n/);

  for (let i = row; i > -1; i--) {
    const match = rows[i].match(/#\S+/);

    if (!match) {
      continue;
    }

    id = (match[0] || '').replace('#', '');
    break;
  }

  return id;
}

export type BlockInfoOld = {
  nio: number;
  startRow: number;
  endRow: number;
  id: string;
  rows: string[];
};

export function getBlocksOld(rows: string | string[]): BlockInfoOld[] {
  rows = Array.isArray(rows) ? rows : (rows || '').split(/\n/);
  let result: BlockInfoOld[] = [];
  let blockRows: string[] = [];
  let id: string;
  let endRow: number = rows.length - 1;

  for (let i = rows.length - 1; i > -1; i--) {
    blockRows.push(rows[i]);
    const match = rows[i].match(/#\S+/);

    if (!match) {
      continue;
    }

    id = (match[0] || '').replace('#', '');

    result.push({
      id,
      startRow: i,
      endRow: endRow,
      nio: 0, // определяется потом
      rows: blockRows.reverse(),
    });

    blockRows = [];
    endRow = i - 1;
  }

  result = result.reverse();

  result.forEach((item, i) => {
    item.nio = i;
  });

  return result;
}

export function getCurrRowText(el: HTMLTextAreaElement): string {
  const row = getCurrRow(el);
  const rows = (el.value || '').split(/\n/);

  return rows[row];
}

export function getCurrRow(el: HTMLTextAreaElement): number {
  let temp = el.value.substr(0, el.selectionStart).split('\n');

  return temp.length - 1;
}

export function isSafeKeys(evt: string | KeyboardEvent) {
  const code = typeof evt === 'string' ? evt : (<KeyboardEvent>evt).code;

  if (safeKeys.find((item) => item === code)) {
    return true;
  }

  return false;
}

export function pickTrackId(val: string, clearBrackets = false): string {
  val = val.replace('[track] ', '').trim();

  if (clearBrackets) {
    val = val.replace(/[\[\]]/g, '').trim();
  }

  return val;
}

export function isTrackKey(val: string): boolean {
  return val.startsWith('[track] ');
}

export function parseTrackId(id: string): {
  id: string;
  ns: string;
  name: string;
  version: number;
} {
  id = (id || '').trim();
  if (!id) return null;
  id = pickTrackId(id, true);

  const arr = id.split(':');
  return {
    id,
    ns: arr[0],
    name: arr[1],
    version: parseInt(arr[2], 10),
  };
}

export function getTrackList(ns?: string): string[] {
  const keys = Object.keys(localStorage);
  const list: string[] = [];

  for (let key of keys) {
    if (!isTrackKey(key)) {
      continue;
    }

    const id = pickTrackId(key);

    if (ns && !id.startsWith(`[${ns}:`)) {
      continue;
    }

    list.push(id);
  }

  return list;
}

// export function getNumber(val: string | number) {
//   if (val typeof === 'number') {
//     return isNaN(val) ? 0 : val;
//   }
// }

// export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
//   return document.getElementById(id) as any;
// }

// function byNamebyId<T extends HTMLElement = HTMLElement>(name: string, $el:k ): T {
//     if ($el)
//       return $el.find(`[name="${name}"]`);

//     return $(`[name="${name}"]`);
// }

export function dyName<T extends HTMLElement = HTMLElement>(
  name: string,
  el?: HTMLElement
): T {
  return (el || document).querySelector(`[data-name="${name}"]`);
}

export function isPresent(val: any) {
  return val !== null || val !== undefined;
}

export function getRandomElement(arr: any[] | string): any {
  const length = arr ? arr.length : 0;

  const i = Math.floor(Math.random() * length);

  return arr[i];
}

export function getWithDataAttr<T extends HTMLElement = HTMLElement>(
    name: string,
    el?: HTMLElement
): T[] {
  return ((el || document).querySelectorAll(`[data-${name}]`) as any) || [];
}

export function getWithDataAttrValue<T extends HTMLElement = HTMLElement>(
    name: string,
    val: string,
    el?: HTMLElement
): T[] {
  return ((el || document).querySelectorAll(`[data-${name}="${val}"]`) as any) || [];
}

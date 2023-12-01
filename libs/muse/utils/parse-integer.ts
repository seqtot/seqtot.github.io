'use babel';

export function parseInteger(val: string | number, ifError: number = 0): number {
    if (typeof val === 'number') {
        return isNaN(val) ? ifError : val;
    }

    val = (val || '').toString().trim();
    const num = parseInt(val, 10);

    return isNaN(num) ? ifError : num;
}

export const linear = v => v;


export function cubicBezier(p1x, p1y, p2x, p2y) {
    const ZERO_LIMIT = 1e-6;

    const ax = 3 * p1x - 3 * p2x + 1;
}
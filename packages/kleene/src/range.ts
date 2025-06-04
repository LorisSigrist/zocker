import DRange from "drange";

/**
 * A contiguous range between `0` and `MAX_SAFE_INTEGER`
 */
type ContiguousRange = [number, number];


/**
 * Represents one or more ranges of contiguous non-negative integers.
 */
export type Ranges = ContiguousRange[];

export function createRange(from: number, to: number): Ranges {
    return [[from, to]];
}

/**
 * Returns the new range. If two ranges overlap/are adjacent, they are merged.
 * 
 * @param ranges_1 The first set of ranges
 * @param ranges_2 The second set of ranges
 */
export function mergeRanges(ranges: Ranges): Ranges {
    // Sort ranges and merge overlapping or contiguous ones
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: Ranges = [];
    for (const [from, to] of ranges) {
        if (merged.length === 0) {
            merged.push([from, to] as ContiguousRange);
        } else {
            const last = merged[merged.length - 1]!;
            if (from <= last[1] + 1) {
                last[1] = Math.max(last[1], to);
            } else {
                merged.push([from, to]);
            }
        }
    }
    return merged;
}

/**
 * Returns the opposite of the range.
 * 
 * @example invertRange([100,100]) -> [[0,99], [101, Number.MAX_SAFE_INTEGER]]
 * 
 * @param range 
 */
export function invertRanges(range: Ranges): Ranges {
    // Handle any overlapping/adjacent ranges
    const merged = mergeRanges(range);

    // Sort the ranges by their start value
    merged.sort((a, b) => a[0] - b[0]);


    let start_inkl = 0; // the (inklusive) start of the next range to generate
    let end_inkl = -1; // the inklusive end of the previously generated range

    // Invert the ranges
    const inverted: Ranges = [];
    for (const [from, to] of merged) {
        const newRange: ContiguousRange = [start_inkl, from - 1];
        if (newRange[0] <= newRange[1]) {
            inverted.push(newRange);
        }
        start_inkl = to + 1;
        end_inkl = to;
    }

    // Add all remaining values, if the rest of the range is not already covered
    if (end_inkl < Number.MAX_SAFE_INTEGER) {
        inverted.push([end_inkl + 1, Number.MAX_SAFE_INTEGER]);
    }

    return inverted;
}

/**
 * Takes in a list of potentially overlapping ranges & returns
 * a Partition of the range [0-MAX_SAFE_INTEGER]so that the borders
 * of the partitions are the borders of the original ranges
 * 
 * @example: partitionRanges([[100, 200], [150, 250]]) -> [0,99], [100, 149], [150, 200], [201, 250], [251, MAX_SAFE_INTEGER]
 * 
 * @param range 
 * @returns 
 */
export function partitionRanges(ranges: Ranges): Ranges {
    const borders = new Set<number>();

    // Collect all start and end+1 points
    for (const [start, end] of ranges) {
        borders.add(start);
        borders.add(end + 1);
    }

    // Always add 0 and MAX_SAFE_INTEGER + 1
    borders.add(0);
    borders.add(Number.MAX_SAFE_INTEGER + 1); // so we can use MAX_SAFE_INTEGER as the end of last segment

    const sorted = Array.from(borders).sort((a, b) => a - b);

    const partitions: Ranges = [];

    for (let i = 0; i < sorted.length - 1; i++) {
        const start = sorted[i]!;
        const end = sorted[i + 1]! - 1;

        if (start <= end && end <= Number.MAX_SAFE_INTEGER) {
            partitions.push([start, end]);
        }
    }

    return partitions;
}

export function fromDRange(drange: DRange) : Ranges {
    const ranges: Ranges = [];

    for (const subrange of drange.subranges()) {
        ranges.push([subrange.low, subrange.high])
    }
    return ranges;
}

export function toDRange(ranges: Ranges): DRange {
    const drage = new DRange();
    for (const range of ranges) {
        drage.add(range[0], range[1]);
    }
    return drage;
}
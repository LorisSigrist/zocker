import { describe, it, expect } from "vitest";
import { createRange, invertRanges, mergeRanges, partitionRanges, Ranges } from "./range";


describe("mergeRanges", () => {
    it("merges adjacent ranges into one", () => {
        const ranges = mergeRanges([[0, 100], [101, 200], [201, 300], [301, 400], [401, 500], [501, 600]]);
        expect(ranges).toEqual([[0, 600]]);
    })
    it("doesnt merge non-overlapping ranges", () => {
        const range = mergeRanges([[0, 100], [101, 200], [202, 300], [301, 400]]);
        expect(range).toEqual([[0, 200], [202, 400]]);
    })
    it("merges overlapping ranges into one", () => {
        const range = mergeRanges([[0, 100], [50, 200], [150, 300]]);
        expect(range).toEqual([[0, 300]]);
    })
    it("merges identical ranges into one", () => {
        const range = mergeRanges([[0, 100], [0, 100]]);
        expect(range).toEqual([[0, 100]]);
    })
    it("merges subranges into one", () => {
        const range = mergeRanges([[0, 1000], [100, 300]]);
        expect(range).toEqual([[0, 1000]]);
    })
    it("doesnt change non-overlapping ranges", () => {
        const range: Ranges = [[0, 100], [200, 300]]
        expect(mergeRanges(range)).toEqual(range);
    })
})

describe("invert range", () => {
    it("inverts a range with a single value", () => {
        const range = createRange(100, 100);
        const inverted = invertRanges(range);

        expect(inverted).toEqual([[0, 99], [101, Number.MAX_SAFE_INTEGER]]);
    })

    it("inverts a range with multiple contiguous values", () => {
        const range = createRange(100, 200);
        const inverted = invertRanges(range);

        expect(inverted).toEqual([[0, 99], [201, Number.MAX_SAFE_INTEGER]]);
    })

    it("inverts a range that starts at 0", () => {
        const range = createRange(0, 100);
        const inverted = invertRanges(range);

        expect(inverted).toEqual([[101, Number.MAX_SAFE_INTEGER]]);
    })

    it("inverts a range that ends at MAX_SAFE_INTEGER", () => {
        const range = createRange(100, Number.MAX_SAFE_INTEGER);
        const inverted = invertRanges(range);

        expect(inverted).toEqual([[0, 99]]);
    })

    it("inverts multiple ranges", () => {
        const range: Ranges = [[0, 100], [200, 300]]
        const inverted = invertRanges(range);

        expect(inverted).toEqual([[101, 199], [301, Number.MAX_SAFE_INTEGER]]);
    })


    it("inverts ranges with extreme values", () => {
        const range: Ranges = [[0, 99], [101, Number.MAX_SAFE_INTEGER]];
        const inverted = invertRanges(range);
        expect(inverted).toEqual([[100, 100]]);
    })


    it("inverts a range with many subranges", () => {
        const range: Ranges = [[1, 100], [200, 300], [400, 500]];
        const inverted = invertRanges(range);
        expect(inverted).toEqual([[0, 0], [101, 199], [301, 399], [501, Number.MAX_SAFE_INTEGER]]);
    })


    it("returns the original range after inverting twice", () => {
        const range = createRange(100, 200);
        const inverted = invertRanges(range);
        const invertedAgain = invertRanges(inverted);

        expect(invertedAgain).toEqual(range);
    })
})

describe("Partition", () => {
    it("partitions a range with a single number", () => {
        const range = createRange(100, 100);
        const partitioned = partitionRanges(range);
        expect(partitioned).toEqual([[0, 99], [100, 100], [101, Number.MAX_SAFE_INTEGER]]);
    })

    it("partitions adjacent ranges", () => {
        const ranges : Ranges = [[100, 199], [200, 299]];
        const partitioned = partitionRanges(ranges);
        expect(partitioned).toEqual([[0, 99], [100, 199], [200, 299], [300, Number.MAX_SAFE_INTEGER]]);
    })

    it("partitions overlapping ranges", () => {
        const ranges : Ranges = [[100, 200], [150, 250]];
        const partitioned = partitionRanges(ranges);
        expect(partitioned).toEqual([[0, 99], [100, 149], [150, 200], [201, 250], [251, Number.MAX_SAFE_INTEGER]]);
    })

    it("partitions ranges that start at 0", () => {
        const range = createRange(0, 100);
        const partitioned = partitionRanges(range);
        expect(partitioned).toEqual([[0, 100], [101, Number.MAX_SAFE_INTEGER]]);
    })

    it("partitions ranges that stop at MAX_SAFE_INTEGER", () => {
        const range = createRange(100, Number.MAX_SAFE_INTEGER);
        const partitioned = partitionRanges(range);
        expect(partitioned).toEqual([[0, 99], [100, Number.MAX_SAFE_INTEGER]]);
    })

    it("partitions identical ranges", () => {
        const ranges : Ranges = [[100, 200], [100, 200]];
        const partitioned = partitionRanges(ranges);
        expect(partitioned).toEqual([[0, 99], [100, 200], [201, Number.MAX_SAFE_INTEGER]]);
    })
})
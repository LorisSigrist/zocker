// Take number as first Command line input
const cutoff = Number.parseInt(process.argv[2]);
if(Number.isNaN(cutoff)) throw Error("Please provide a number");



// Loop over all functions smaller than the input & compare the length
let numberWithLongestSequence = 1;
let longestSequenceLength = 1;
for(let i = 1; i <= cutoff; i++) {
    if(i % 100_000 == 0) console.log(`${i}/${cutoff}`);
	const sequenceLength = calculateSequenceLength(i);
	if(sequenceLength > longestSequenceLength) {
		numberWithLongestSequence = i;
		longestSequenceLength = sequenceLength;
	}
}

console.log(`Number with longest Sequence: ${numberWithLongestSequence}`);
console.log(`Sequence Length: ${longestSequenceLength}`);

// Helper Function
function calculateSequenceLength(i) {
	if(i == 1) return 1;
	const next = i % 2 == 0 
		? i / 2 
		: i*3 + 1;
	return calculateSequenceLength(next) + 1;
}
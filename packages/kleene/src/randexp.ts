import * as ret from 'ret';
import DRange from 'drange';

// An adjusted version of Randex that allows for prefixes
const types = ret.types;

export default class RandExp {

    private ignoreCase: boolean;
    private multiline: boolean;
    private tokens: ret.Root;

    constructor(regexp: RegExp) {
        this.ignoreCase = regexp.ignoreCase;
        this.multiline = regexp.multiline;
        this.tokens = ret.default(regexp.source);
    }


    /**
     * Checks if some custom properties have been set for this regexp.
     */
    _setDefaults(regexp: RegExp) {
        // When a repetitional token has its max set to Infinite,
        // randexp won't actually generate a random amount between min and Infinite
        // instead it will see Infinite as min + 100.
        this.max = regexp.max != null ? regexp.max :
            RandExp.prototype.max != null ? RandExp.prototype.max : 100;

        // This allows expanding to include additional characters
        // for instance: RandExp.defaultRange.add(0, 65535);
        this.defaultRange = regexp.defaultRange ?
            regexp.defaultRange : this.defaultRange.clone();

        if (regexp.randInt) {
            this.randInt = regexp.randInt;
        }
    }


    /**
     * Generates the random string.
     */
    gen(): string {
        return this._gen(this.tokens, []);
    }


    /**
     * Generate random string modeled after given tokens.
     *
     * @param {Object} token
     * @param {Array.<string>} groups
     * @return {string}
     */
    _gen(token: ret.Tokens, groups) {
        let stack, str, n, i, l, code, expandedSet;

        switch (token.type) {
            case types.ROOT:
            case types.GROUP:
                // Ignore lookaheads for now.
                if (token.followedBy || token.notFollowedBy) { return ''; }

                // Insert placeholder until group string is generated.
                if (token.remember && token.groupNumber === undefined) {
                    token.groupNumber = groups.push(null) - 1;
                }

                stack = token.options ?
                    this._randSelect(token.options) : token.stack;

                str = '';
                for (i = 0, l = stack.length; i < l; i++) {
                    str += this._gen(stack[i], groups);
                }

                if (token.remember) {
                    groups[token.groupNumber] = str;
                }
                return str;

            case types.POSITION:
                // Do nothing for now.
                return '';

            case types.SET:
                expandedSet = this._expand(token);
                if (!expandedSet.length) { return ''; }
                return String.fromCharCode(this._randSelect(expandedSet));

            case types.REPETITION:
                // Randomly generate number between min and max.
                n = this.randInt(token.min,
                    token.max === Infinity ? token.min + this.max : token.max);

                str = '';
                for (i = 0; i < n; i++) {
                    str += this._gen(token.value, groups);
                }

                return str;

            case types.REFERENCE:
                return groups[token.value - 1] || '';

            case types.CHAR:
                code = this.ignoreCase && this._randBool() ?
                    this._toOtherCase(token.value) : token.value;
                return String.fromCharCode(code);
        }
    }


    /**
     * If code is alphabetic, converts to other case.
     * If not alphabetic, returns back code.
     *
     * @param {number} code
     * @return {number}
     */
    _toOtherCase(code) {
        return code + (97 <= code && code <= 122 ? -32 :
            65 <= code && code <= 90 ? 32 : 0);
    }


    /**
     * Randomly returns a true or false value.
     *
     * @return {boolean}
     */
    _randBool() {
        return !this.randInt(0, 1);
    }


    /**
     * Randomly selects and returns a value from the array.
     *
     * @param {Array.<Object>} arr
     * @return {Object}
     */
    _randSelect(arr) {
        if (arr instanceof DRange) {
            return arr.index(this.randInt(0, arr.length - 1));
        }
        return arr[this.randInt(0, arr.length - 1)];
    }


    /**
     * Expands a token to a DiscontinuousRange of characters which has a
     * length and an index function (for random selecting).
     *
     * @param {Object} token
     * @return {DiscontinuousRange}
     */
    _expand(token) {
        if (token.type === ret.types.CHAR) {
            return new DRange(token.value);
        } else if (token.type === ret.types.RANGE) {
            return new DRange(token.from, token.to);
        } else {
            let drange = new DRange();
            for (let i = 0; i < token.set.length; i++) {
                let subrange = this._expand(token.set[i]);
                drange.add(subrange);
                if (this.ignoreCase) {
                    for (let j = 0; j < subrange.length; j++) {
                        let code = subrange.index(j);
                        let otherCaseCode = this._toOtherCase(code);
                        if (code !== otherCaseCode) {
                            drange.add(otherCaseCode);
                        }
                    }
                }
            }
            if (token.not) {
                return this.defaultRange.clone().subtract(drange);
            } else {
                return this.defaultRange.clone().intersect(drange);
            }
        }
    }


    /**
     * Randomly generates and returns a number between a and b (inclusive).
     *
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    randInt(a: number, b:number) :number {
        return a + Math.floor(Math.random() * (1 + b - a));
    }


    /**
     * Default range of characters to generate from.
     */
    get defaultRange() {
        return this._range = this._range || new DRange(32, 126);
    }

    set defaultRange(range) {
        this._range = range;
    }


    /**
     *
     * Enables use of randexp with a shorter call.
     *
     * @param {RegExp|string| regexp}
     * @param [string] m
     * @return {string}
     */
    static randexp(regexp: RegExp|string|RandExp, m?: string) {
        let randexp;
        if (typeof regexp === 'string') {
            regexp = new RegExp(regexp, m);
        }

        if (regexp._randexp === undefined) {
            randexp = new RandExp(regexp, m);
            regexp._randexp = randexp;
        } else {
            randexp = regexp._randexp;
            randexp._setDefaults(regexp);
        }
        return randexp.gen();
    }


    /**
     * Enables sugary /regexp/.gen syntax.
     */
    static sugar() {
        /* eshint freeze:false */
        RegExp.prototype.gen = function () {
            return RandExp.randexp(this);
        };
    }
};
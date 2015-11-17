'use strict';

let util = require('util');

const NUMBER = Symbol("Number");
const INTEGER = Symbol("Integer");
const BOOLEAN = Symbol("Boolean");
const STRING = Symbol("String");

exports = module.exports = {
    Number: NUMBER,
    Integer: INTEGER,
    Boolean: BOOLEAN,
    String: STRING
};

const TYPES = [NUMBER, INTEGER, BOOLEAN, STRING];

function noop() {}

class ArgumentBase {
    constructor(type, name) {
        if (TYPES.indexOf(type) < 0) {
            throw new TypeError("Invalid Type: " + type);
        }

        if (!util.isString(name) || name.length === 0) {
            throw new TypeError("A name must be supplied");
        }

        this._type = type;
        this._name = name;
        this._description = "";
        this._required = true;
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    description(desc) {
        if (!util.isString(desc)) {
            throw new TypeError("Description must be a string");
        }

        return this._description = desc;
    }

    optional() {
        this._required = false;
    }

    required() {
        this._required = true;
    }

    validate(value) {
        if (value === undefined && !this._required) {
            return;
        }

        switch (this._type) {
            case INTEGER:
                if (!Number.isInteger(value)) {
                    throw new TypeError("Value must be an integer");
                }
                break;

            case NUMBER:
                if (!util.isNumber(value)) {
                    throw new TypeError("Value must be a number");
                }
                break;

            case BOOLEAN:
                if (!util.isBoolean(value)) {
                    throw new TypeError("Value must be a boolean");
                }
                break;

            case STRING:
                if (!util.isString(value)) {
                    throw new TypeError("Value must be a string");
                }
                break;
        }
    }
};

class IntegerArgument extends ArgumentBase {
    constructor(name) {
        super(INTEGER, name);
    }
};

class NumberArgument extends ArgumentBase {
    constructor(name) {
        super(NUMBER, name);
    }
};

class BooleanArgument extends ArgumentBase {
    constructor(name) {
        super(BOOLEAN, name);
    }
};

class StringArgument extends ArgumentBase {
    constructor(name) {
        super(STRING, name);
    }
};

exports.ArgumentList =
class ArgumentList {
    constructor() {
        this._args = [];
    }

    static new() {
        return new ArgumentList;
    }

    _checkName(name) {
        for (let a of this._args) {
            if (a.name === name) {
                throw new RangeError("Duplicate argument: " + name);
            }
        }
    }

    _newArgument(Class, name, cb) {
        this._checkName(name);

        let a = new Class(name);

        cb && cb(a);

        this._args.push(a);
        return this;
    }

    integer(name, cb) {
        return this._newArgument(IntegerArgument, name, cb);
    }

    number(name, cb) {
        return this._newArgument(NumberArgument, name, cb);
    }

    boolean(name, cb) {
        return this._newArgument(BooleanArgument, name, cb);
    }

    string(name, cb) {
        return this._newArgument(StringArgument, name, cb);
    }

    validate(values) {
        let valsLength = values.length;
        let argsLength = this._args.length;

        if (valsLength > argsLength) {
            throw new RangeError("Too many values. Expected " + argsLength + " got " + valsLength);
        }

        for (let i=0; i < argsLength; ++i) {
            this._args[i].validate(values[i]);
        }
    }
};

'use strict';

let util = require('util');

let ArgumentList = require('./types').ArgumentList;

class Store {
    constructor(types) {
        if (!(types instanceof ArgumentList)) {
            throw new TypeError("An ArgumentList must be provided");
        }
        this._types = types;

        this._readable = false;
        this._read = null;

        this._writable = false;
        this._write = null;
    }

    _doRead() {
        if (!this._readable) {
            return Promise.reject();
        } else {
            return new Promise((resolve, reject) => {
                try {
                    let p = this._read();
                    if (util.isPrimitive(p)) {
                        p = [p];
                    }
                    if (Array.isArray(p)) {
                        p = Promise.resolve(p);
                    }
                    p.then((vals) => {
                        this._types.validate(vals);
                        resolve(vals);
                    }).catch((e) => {
                        reject(e);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }
    }

    set read(fn) {
        if (!util.isFunction(fn)) {
            throw new TypeError("Read function is not a function");
        }

        this._readable = true;
        this._read = fn;
    }

    get read() {
        return this._doRead;
    }

    get readable() {
        return this._readable;
    }

    _doWrite(vals) {
        if (this._writable) {
            return new Promise((resolve, reject) => {
                try {
                    if (!Array.isArray(vals)) {
                        vals = Array.prototype.slice.call(arguments);
                    }

                    this._types.validate(vals);

                    let ret = this._write.apply(this, vals);

                    if (ret === undefined || ret === true) {
                        resolve();
                    } else if (ret === false) {
                        reject();
                    } else {
                        ret.then(resolve, reject);
                    }
                } catch (e) {
                    reject(e);
                }
            })
        } else {
            return Promise.reject();
        }
    }

    set write(fn) {
        if (!util.isFunction(fn)) {
            throw new TypeError("Write function is not a function");
        }

        this._writable = true;
        this._write = fn;
    }

    get write() {
        return this._doWrite;
    }

    get writable() {
        return this._writable;
    }

    call() {
        return Promise.reject(new ReferenceError("Data nodes are not callable"));
    }

    get callable() {
        return false;
    }
};
exports.DataNode = Store;

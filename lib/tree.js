'use strict';

let EventEmitter = require('events');
let util = require('util');

exports.Node =
class Node extends EventEmitter {
    constructor(name, rpc) {
        super()

        this._name = name;
        this._rpc = rpc;

        this._children = [];

        this._addedCallback = ((path) => {
            this.emit('added', this._buildPath(path));
        }).bind(this);
        this._removedCallback = ((path) => {
            this.emit('removed', this._buildPath(path));
        }).bind(this);
    }

    get name() {
        return this._name;
    }

    get length() {
        return this._children.length;
    }

    add(node) {
        if (!(node instanceof Node)) {
            throw new TypeError("node must be a Node");
        }

        if (this._children.indexOf(node) >= 0) {
            throw new ReferenceError("Node is already attached");
        }

        if (!util.isString(node.name) || node.name.length === 0) {
            throw new TypeError("Node must have a name");
        }

        for (let child of this._children) {
            if (child.name === node.name) {
                throw new ReferenceError('Duplicate name');
            }
        }

        node.addListener('added', this._addedCallback);
        node.addListener('removed', this._removedCallback);

        this._children.push(node);
        this.emit('added', this._buildPath(node.name));
    }

    remove(node) {
        let index = this._children.indexOf(node);

        if (index < 0) {
            throw new ReferenceError("Node is not attached");
        }

        node.removeListener('added', this._addedCallback);
        node.removeListener('removed', this._removedCallback);

        this._children.splice(index, 1);
        this.emit('removed', this._buildPath(node.name));
    }

    clear() {
        for (let child of this._children) {
            this.remove(child);
        }
    }

    find(path) {
        let parts = path.split("/");

        return this._find(parts);
    }

    _find(parts) {
        if (parts.length === 0) {
            return this;
        }

        let part = parts.shift();

        for (let node of this._children) {
            if (node.name === part) {
                return node._find(parts);
            }
        }

        throw new ReferenceError("Could not find node child: " + part);
    }

    get readable() {
        return this._rpc && this._rpc.readable;
    }

    read() {
        if (this._rpc) {
            return this._rpc.read();
        } else {
            return Promise.reject();
        }
    }

    get writable() {
        return this._rpc && this._rpc.writable;
    }

    write() {
        if (this._rpc) {
            let values = Array.prototype.slice.call(arguments);
            return this._rpc.write(values);
        } else {
            return Promise.reject();
        }
    }

    get callable() {
        return this._rpc && this._rpc.callable;
    }

    _buildPath(name) {
        let path = this._name || '';
        if (path.length) {
            path += '/';
        }
        path += name;
        return path;
    }
};

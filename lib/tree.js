'use strict';

let util = require('util');

exports.Node =
class Node {
    constructor(name) {
        this._name = name;
        this._children = [];
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

        this._children.push(node);
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

        for (node of this._children) {
            if (node.name === part) {
                return node._find(parts);
            }
        }

        throw new ReferenceError("Could not find node child: " + part);
    }
};

class Tree {
    constructor() {
        this._root = new Node;
    }
};

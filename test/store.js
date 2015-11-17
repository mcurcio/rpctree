'use strict';

let rpctree = require('..');
let ArgumentList = rpctree.ArgumentList;
let DataNode = rpctree.DataNode;

describe('DataNode', () => {
    it('functional', () => {
        const INT = 2;
        const NUM = Math.PI;
        const BOOL = true;
        const STR = "Hello, World!";

        let intCache = 0;
        let boolCache = false;
        let strCache = "default";

        let args = ArgumentList.new()
            .integer("Int")
            .boolean("Bool")
            .string("Str");

        let node = new DataNode(args);

        node.readable.should.be.false;
        node.writable.should.be.false;
        node.callable.should.be.false;

        node.read = () => {
            return Promise.resolve([intCache, boolCache, strCache]);
        };

        node.readable.should.be.true;
        node.writable.should.be.false;
        node.callable.should.be.false;

        node.write = (i, b, s) => {
            intCache = i;
            boolCache = b;
            strCache = s;
            return true;
        };

        node.readable.should.be.true;
        node.writable.should.be.true;
        node.callable.should.be.false;

        return Promise.all([
            node.read().should.eventually.deep.equal([0, false, "default"]),
            node.write([2, true, "test"]).should.be.fulfilled,
            node.read().should.eventually.deep.equal([2, true, "test"]),
            node.write([1, true, "null"]).should.be.fulfilled,
            node.read().should.eventually.deep.equal([1, true, "null"]),
            node.call().should.be.rejected
        ]);
    });

    it('read', () => {
        let node1 = new DataNode(ArgumentList.new().integer("i").number("n"));
        node1.read = () => {
            return [1, Math.PI];
        };

        let node2 = new DataNode(ArgumentList.new().number("n").integer("i"));
        node2.read = () => {
            return Promise.resolve([Math.PI, 2]);
        };

        // success case, cause data type is bool
        let node3 = new DataNode(ArgumentList.new().boolean("b"));
        node3.read = () => {
            return false;
        };

        let node4 = new DataNode(ArgumentList.new().string("s"));
        node4.read = () => {
            return Promise.reject();
        };

        let node5 = new DataNode(ArgumentList.new().integer("i"));
        node5.read = () => {
            throw new Error;
        };

        // failure case, return doesnt match types
        let node6 = new DataNode(ArgumentList.new().boolean("b").integer("i"));
        node6.read = () => {
            return false;
        };

        let node7 = new DataNode(ArgumentList.new().integer("i"));
        node7.read = () => {
            return false;
        }

        return Promise.all([
            node1.read().should.eventually.deep.equal([1, Math.PI]),
            node2.read().should.eventually.deep.equal([Math.PI, 2]),
            node3.read().should.eventually.deep.equal([false]),
            node4.read().should.be.rejected,
            node5.read().should.be.rejected,
            node6.read().should.be.rejected,
            node7.read().should.be.rejected
        ]);
    });

    it('write', () => {
        let node1 = new DataNode(ArgumentList.new().integer("i").number("n"));
        node1.write = (i, n) => {
            node1.vals = [i, n];
            return true;
        };

        let node2 = new DataNode(ArgumentList.new().number("n").integer("i"));
        node2.write = () => {
            return false;
        };

        let node3 = new DataNode(ArgumentList.new().boolean("b"));
        node3.write = (b) => {
            node3.vals = [b];
        };

        let node4 = new DataNode(ArgumentList.new().string("s"));
        node4.write = () => {
            return Promise.reject();
        };

        let node5 = new DataNode(ArgumentList.new().integer("i"));
        node5.write = () => {
            throw new Error;
        };

        let node6 = new DataNode(ArgumentList.new().boolean("b").integer("i"));
        node6.write = (b, i) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    node6.vals = [b, i];
                    resolve();
                }, 1);
            });
        };

        return Promise.all([
            node1.write(1, Math.PI).should.be.fulfilled.then(() => {
                node1.vals.should.deep.equal([1, Math.PI]);
            }),
            node2.write(Math.PI, 2).should.be.rejected,
            node3.write(true).should.be.fulfilled.then(() => {
                node3.vals.should.deep.equal([true]);
            }),
            node4.write("").should.be.rejected,
            node5.write(4).should.be.rejected,
            node6.write([true, 6]).should.be.fulfilled.then(() => {
                node6.vals.should.deep.equal([true, 6]);
            })
        ]);
    });
});

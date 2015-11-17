'use strict';

let rpctree = require('..');
let Node = rpctree.Node;

describe('Tree', () => {
    it('functional', () => {
        let tree = new Node;

        (() => { tree.find("some/path"); }).should.throw(ReferenceError);

        tree.add(new Node("some"));
        tree.add(new Node("another"));

        tree.length.should.equal(2);

        (() => { tree.find("some"); }).should.be.ok;
        (() => { tree.find("some/test"); }).should.throw(ReferenceError);
    });
});

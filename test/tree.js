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

    it('store', () => {
        let tree = new Node;

        let lights = new Node("lights");

        let store = new rpctree.Store(rpctree.ArgumentList.new().integer("a"));

        let mattNightstand = new Node("Matt Nightstand", store);

        mattNightstand.readable.should.be.false;
        mattNightstand.writable.should.be.false;
        mattNightstand.callable.should.be.false;

        mattNightstand.read().should.be.rejected;

        store.read = () => {
            return 7;
        };

        mattNightstand.readable.should.be.true;
        mattNightstand.read().should.eventually.deep.equal([7]);

        lights.add(mattNightstand);
    });

    it('events', () => {
        let events = [];

        let root = new Node;
        root.addListener('added', (path) => {
            events.push('added-' + path);
        });
        root.addListener('removed', (path) => {
            events.push('removed-' + path);
        });

        let a = new Node();
        (() => { root.add(a); }).should.throw(TypeError);  // no name

        let b = new Node("b");
        root.add(b);

        let c = new Node("c");
        root.add(c);

        let d = new Node("d");
        root.add(d);

        let e = new Node("e");
        c.add(e);

        let f = new Node("f");
        e.add(f);

        root.remove(d);
        root.remove(c);

        events.should.deep.equal([
            'added-b',
            'added-c',
            'added-d',
            'added-c/e',
            'added-c/e/f',
            'removed-d',
            'removed-c'
        ]);
    });

    it('find', () => {
        let root = new Node;
        root.add(new Node('a'));
        root.add(new Node('b'));
        let c = new Node('c');
        root.add(c);
        c.add(new Node('d'));

        root.find('a').should.be.ok;
        root.find('c/d').should.be.ok;
        (() => { root.find('x'); }).should.throw();
    });
});

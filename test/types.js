'use strict';

let rpctree = require('..');

describe('Types', () => {
    it('properties', () => {
        rpctree.should.have.property('Number');
        rpctree.should.have.property('Integer');
        rpctree.should.have.property('Boolean');
        rpctree.should.have.property('String');
    });

    it('builder', () => {
        let list = rpctree.ArgumentList.new()
            .integer("one")
            .number("two")
    });

    it('optional', () => {
        let list = rpctree.ArgumentList.new()
            .integer("a")
            .integer("b")
            .integer("c", (a) => {
                a.optional();
            }).integer("d", (a) => {
                a.optional();
            });

        (() => { list.validate([1, 2, 3, 4]); }).should.be.ok;
        (() => { list.validate([1, 2, 3]); }).should.be.ok;
        (() => { list.validate([1, 2]); }).should.be.ok;
        (() => { list.validate([1]); }).should.throw(TypeError);
        (() => { list.validate([]); }).should.throw(TypeError);
    });
});

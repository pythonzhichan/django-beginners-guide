var test = require('tape');
var evaluate = require('../');
var parse = require('esprima').parse;

test('resolved', function (t) {
    t.plan(1);
    
    var src = '[1,2,3+4*10+n,foo(3+5),obj[""+"x"].y]';
    var ast = parse(src).body[0].expression;
    var res = evaluate(ast, {
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    });
    t.deepEqual(res, [ 1, 2, 49, 800, 555 ]);
});

test('unresolved', function (t) {
    t.plan(1);
    
    var src = '[1,2,3+4*10*z+n,foo(3+5),obj[""+"x"].y]';
    var ast = parse(src).body[0].expression;
    var res = evaluate(ast, {
        n: 6,
        foo: function (x) { return x * 100 },
        obj: { x: { y: 555 } }
    });
    t.equal(res, undefined);
});

test('boolean', function (t) {
    t.plan(1);
    
    var src = '[ 1===2+3-16/4, [2]==2, [2]!==2, [2]!==[2] ]';
    var ast = parse(src).body[0].expression;
    t.deepEqual(evaluate(ast), [ true, true, true, true ]);
});

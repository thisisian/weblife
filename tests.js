import "/weblife.js"

function testRuleStrings() {
    var rule = new RuleSet("b23/s34");
    let expected = [[0, 0, 1, 1, 0, 0, 0, 0, 0],    // Birth
                    [0, 0, 0, 1, 1, 0, 0, 0, 0]];   // Survive
    console.assert(rule === expected);
    rule = new RuleSet("d23/s34");
    console.assert(rule === null);
    rule = new RuleSet("b23/s39");
    console.assert(rule === null);
}

export function testMain() {
    testRuleStrings();
}

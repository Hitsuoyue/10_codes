import { scan } from './LexParser.js';
let syntax = {
    Program: [['StatementList', 'EOF']],
    StatementList: [
        ['Statement'],
        ['StatementList', 'Statement'],
    ],
    Statement: [
        ['ExpressionStatement'],
        ['IfStatement'],
        ['WhileStatement'],
        ['VariableDeclaration'],
        ['FunctionDeclaration'],
        ['Block'],
        ['BreakStatement'],
        ['ContinueStatement'],
        ['FunctionDeclaration']
    ],
    BreakStatement: [
        ['break', ';']
    ],
    ContinueStatement: [
        ['continue', ';']
    ],
    Block: [
        ['{', 'StatementList', '}'],
        ['{', '}']
    ],
    WhileStatement: [
        ['while', '(', 'Expression', ')', 'Statement']
    ],
    IfStatement: [
        ['if', '(', 'Expression', ')', "Statement"]
    ],
    VariableDeclaration: [
        ['let', 'Identifier', ';']
    ],
    FunctionDeclaration: [
        ['function', 'Identifier', '(', ')', '{', 'StatementList', '}']
    ],
    ExpressionStatement: [
        ['Expression', ';']
    ],
    Expression: [
        ['AssignmentExpression']
    ],
    AssignmentExpression: [
        ['LeftHandSideExpression', '=', 'LogicalORExpression'],
        ['LogicalORExpression']
    ],
    LogicalORExpression: [
        ['LogicalANDExpression'],
        ['LogicalORExpression', '||', 'LogicalANDExpression']
    ],
    LogicalANDExpression: [
        ['AdditiveExpression'],
        ['LogicalANDExpression', '&&', 'AdditiveExpression']
    ],
    AdditiveExpression: [
        ['MultiplicativeExpression'],
        ['AdditiveExpression', '+', 'MultiplicaticeExpression'],
        ['AdditiveExpression', '-', 'MultiplicaticeExpression'],
    ],
    MultiplicativeExpression: [
        ['LeftHandSideExpression'],
        ['MultiplicativeExpression', '*', 'LeftHandSideExpression'],
        ['MultiplicativeExpression', '/', 'LeftHandSideExpression']
    ],
    LeftHandSideExpression: [
        ['CallExpression'],
        ['NewExpression']
    ],
    CallExpression: [
        ['MemberExpression', 'Arguments'],
        ['CallExpression', 'Arguments'],
    ],
    Arguments: [
        ['(', ')'],
        ['(', 'ArgumentList', ')']
    ],
    ArgumentList: [
        ['AssignmentExpressiont'],
        ['ArgumentList', ',', 'AssignmentExpressiont']
    ],
    NewExpression: [
        ['MemberExpression'],
        ['new', 'NewExpression']
    ],
    MemberExpression: [
        ['PrimaryExpression'],
        ['PrimaryExpression', '.', 'Identifier'],
        ['PrimaryExpression', '[', 'Expression', ']'],
    ],
    PrimaryExpression: [
        ['(', 'Expression', ')'],
        ['Literal'],
        ['Identifier']
    ],
    Literal: [
        ['NumericLiteral'],
        ['StringLiteral'],
        ['BooleanLiteral'],
        ['NullLiteral'],
        ['RegularExpressionLiteral'],
        ['ObjectLiteral'],
        ['ArrayLiteral'],
    ],
    ObjectLiteral: [
        ['{', '}'],
        ['{', 'PropertyList', '}'],
    ],
    PropertyList: [
        ['Property']
        ['PropertyList', ',', 'Property']
    ],
    Property: [
        ['StringLiteral', ':', 'AdditiveExpression'],
        ['Identifier', ':', 'AdditiveExpression'],
    ]
}


let hash = {

}

function closure(state) {
    hash[JSON.stringify(state)] = state;

    let queue = [];
    for(let symbol in state) {
        if(symbol.match(/^\$/)) {
            continue;
        }
        queue.push(symbol);
    }

    while(queue.length) {
        let symbol = queue.shift();
        if(syntax[symbol]) {
            for(let rule of syntax[symbol]) {
<<<<<<< HEAD
=======
                // console.log('syntax', syntax)
                // console.log('rule', rule, symbol, syntax[symbol], syntax['PropertyList'])
>>>>>>> 87e02f4b228244824848c6a58579146a31371b84
                if(!state[rule[0]]) {
                    queue.push(rule[0]);
                }
                let current = state;
                for(let part of rule) {
                    if(!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
                current.$reduceType = symbol;
                current.$reduceLength = rule.length;
            }
        }
    }

    for(let symbol in state) {
        if(symbol.match(/^\$/)) {
            continue;
        }
        if(hash[JSON.stringify(state[symbol])]) {
            state[symbol] = hash[JSON.stringify(state[symbol])];
        } else {
            closure(state[symbol]);
        }
    }
<<<<<<< HEAD
=======
    console.log('state', state)
>>>>>>> 87e02f4b228244824848c6a58579146a31371b84

}

let end = {
    $isEnd: true
}

let start = {
    'Program': end
}

<<<<<<< HEAD
export function parse(source) {

    let stack = [start];
    let symbolStack = [];
    function reduce() {
        let state = stack[stack.length - 1];

        if(state.$reduceType) {
            let children = [];
            for(let i = 0; i < state.$reduceType; i++) {
                stack.pop();
                children.push(symbolStack.pop());
            }

            return {
                type: state.$reduceType,
                children: children.reverse()
            }
        } else {
            throw new Error('unexpected token')
        }
    }

    function shift(symbol) {
        let state = stack[stack.length - 1];

        if(symbolStack.type in state) {
            stack.push(state[symbol.type]);
            symbolStack.push(symbol);
        } else {
            shift(reduce());
            shift(symbol)
        }
    }

    for(let symbol of scan(source)) {
        shift(symbol);
    }

    return reduce();

}

parse(start);
=======
closure(start);


// let source = `
//     var a;
// `

// export function parse(source) {

//     let stack = [start];
//     let symbolStack = [];
//     function reduce() {
//         let state = stack[stack.length - 1];

//         if(state.$reduceType) {
//             let children = [];
//             for(let i = 0; i < state.$reduceType; i++) {
//                 stack.pop();
//                 children.push(symbolStack.pop());
//             }

//             return {
//                 type: state.$reduceType,
//                 children: children.reverse()
//             }
//         } else {
//             throw new Error('unexpected token')
//         }
//     }

//     function shift(symbol) {
//         let state = stack[stack.length - 1];

//         if(symbolStack.type in state) {
//             stack.push(state[symbol.type]);
//             symbolStack.push(symbol);
//         } else {
//             shift(reduce());
//             shift(symbol)
//         }
//     }

//     for(let symbol of scan(source)) {
//         shift(symbol);
//     }

//     return reduce();

// }

// parse(source);
>>>>>>> 87e02f4b228244824848c6a58579146a31371b84

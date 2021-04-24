const css = require('css');

let currentTextNode = null;
let stack = [{type: "document", children: []}];

let rules = [];
function addCssRules(text) {
    let ast = css.parse(text);
    rules.push(...ast.stylesheet.rules);
}

function match(element, selector) {
    //todo 感觉这里有问题
    if(!selector || !element.attributes) {
        return false;
    }
    if(selector[0] == '#') {
        let attr = element.attributes.filter(attr => attr.name === 'id')[0];
        if(attr && attr.value === selector.substring(1)) {
            return true;
        } 
    } else if(selector[0] == '.') {
        let attr = element.attributes.filter(attr => attr.name === 'class')[0];
        if(attr && attr.value === selector.substring(1)) {
            return true;
        } 
    } else {
        if(element.tagName === selector) {
            return true;
        }
    }
}

function specificity(selector) {
    let p = [0, 0, 0, 0];
    let selectorParts = selector.split(' ');
    for(let part of selectorParts) {
        let item = part[0];
        if(item == '#') {
            p[1] += 1;
        } else if(item == '.') {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if(sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    }
    if(sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if(sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

function computeCss(element) {
    let elements = stack.slice().reverse();
    if(!element.cumputedStyle) {
        element.cumputedStyle = {};
    }

    for(let rule of rules) {
        let selectorParts = rule.selectors[0].split(' ').reverse();
        if(!match(element, selectorParts[0])) {
            continue;
        }

        let j = 1;
        for(let i = 0; i < elements.length; i++) {
            if(match(elements[i], selectorParts[j])) {
                j++;
            }
        }
        //选择器与元素匹配
        if(j >= selectorParts.length){
            //计算specificity
           let sp = specificity(rule.selectors[0]);
           let cumputedStyle = element.cumputedStyle;
           for(let declaration of rule.declarations) {
               if(!cumputedStyle[declaration.property]) {
                    cumputedStyle[declaration.property] = {};
               }
               if(!cumputedStyle[declaration.property].specificity) {
                    cumputedStyle[declaration.property].value = declaration.value;
                    cumputedStyle[declaration.property].specificity = sp;
               } else if(compare(cumputedStyle[declaration.property].specificity, sp) < 0) {
                    cumputedStyle[declaration.property].value = declaration.value;
                    cumputedStyle[declaration.property].specificity = sp;
               }
           }
        }


    }
}

function emit(token) {
    // console.log('token', JSON.stringify(token));
    let top = stack[stack.length - 1];
    // console.log('top', JSON.stringify(top));
    // console.log('stack', stack);


    switch(token.type) {
        case 'startTag':
            let element = {
                type: 'element',
                tagName: token.tagName,
                children: [],
                attributes: []
            };
            for(let p in token) {
                let value = token[p];
                let unAttrArr = ['type', 'tagName', 'isSelfClosing'];
                if(!unAttrArr.includes(p)) {
                    element.attributes.push({
                        name: p,
                        value
                    });
                }
            }

            computeCss(element);

            top.children.push(element);
            console.log('element', JSON.stringify(element, null, 4));
            if(!token.isSelfClosing) {
                stack.push(element);
            }

            currentTextNode = null;
            break;

        case 'endTag':
            if(top.tagName != token.tagName) {
                throw new Error(`Tag start end doesn't match!`);
            } else {
                if(top.tagName === "style") {
                    addCssRules(top.children[0].content);
                }
                stack.pop();
            }

            currentTextNode = null;
            break;
        
        case 'text':
            if(currentTextNode == null) {
                currentTextNode = {
                    type: 'text',
                    content: ''
                }
                top.children.push(currentTextNode);
            } 
            currentTextNode.content += token.content;
            
            break; 
            
        default:
            break;
            
    }
}

const EOF = Symbol('EOF');
let currentToken = null;
let currentAttribute = null;

function data(c) {
    if(c == '<') {
        return tagOpen;
    } else if(c === EOF) {
        emit({
            type: 'EOF'
        });
        return;
    } else {
        emit({
            type: 'text',
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if(c == '/') {
        return endTagOpen;
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c);
    } else {
        //todo
        emit({
            type: 'text',
            content: c
        });
        return ;
    }
}

function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c);
    } else if(c == '>') {

    } else if(c == EOF) {
        
    } else {
        
    }    
}

function tagName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/') {
        return selfClosingStartTag;
    } else if(c.match(/^[A-Z]$/)) {
        //todo
        currentToken.tagName += c.toLowerCase();
        return tagName;
    } else if(c == '>') {
        emit(currentToken)
        return data;
    } else {
        //todo
        currentToken.tagName += c;
        return tagName;
    }

}

function beforeAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/' || c == '>' || c == EOF) {
        return afterAttributeName(c);
    } else if(c == '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: ''
        };
        return attributeName(c);
    }
}

function attributeName(c) {
    if((c.match(/^[\t\n\f ]$/)) || c == '/' || c == '>' || c == EOF) {
        return afterAttributeName;
    } else if(c == '=') {
        return beforeAttributeValue;
    } else if(c == '\u0000') {
        
    } else if(c == '\"' || c == '\'' || c == '<'){
        
    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}


function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if(c == '/') {
        return selfClosingStartTag;
    } else if(c == '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF){
        
    } else {
        //todo 
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: '',
            value: ''
        };
        return attributeName(c);
    }
}

function beforeAttributeValue(c) {
    
    if((c.match(/^[\t\n\f ]$/)) || c == '/' || c == EOF) {
        return beforeAttributeValue;
    } else if(c == '\"') {
        return doubleQuotedAttributeValue;
    } else if(c == '\'') {
        return singleQuotedAttributeValue;
    } else if(c == '>') {
        //todo
        // return data;
    } else {
        return unQuotedAttributedValue(c);
    }
}

function doubleQuotedAttributeValue(c) {
    if(c == '\"') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue;
    } else if(c == '\u0000') {
        
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}


function singleQuotedAttributeValue(c) {
    if(c == '\'') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if(c == '\u0000') {
        
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if(c == '/') {
        return selfClosingStartTag;
    } else if(c == '>'){
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function unQuotedAttributedValue(c) {
    if(c == '\u0000') {
        
    } else if(c == '<' || c == '=' || c == '`') {
        
    } else if(c == EOF) {
        
    } else {
        currentAttribute.value += c;
        return unQuotedAttributedValue;
    }
}


function selfClosingStartTag(c) {
    if(c == '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if(c == EOF) {
        
    } else {

    }

}


module.exports.parseHTML = function parseHTML(html) {
    console.log('html', html)
    let state = data;
    for(let c of html) {
        state = state(c);
    }
    state = state(EOF);
}
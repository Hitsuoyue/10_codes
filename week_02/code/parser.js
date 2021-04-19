
let currentTextNode = null;
let stack = [{type: "document", children: []}];


function emit(token) {
    // console.log('token', JSON.stringify(token));
    let top = stack[stack.length - 1];
    // console.log('top', JSON.stringify(top));
    console.log('stack', stack);


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
            top.children.push(element);
            if(!token.isSelfClosing) {
                stack.push(element);
            }

            currentTextNode = null;
            break;

        case 'endTag':
            if(top.tagName != token.tagName) {
                throw new Error(`Tag start end doesn't match!`);
            } else {
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
            console.log('stack', JSON.stringify(stack));
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
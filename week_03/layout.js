function getStyle(element) {
    if(!element.style) {
        element.style = {};
    }

    for(let prop in element.computedStyle) {
        element.style[prop] = element.computedStyle[prop].value;

        if(element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }

        if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop]);
        }

    }

    return element.style;
}

function layout(element) {
    // console.log('element--', element, element.computedStyle, JSON.stringify(element, null, 2))
    if(!element.computedStyle) {
        return;
    }

    let elementStyle = getStyle(element);
    // console.log('elementStyle', JSON.stringify(elementStyle, null, 2))

    //非 flex 布局暂时不考虑
    if(elementStyle.display !== 'flex') {
        return;
    }

    //过滤掉文本类型
    let items = element.children.filter(e => e.type === 'element');
    //items 根据 order 排序
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    const style = elementStyle;

    ['width', 'height'].forEach(item => {
        if(style[item] === 'auto' || style[item] === '') {
            style[item] = null;
        }
    })

    //给定默认值
    const { flexDirection, alignItems, justifyContent, flexWrap, alignContent } = style;
    if(!flexDirection || flexDirection === 'auto') {
        style.flexDirection = 'row';
    }
    if(!alignItems || alignItems === 'auto') {
        style.alignItems = 'stretch';
    }
    if(!justifyContent || justifyContent === 'auto') {
        style.justifyContent = 'flex-start';
    }
    if(!flexWrap || flexWrap === 'auto') {
        style.flexWrap = 'no-wrap';
    }
    if(!alignContent || alignContent === 'auto') {
        style.alignContent = 'stretch';
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase,
    crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(style.flexDirection === 'row') {
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'row-reverse') {
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection === 'column') {
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    //todo
    if(style.flexWrap === 'wrap-reverse') {
        let temp = crossStart;
        crossStart = crossEnd;
        crossEnd = temp;
        crossSign = -1;
    } else {
        crossSign = 1;
        crossBase = 0;
    }

    //没有设置主轴尺寸，则主轴尺寸由所有子元素的主轴尺寸相加求得
    let isAutoMainSize = false;
    if(!style[mainSize]) {
        elementStyle[mainSize] = 0;
        for(let i=0; i < items.length; i++) {
            let item = items[i];
            const itemStyle = getStyle(item);
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }

    let flexLine = [];
    let flexLines = [flexLine];

    let mainSpace = elementStyle[mainSize]; //主轴剩余尺寸
    let crossSpace = 0; //交叉轴尺寸

    for(let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemStyle = getStyle(item);

        if(itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        if(itemStyle.flex) {
            //不换行
            flexLine.push(item);
        } else if(style.flexWrap === 'nowrap' && isAutoMainSize){
            //不换行
            mainSpace -= itemStyle[mainSize];
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        } else {
            if(itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            //主轴剩余空间不够放此元素
            if(mainSpace < itemStyle[mainSize]) {
                //todo
                flexLine.mainSpace = mainSpace;
                flexLine.crossspace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item);
            }

            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;

    if(style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    //主轴计算
    if(mainSpace < 0) {
        //所有元素等比压缩，flex元素宽度置为0
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;
        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemStyle = getStyle(item);

            //flex元素宽度置为0
            if(itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }
            itemStyle[mainSize] = itemStyle[mainSize] * scale;

            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];

            //排到主轴哪个位置
            currentMain = itemStyle[mainEnd];

        }

    } else {
        flexLines.forEach(items => {
            const { mainSpace } = items;
            let flexTotal = 0;

            for(let i = 0; i < items.length; i++) {
                const item = items[i];
                const itemStyle = getStyle(item);

                if(itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += itemStyle.flex;
                }
            }

            if(flexTotal > 0) {
                let currentMain = mainBase;
                for(let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const itemStyle = getStyle(item);
                    //flex 元素宽度按比例定
                    if(itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd];
                }
            } else {
                //没有 flex:n 元素，则以 justifyContent 为准
                let step = 0, currentMain = 0;
                if(style.justifyContent === 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase;
                    step = 0;
                }
                if(style.justifyContent === 'space-between') {
                    step = mainSpace / (items.length - 1) * mainSign;
                    currentMain = mainBase;
                }
                if(style.justifyContent === 'space-around') {
                    step = mainSpace / items.length * mainSign;
                    currentMain = step / 2 + mainBase;
                }
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

    //交叉轴计算 align-items, align-self
    if(!style[crossSize]) { //auto sizing
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for(let i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace;
        }
    } else {
        crossSpace = style[crossSize];
        for(let i = 0; i < flexLines.length; i++) {
           crossSpace -= flexLines[i].crossSpace;
        }
    }

    if(style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize];
    } else {
        crossBase = 0;
    }

    let lineSize = style[crossSize] / flexLines.length;

    let step = 0;
    if(style.alignContent === 'flex-start') {
        crossBase += 0;
        step = 0;
    }
    if(style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace;
        step = 0;
    }    
    if(style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2;
        step = 0;
    }    
    if(style.alignContent === 'space-bewween') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }    
    if(style.alignContent === 'space-around') {
        step = crossSpace / (flexLines.length);
        crossBase += crossSign * step / 2;
    }
    if(style.alignContent === 'stretch') {
        crossBase += 0;
        step = 0;
    }

    flexLines.forEach(items => {
        let lineCrossSize = style.alignContent === 'stretch' ? 
        items.crossSpace + crossSpace / flexLines.length : 
        items.crossSpace;

        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemStyle = getStyle(item);

            let align = itemStyle.alignSelf || style.alignItems;

            if(itemStyle[crossSize] === null) {
                itemStyle[crossSize] = (align === 'stretch') ?
                lineCrossSize : 0;
            }

            if(align === 'flex-start') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align === 'flex-end') {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
            }
            if(align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]);
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align === 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0) ? itemStyle[crossSize] : lineCrossSize));
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    });
    console.log('flexLines', flexLines, JSON.stringify(flexLines));
}

module.exports = layout;
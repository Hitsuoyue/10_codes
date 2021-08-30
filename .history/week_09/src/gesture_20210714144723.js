

let element = document.createElement('div');
element.id = 'gesture';
element.style.width = '200px';
element.style.height = '200px';
element.style.background = '#ccc';
element.oncontextmenu = (e) => e.preventDefault();


element.addEventListener('tap', () => {
    console.log('tap----')

})

document.body.appendChild(element);

let isListeningMouse = false;

element.addEventListener('mousedown', () => {
    let context = Object.create(null);
    contexts.set(`mouse${event.button}`, context);
    start(event, context);
    let mousemove = event => {
        let context;
        //mac 触摸板调试，需用鼠标实际再调 
        if(event.buttons === 1) {
            context = contexts.get(`mouse1`) || contexts.get(`mouse0`)
        } else {
            context = contexts.get(`mouse${event.buttons}`);
        }
        move(event, context);
    };
    let mouseup = event => {
        let context = contexts.get(`mouse${event.button}`);
        end(event, context);
        contexts.delete(`mouse${event.button}`);
        if(event.buttons === 0) {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            isListeningMouse = false;
        }
    };
    if(!isListeningMouse) {
        isListeningMouse = true;
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
    }
})

let contexts = new Map();

element.addEventListener('touchstart', event => {
    for(let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        start(touch, context);
    }
})

element.addEventListener('touchmove', event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        move(touch, context);
    }

})

element.addEventListener('touchend', event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        end(touch, context);
        contexts.delete(touch.identifier);
    }
})

element.addEventListener('touchcancel', event => {
    for(let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        cancel(touch, context);
        contexts.delete(touch.identifier);
    }
})

let start = (point, context) => {
    context.startX = point.clientX, context.startY = point.clientY; 
    
    context.points = [{
        t: Date.now(),
        x: point.clientX,
        y: point.clientY
    }];
    
    
    context.isPan = false;
    context.isTap = true;
    context.isPress = false;

    context.handler = setTimeout(() => {
        console.log('press')
        context.isPan = false;
        context.isTap = false;
        context.isPress = true;
        context.handler = null;
    }, 500)
}

let move = (point, context) => {
    // console.log('move', point)
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;

     if(!context.isPan && dx ** 2 + dy ** 2 > 100) {
         //移动超过10px
        context.isPan = true;
        context.isTap = false;
        context.isPress = false;
        console.log('pan start')
        clearTimeout(context.handler);
     }

     if(context.isPan) {
        console.log('pan')
     }

     context.points = context.points.filter(point => Date.now() - point.t < 500);
    context.points.push({
        t: Date.now(),
        x: point.clientX,
        y: point.clientY
    });

}

let end  = (point, context) => {
    console.log('end', point)
    if(context.isTap) {
        // console.log('tap')
        dispatch('tap', {});
        clearTimeout(context.handler);
    }
    if(context.isPan) {
        console.log('pan end')
    }
    if(context.isPress) {
        console.log('press end')
    }

    let d, v;
    if(!context.points.length) {
        v = 0;
    } else {
        d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + 
        (point.clientY - context.points[0].y) ** 2);
        v = d / (Date.now() - context.points[0].t);
        console.log('v', v)
    }

    if(v > 1.5) {
        console.log('flick')
        context.isFlick = true;
    } else {
        context.isFlick = false;
    }

}

let cancel = (point, context) => {
    clearTimeout(context.handler);
    console.log('cancel', point)
}

export function dispatch(type, properties) {
    let event = new Event(type);
    console.log('event', event, properties)
    for(let name in properties) {
        event[name] = properties[name];
    };
    element.dispatchEvent(event);

}



//listen  recognize   dispatch

export class Listener {
    constructor() {
        
    }
}

export class Recognizer {
    constructor() {

    }
}




//会触发 touchcancel
// setTimeout(() => {
//     alert(111)
// },3000)

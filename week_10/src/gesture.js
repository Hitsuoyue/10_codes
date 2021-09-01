export class Dispatch {
    constructor(element) {
        this.element = element;
    }
    dispatch(type, properties) {
        let event = new Event(type);
        for(let name in properties) {
            event[name] = properties[name];
        };
        this.element.dispatchEvent(event);
    }
}



export function dispatch(type, properties) {
    let event = new Event(type);
    for(let name in properties) {
        event[name] = properties[name];
    };
    element.dispatchEvent(event);
}



//listen  recognize   dispatch

export class Listener {
    constructor(element, recognizer) {
        let isListeningMouse = false;
        let contexts = new Map();
            
        element.addEventListener('mousedown', () => {
            let context = Object.create(null);
            contexts.set(`mouse${event.button}`, context);
            recognizer.start(event, context);
            let mousemove = event => {
                let context;
                //mac 触摸板调试，需用鼠标实际再调 
                if(event.buttons === 1) {
                    context = contexts.get(`mouse1`) || contexts.get(`mouse0`)
                } else {
                    context = contexts.get(`mouse${event.buttons}`);
                }
                recognizer.move(event, context);
            };
            let mouseup = event => {
                let context = contexts.get(`mouse${event.button}`);
                recognizer.end(event, context);
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


        element.addEventListener('touchstart', event => {
            for(let touch of event.changedTouches) {
                let context = Object.create(null);
                contexts.set(touch.identifier, context);
                recognizer.start(touch, context);
            }
        })

        element.addEventListener('touchmove', event => {
            for(let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.move(touch, context);
            }

        })

        element.addEventListener('touchend', event => {
            for(let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.end(touch, context);
                contexts.delete(touch.identifier);
            }
        })

        element.addEventListener('touchcancel', event => {
            for(let touch of event.changedTouches) {
                let context = contexts.get(touch.identifier);
                recognizer.cancel(touch, context);
                contexts.delete(touch.identifier);
            }
        })
    }
}

export class Recognizer {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    start (point, context) {
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
            this.dispatcher.dispatch('press', {});
            context.isPan = false;
            context.isTap = false;
            context.isPress = true;
            context.handler = null;
        }, 500)
    }
    
    move (point, context) {
        let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    
         if(!context.isPan && dx ** 2 + dy ** 2 > 100) {
             //移动超过10px
            context.isPan = true;
            context.isTap = false;
            context.isPress = false;
            context.isVertical = Math.abs(dx) < Math.abs(dy);
            this.dispatcher.dispatch('panstart', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            });
            clearTimeout(context.handler);
         }
    
         if(context.isPan) {
            this.dispatcher.dispatch('pan', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical
            });
         }
    
         context.points = context.points.filter(point => Date.now() - point.t < 500);
        context.points.push({
            t: Date.now(),
            x: point.clientX,
            y: point.clientY
        });
    
    }
    
    end (point, context) {
        if(context.isTap) {
            this.dispatcher.dispatch('tap', {});
            clearTimeout(context.handler);
        }

        if(context.isPress) {
            this.dispatcher.dispatch('pressend', {});
        }
    
        let d, v;
        if(!context.points.length) {
            v = 0;
        } else {
            d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + 
            (point.clientY - context.points[0].y) ** 2);
            v = d / (Date.now() - context.points[0].t);
        }
    
        if(v > 1.5) {
            context.isFlick = true;

            this.dispatcher.dispatch('flick', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
                velocity: v
            });

        } else {
            context.isFlick = false;
        }

        if(context.isPan) {
            this.dispatcher.dispatch('panend', {
                startX: context.startX,
                startY: context.startY,
                clientX: point.clientX,
                clientY: point.clientY,
                isVertical: context.isVertical,
                isFlick: context.isFlick,
            });
        }
    
    }
    
    cancel (point, context) {
        clearTimeout(context.handler);
        this.dispatcher.dispatch('cancel', {});
    }
}

export function enableGesture(element) {
    new Listener(element, new Recognizer(new Dispatch(element)))
}



// let element = document.createElement('div');
// element.id = 'gesture';
// element.style.width = '200px';
// element.style.height = '200px';
// element.style.background = '#ccc';
// element.oncontextmenu = (e) => e.preventDefault();



// document.body.appendChild(element);

// enableGesture(element);

// element.addEventListener('tap', () => {
//     console.log('tap----')
// })

//会触发 touchcancel
// setTimeout(() => {
//     alert(111)
// },3000)

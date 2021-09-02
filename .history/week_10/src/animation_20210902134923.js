import { linear } from './ease';

const TICK = Symbol('tick');
const TICK_HANDLER = Symbol('tick-handler');
const ANIMATIONS = Symbol('animations');
const START_TIME = Symbol('start-time');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');

export class Timeline {
    constructor() {
        this.state = 'inited';
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
    }

    start() {
        if(this.state !== 'inited') return;
        this.state = 'started';
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;

        this[TICK] = () => {
            let now = Date.now();
            for(let animation of this[ANIMATIONS]) {
                let t;
                //以晚的时间为开始时间
                if(this[START_TIME].get(animation) < startTime) {
                    t = now - startTime - this[PAUSE_TIME] - animation.delay;
                } else {
                    t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
                }

                if(animation.duration < t) {
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }

                if(t > 0) {
                    animation.receiveTime(t);
                }
                
            }

            this[TICK_HANDLER] = requestAnimationFrame(this[TICK])
        }

        this[TICK]();
    }

    pause() {
        if(this.state !== 'started') return;
        this.state = 'paused';
        console.log('pause----')
        this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HANDLER])
    }
    
    resume() {
        if(this.state !== 'paused') return;
        this.state = 'started';
        console.log('resume----') 
        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]();
    }
    
    reset() {
        this.pause();
        this.state = 'inited';
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map();
        this[PAUSE_START] = 0;
        this[PAUSE_TIME] = 0;
        this[TICK_HANDLER] = null;
    }
    
    add(animation, startTime = Date.now()) { 
        this[ANIMATIONS].add(animation);
        this[START_TIME].set(animation, startTime);
    }
}

export class Animation {
    constructor(object, property, startValue, endValue, duration, delay, timingFunction = v => v, template = v=> v) {
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.delay = delay;
        this.timingFunction = timingFunction;
        this.template = template;
    }
    receiveTime (time) {

        let range = this.endValue - this.startValue;
        // console.log('time', this.startValue, this.endValue, range, time, this.duration, this.startValue + range * time / this.duration, this.template, this.template(this.startValue + range * time / this.duration))
        let progress = this.timingFunction(time / this.duration);
        this.object[this.property] = this.template(this.startValue + range * progress);
        console.log('this.template(this.startValue + range * progress)', this.startValue, range, progress, range * progress, this.template(this.startValue + range * progress))
    }
}

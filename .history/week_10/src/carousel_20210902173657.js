import { Component, createElement } from './framework';
import { Timeline, Animation } from './animation';
import './carousel.css';
import './gesture';
import { enableGesture } from './gesture';
import { linear } from './ease';

export default class Carousel extends Component {
    constructor() {
        super();
        // console.log('this.root;,', this.root);
        this.attributes = Object.create(null);
    }

    setAttribute(name, value) {
        this.attributes[name] = value
    }

    render() {
        this.root = document.createElement('div', );
        this.root.classList.add('carousel');

        if(this.attributes.src && Array.isArray(this.attributes.src)) {
            console.log('this.attributes.src', this.attributes.src)
            for(let src of this.attributes.src) {
                let child = document.createElement('div');
                child.style.backgroundImage = `url('${src}')`;
                this.root.appendChild(child);
            }
        }

        enableGesture(this.root);

        let timeline = new Timeline();
        timeline.start();

        // this.root.addEventListener('tap', () => {
        //     console.log('tap----')
        // })

        let children = this.root.children;
        let length = children.length;
        const width = 500;
        let position = 0;
        const duration = 1500;

        let t = 0;
        let ax = 0;

        this.root.addEventListener('start', event => {
            timeline.pause();
            clearInterval(this.interval);
            let progress = (Date.now() - t) / duration;
            ax = t === 0 ? 0 : linear(progress) * width - width;
         })

        this.root.addEventListener('pan', event => {
            let x = event.clientX - event.startX - ax;
            console.log('x', x);

            let current = position;
            console.log('current', current);
            let left = (current - 1 + 4) % 4;
            let right = (current + 1 + 4) % 4;

            children[current].style.transition = 'none';
            children[left].style.transition = 'none';
            children[right].style.transition = 'none';

            if(x > 0) {
                children[current].style.transform = `translateX(calc(-${position * 100}% + ${Math.abs(x)}px))`;
                children[left].style.transform = `translateX(calc(-${(left+1) * 100}% + ${Math.abs(x)}px))`;
                children[right].style.transform = `translateX(calc(${-(right - 1) * 100}% + ${Math.abs(x)}px))`;

            } else {
                children[current].style.transform = `translateX(calc(-${position * 100}% - ${Math.abs(x)}px))`;
                children[left].style.transform = `translateX(calc(-${(left+1) * 100}% - ${Math.abs(x)}px))`;
                children[right].style.transform = `translateX(calc(${-(right - 1) * 100}% - ${Math.abs(x)}px))`;
            }
        })
        this.root.addEventListener('panend', event => {

            timeline.reset();
            timeline.start();
            this.interval = setCarouselInter();

            let x = event.clientX - event.startX - ax;
            let current = position;
            let left = (current - 1 + 4) % 4;
            let right = (current + 1 + 4) % 4;

            children[current].style.transition = '';
            children[left].style.transition = '';
            children[right].style.transition = '';

            console.log('current', current, 'left', left, 'right', right)

            if(x > 0) {
                // timeline.add(new Animation(children[current].style, 'transform', 
                // `calc(-${(position+1) * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, `calc(-${position * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, duration, 0, linear, v => `translateX(${v})`
                // ));
                // timeline.add(new Animation(children[left].style, 'transform', 
                // `calc(-${(left+2) * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, `calc(-${(left+1) * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, duration, 0, linear, v => `translateX(${v})`
                // ));
                // timeline.add(new Animation(children[right].style, 'transform', 
                // `calc(${-(right) * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, `calc(${-(right - 1) * 100}% + ${width * Math.round(Math.abs(x) / width)}px)`, duration, 0, linear, v => `translateX(${v})`
                // ));
                children[current].style.transform = `translateX(calc(-${position * 100}% + ${width * Math.round(Math.abs(x) / width)}px))`;
                children[left].style.transform = `translateX(calc(-${(left+1) * 100}% + ${width * Math.round(Math.abs(x) / width)}px))`;
                children[right].style.transform = `translateX(calc(${-(right - 1) * 100}% + ${width * Math.round(Math.abs(x) / width)}px))`;

            } else {
                timeline.add(new Animation(children[current].style, 'transform', 
                `calc(-${(position+1) * 100}% - ${width * Math.round(Math.abs(x) / width)}px)`, `calc(-${position * 100}% - ${width * Math.round(Math.abs(x) / width)}px)`, duration, 0, linear, v => `translateX(${v})`
                ));
                // children[current].style.transform = `translateX(calc(-${position * 100}% - ${width * Math.round(Math.abs(x) / width)}px))`;
                // children[left].style.transform = `translateX(calc(-${(left+1) * 100}% - ${width * Math.round(Math.abs(x) / width)}px))`;
                // children[right].style.transform = `translateX(calc(${-(right - 1) * 100}% - ${width * Math.round(Math.abs(x) / width)}px))`;
            }

            position = (position - Math.round(x / width) + length) % length;

        })

        // let element = document.createElement('div');
        // element.id = 'test';
        // document.body.appendChild(element);

        // let pauseBtn = document.createElement('button');
        // pauseBtn.id = 'pause-btn';
        // pauseBtn.innerHTML = 'pause';
        // document.body.appendChild(pauseBtn);

        // let resumeBtn = document.createElement('button');
        // resumeBtn.id = 'resume-btn';
        // resumeBtn.innerHTML = 'resume';
        // document.body.appendChild(resumeBtn);        

        // pauseBtn.addEventListener('click', () => t1.pause())

        // resumeBtn.addEventListener('click', () => t1.resume())

        // let t1 = new Timeline();
        // let ele = document.getElementById('test');
        // console.log('ele', ele.style)
        // t1.add(new Animation(ele.style, 'transform', 0, 600, 3000, 1000, undefined, v => `translateX(${v}px)`))
        // t1.start();



        // let currentIndex = 0;
        // let nextIndex = 1;
        // let current;
        // let next;
        // let flag;
        
        const setCarouselInter = () => {
            return setInterval(() => {

                t = Date.now();

                let children = this.root.children;
                let nextIndex = (position + 1) % children.length;
                let current = children[position];
                let next = children[nextIndex];
    
                next.style.transition = 'none';
                next.style.transform = `translateX(${-100*(nextIndex - 1)}%)`;
                console.log('current', position, 'next', nextIndex, `translateX(${-100*(nextIndex - 1)}%)`)
    

                timeline.add(new Animation(current.style, 'transform', 
                    -100*position, -100*(position + 1), duration, 0, linear, v => `translateX(${v}%)`
                ));
    
                timeline.add(new Animation(next.style, 'transform', 
                    -100*(nextIndex - 1), -100*(nextIndex), duration, 0, linear, v => `translateX(${v}%)`
                ));

                position = nextIndex;
            }, 2000)
        }

        this.interval = setCarouselInter();

        // this.root.addEventListener('mousedown', event => {
        //     clearInterval(this.interval);
        //     let startX = event.clientX;
        //     let children = this.root.children;
        //     for(let child of children) {
        //         child.style.transition = 'none';
        //     }
        //     const move = event => {
        //         console.log('mousemove')
        //         let x = event.clientX - startX;
        //         current = children[currentIndex];
        //         if(x < 0) {
        //             flag = 1;
        //             //?????????
        //             nextIndex = (currentIndex + 1) % children.length;
        //             next = children[nextIndex];
        //             current.style.transform = `translateX(calc(${-100*currentIndex}% - ${Math.abs(x)}px))`
        //             next.style.transform = `translateX(calc(${-100*(nextIndex - 1)}% - ${Math.abs(x)}px))`
        //         } else {
        //             //?????????
        //             flag = -1;
        //             nextIndex = currentIndex === 0 ? currentIndex - 1 + children.length : currentIndex - 1;
        //             next = children[nextIndex];
        //             console.log('nextIndex', nextIndex, 'currentIndex', currentIndex)
        //             current.style.transform = `translateX(calc(${-100*currentIndex}% + ${Math.abs(x)}px))`
        //             next.style.transform = `translateX(calc(${-100*(nextIndex + 1)}% + ${Math.abs(x)}px))`
        //         }
        //     }
        //     const up = event => {
        //         current.style.transition = '';
        //         next.style.transition = '';
        //         setTimeout(() => {
        //             next.style.transition = '';
        //             current.style.transform = `translateX(${-100*(currentIndex + flag)}%)`;
        //             next.style.transform = `translateX(${-100*(nextIndex)}%)`;
        //             currentIndex = nextIndex;
        //         }, 16);
        //         this.interval = setCarouselInter();

        //         document.removeEventListener('mousemove', move)
        //         document.removeEventListener('mouseup', up)
        //     }

        //     document.addEventListener('mousemove', move);
        //     document.addEventListener('mouseup', up);
        // });

        return this.root;
    }
    mountTo(parent) {
        this.root = this.render();
        parent.appendChild(this.root);
    }
}
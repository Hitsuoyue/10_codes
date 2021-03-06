import { Component, createElement } from './framework';
import { Timeline, Animation } from './animation';
import './carousel.css';
import './gesture';
import { enableGesture } from './gesture';
import { cubicBezier } from './ease';

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

        enableGesture(this.root);

        this.root.addEventListener('tap', () => {
            console.log('tap----')
        })
        this.root.addEventListener('pan', () => {
            console.log('pan----')
        })

        let pauseBtn = document.createElement('button');
        pauseBtn.id = 'pause-btn';
        pauseBtn.innerHTML = 'pause';
        document.body.appendChild(pauseBtn);

        let resumeBtn = document.createElement('button');
        resumeBtn.id = 'resume-btn';
        resumeBtn.innerHTML = 'resume';
        document.body.appendChild(resumeBtn);

        // let element = document.createElement('div');
        // element.id = 'test';
        // document.body.appendChild(element);

        



        let t1 = new Timeline();

        pauseBtn.addEventListener('click', () => t1.pause())

        resumeBtn.addEventListener('click', () => t1.resume())


        let ele = document.getElementById('test');
        // console.log('ele', ele.style)
        t1.add(new Animation(ele.style, 'transform', 0, 600, 3000, 1000, undefined, v => `translateX(${v}px)`))
        t1.start();

        if(this.attributes.src && Array.isArray(this.attributes.src)) {
            for(let src of this.attributes.src) {
                let child = document.createElement('div');
                child.style.backgroundImage = `url('${src}')`;
                this.root.appendChild(child);
            }
        }

        // let currentIndex = 0;
        // let nextIndex = 1;
        // let current;
        // let next;
        // let flag;
        
        // const setCarouselInter = () => {
        //     return setInterval(() => {
        //         let children = this.root.children;
        //         let nextIndex = (currentIndex + 1) % children.length;
        //         let current = children[currentIndex];
        //         let next = children[nextIndex];
    
        //         next.style.transition = 'none';
        //         next.style.transform = `translateX(${-100*(nextIndex - 1)}%)`;
    
        //         setTimeout(() => {
        //             next.style.transition = '';
        //             current.style.transform = `translateX(${-100*(currentIndex + 1)}%)`;
        //             next.style.transform = `translateX(${-100*(nextIndex)}%)`;
        //             currentIndex = nextIndex;
        //         }, 16)
    
        //     }, 1000)
        // }

        // this.interval = setCarouselInter();

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
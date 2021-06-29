import { Component, createElement } from './framework';
import './carousel.css';

export default class Carousel extends Component {
    constructor() {
        super();
        console.log('this.root;,', this.root);
        this.attributes = Object.create(null);
    }

    setAttribute(name, value) {
        this.attributes[name] = value
    }

    render() {
        this.root = document.createElement('div', );
        this.root.classList.add('carousel');
        if(this.attributes.src && Array.isArray(this.attributes.src)) {
            for(let src of this.attributes.src) {
                let child = document.createElement('div');
                child.style.backgroundImage = `url('${src}')`;
                this.root.appendChild(child);
            }
        }

        let current = 0;

        this.root.addEventListener('mousedown', event => {
            console.log('mousedown');

            let startX = event.clientX;
            let children = this.root.children;

            const move = event => {
                console.log('mousemove')
                let x = event.clientX - startX;
                console.log('`translateX(calc${-100*current}% + ${x}px)`;', `translateX(calc${-100*current}%${x}px)`)
                for(let child of children) {
                    child.style.transition = 'none';
                    x > 0 ? child.style.transform = `translateX(calc(${-100*current}% + ${Math.abs(x)}px))` : 
                    child.style.transform = `translateX(calc(${-100*current}% - ${Math.abs(x)}px))`;
                    // child.style.transform = `translateX(calc(${-100*current}%${x}px))`;
                    // `translateX(${x}px)`;
                }

            }
            const up = event => {
                console.log('mouseup', this.root)
                let x = event.clientX - startX;

                const width = this.root.offsetWidth;
                if(x < 0) {
                    current++;
                } else {
                    current = current === 0 ? current - 1 + children.length : current - 1;
                }
                // console.log(width, x, x / width, 'direction', direction)
                for(let child of children) {
                    child.style.transition = 'none';
                    child.style.transform = `translateX(${-100*current}%)`;
                }
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
            }

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });

        // let currentIndex = 0;
        // setInterval(() => {
        //     let children = this.root.children;
        //     let nextIndex = (currentIndex + 1) % children.length;

        //     let current = children[currentIndex];
        //     let next = children[nextIndex];

        //     next.style.transition = 'none';
        //     next.style.transform = `translateX(${-100*(nextIndex - 1)}%)`;

        //     setTimeout(() => {
        //         next.style.transition = '';
        //         current.style.transform = `translateX(${-100*(currentIndex + 1)}%)`;
        //         next.style.transform = `translateX(${-100*(nextIndex)}%)`;
        //         currentIndex = nextIndex;
        //     }, 16)

        // }, 1000)

        return this.root;
    }
    mountTo(parent) {
        this.root = this.render();
        parent.appendChild(this.root);
    }
}
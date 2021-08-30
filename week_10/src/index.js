import { Component, createElement } from './framework';
import Carousel from './carousel';

let arr = [
    'https://t7.baidu.com/it/u=931123624,502354944&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=4113083086,1494496387&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=407688855,3169248799&fm=193&f=GIF',
    'https://t7.baidu.com/it/u=3337661019,3898256580&fm=193&f=GIF'
]
console.log(333)

let a = <Carousel src={arr} />;
a.mountTo(document.body);


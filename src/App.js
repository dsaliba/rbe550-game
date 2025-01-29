import * as React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

function sketch(p5) {
  let clicks = [];
  let img; 

  p5.preload = () => {
    img = p5.loadImage("/city.jpg"); 
  };

  p5.setup = () => {
    p5.createCanvas(1280, 720, p5.WEBGL)
    console.log(p5);

  };

  p5.draw = () => {
    p5.background(250);
    if (img) {
      p5.image(img, 50, 50, 300, 300);
    }
    clicks.forEach((click)=> {
      p5.ellipse(click.x, click.y, 20, 20);
    })
  };

  p5.mouseClicked = () => {
    console.log('Mouse clicked at:', p5.mouseX, p5.mouseY);
    clicks.push({x:p5.mouseX - (p5.width/2), y:p5.mouseY - p5.height/2});
    
  };

  


}

export default function App() {
  return <ReactP5Wrapper sketch={sketch} />;
}
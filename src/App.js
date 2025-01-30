import * as React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import matrix from "./Matrix";

function sketch(p5) {

  let img; 
  const tileSize = 10;
  let rows;
  let cols;
  let grid;
  let botSpeed = 2;
  let dragStart = null;
  let currentSelections = [];

  p5.preload = () => {
    img = p5.loadImage("/campus.jpg"); 
    
  }
  p5.setup = () => {
    p5.createCanvas(1570  , 1240, p5.WEBGL)
    rows = Math.floor(p5.width/tileSize);
    cols = Math.floor(p5.height/tileSize);
    //grid = Array.from(Array(rows), () => new Array(cols).fill(0));
    grid= matrix;
    console.log(p5);
    console.log(grid);
  };

  p5.draw = () => {
    p5.background(250);
    if (img) {
      p5.image(img, -p5.width/2, -p5.height/2, p5.width, p5.height);
    }

    let x1
    let x2
    let y1
    let y2
    if (dragStart !== null) {
      x1 = Math.min(dragStart.x, p5.mouseX - p5.width/2);
      x2 = Math.max(dragStart.x, p5.mouseX - p5.width/2);
      y1 = Math.min(dragStart.y, p5.mouseY - p5.height/2);
      y2 = Math.max(dragStart.y, p5.mouseY - p5.height/2);
    }
    
    p5.rectMode(p5.CORNERS);
    p5.stroke(0, 0, 0, 100);
    grid.forEach((row, r) => {
      row.forEach((type, c)=> {
        p5.fill(grid[r][c]===1?255:0, 0, 0, grid[r][c]===1?100:0);
        if (dragStart !== null) {
          let tx = r*tileSize - p5.width/2 + tileSize/2;
          let ty = c*tileSize - p5.height/2 + tileSize/2;
          if (tx > x1 && tx < x2) {
            if (ty > y1 && ty < y2) {
              p5.fill(255, 0, 255, 100);
              currentSelections.push({r: r, c: c});
            }
          }
        }
        
        p5.rect(r*tileSize - p5.width/2, c*tileSize - p5.height/2, (r+1)*tileSize - p5.width/2, (c+1)*tileSize - p5.height/2);
      });
    });

    if (dragStart !== null) {
      p5.fill(0, 0, 255, 100);
      p5.stroke(0, 0, 0);
      p5.rect(dragStart.x, dragStart.y, p5.mouseX - p5.width/2, p5.mouseY - p5.height/2);
    }


   
    
  };

  p5.mouseClicked = () => {
    console.log('Mouse clicked at:', p5.mouseX, p5.mouseY);
    //clicks.push({x:p5.mouseX - (p5.width/2), y:p5.mouseY - p5.height/2});
    
 
  };

  p5.mousePressed = () => {
    dragStart = {x: p5.mouseX - p5.width/2, y:p5.mouseY - p5.height/2};
  }

  p5.mouseReleased = () => {
    dragStart = null;
    currentSelections.forEach((pair)=> {
      grid[pair.r][pair.c] = 1;
    })
    printMatrixAsDeclaration(grid);

  }


  


}

function printMatrixAsDeclaration(matrix) {
  let output = "const matrix = [\n";

  for (let i = 0; i < matrix.length; i++) {
    output += "  [";
    for (let j = 0; j < matrix[i].length; j++) {
      output += matrix[i][j];
      if (j < matrix[i].length - 1) {
        output += ", ";
      }
    }
    output += "]";
    if (i < matrix.length - 1) {
      output += ",\n";
    }
  }

  output += "\n];";
  console.log(output);
}

export default function App() {
  return <ReactP5Wrapper sketch={sketch} />;
}
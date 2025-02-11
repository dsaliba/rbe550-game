import * as React from "react";
import { useReducer} from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import matrix from "./Matrix";

let grid;
let freeTiles = [];

let currentEvent = undefined;
let forceUpdate = ()=>undefined;


function sketch(p5) {

  let img; 
  const tileSize = 10;
  let rows;
  let cols;
  
  let botSpeed = 2;
  let dragStart = null;
  let currentSelections = [];
  let imgSize = {w:1200, h:870};
  let events = [];
  let timer = 0;

  p5.preload = () => {
    img = p5.loadImage("/bigcity.jpg"); 
    grid= matrix;
    grid.forEach((row, r) => {
      row.forEach((type, c)=> {
        if (type === 0) {
          freeTiles.push({r:r, c:c});
        }
      });
    });
    
    
    
  }
  p5.setup = () => {
    p5.createCanvas(imgSize.w  , imgSize.h, p5.WEBGL)
    rows = Math.floor(imgSize.w/tileSize);
    cols = Math.floor(imgSize.h/tileSize);
    //grid = Array.from(Array(rows), () => new Array(cols).fill(1));
    
    console.log(p5);
    console.log(grid);
    setTimeout(spawnRandomEvent, 2000);
  };

  function getRandomBoringTile() {
    let invalid = true;
    let tile;
    while (invalid) { //spooky
      tile = freeTiles[Math.floor(Math.random()*freeTiles.length)];
      invalid = false;
      events.forEach((event)=> {
        if (Math.abs(event.r -tile.r) + Math.abs(event.c-tile.c) < 20) {
          invalid = true;
          return;
        }
      })
    }
    return tile;
  }


  function spawnRandomEvent() {
    let spawnTile = getRandomBoringTile();
    switch(Math.floor(Math.random()*4)) {
      case 0:
        events.push({
          color: [247, 118, 142],
          flash: true,
          r: spawnTile.r,
          c: spawnTile.c,
          title: "Misparked Car"

        })
      break;
      case 1:
        events.push({
          color: [247, 118, 142],
          flash: true,
          r: spawnTile.r,
          c: spawnTile.c,
          title: "Faulty fusebox"
        })
      break;

      case 2:
        events.push({
          color: [247, 118, 142],
          flash: true,
          r: spawnTile.r,
          c: spawnTile.c,
          title: "Cat stuck in tree"
        })
      break;

      case 3:
        events.push({
          color: [247, 118, 142],
          flash: true,
          r: spawnTile.r,
          c: spawnTile.c,
          title: "Man passed out"
        })
      break;
    }
    console.log("event spawned");
    setTimeout(spawnRandomEvent, 10000 + Math.random()*5000);
  }


  p5.draw = () => {
    
    timer ++;
    

    p5.background(250);
    if (img) {
      p5.image(img, -p5.width/2, -p5.height/2, imgSize.w, imgSize.h);
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
    p5.stroke(0, 0, 0, 10);
    grid.forEach((row, r) => {
      row.forEach((type, c)=> {
        p5.fill(grid[r][c]===1?255:0, 0, 0, grid[r][c]===1?50:0);
        //p5.rect(r*tileSize - p5.width/2, c*tileSize - p5.height/2, (r+1)*tileSize - p5.width/2, (c+1)*tileSize - p5.height/2);
      
      });
    });

    events.forEach((event)=> {
      p5.fill(event.color[0], event.color[1], event.color[2]);
      if (event.flash && timer%30 > 15) p5.fill(255);
      p5.stroke(0);
      p5.strokeWeight(2);
      if (currentEvent === event) {
        p5.stroke(42, 195, 222);
        p5.strokeWeight(3);
      }
      
      p5.ellipseMode(p5.RADIUS);
      p5.ellipse(event.r*tileSize - p5.width/2 + tileSize/2, event.c*tileSize - p5.height/2 + tileSize/2, tileSize, tileSize);
    })




   
    
  };

  p5.mouseClicked = () => {
    console.log('Mouse clicked at:', p5.mouseX, p5.mouseY);
    let x = p5.mouseX ;
    let y = p5.mouseY;
    events.forEach((event)=> {
      let ex = event.r*tileSize + tileSize/2;
      let ey = event.c*tileSize + tileSize/2;
      if (((ex-x)*(ex-x))+((ey-y)*(ey-y)) < tileSize*tileSize) {
        currentEvent = event;
        event.flash = false;
        forceUpdate();

      }
    });
    
    
    
    
 
  };

  p5.mousePressed = () => {
    dragStart = {x: p5.mouseX - p5.width/2, y:p5.mouseY - p5.height/2};
  }

  p5.mouseReleased = () => {
    dragStart = null;
    currentSelections.forEach((pair)=> {
      grid[pair.r][pair.c] = 0;
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
  const [, forceUpdateLocal] = useReducer(x => x + 1, 0);
  forceUpdate = forceUpdateLocal;

  return <div className="outer-box">
    <div className="game-box">
      <div className="sketch-box">
      <ReactP5Wrapper sketch={sketch} />
      </div>
      <div className="side-panel">
        {currentEvent===undefined?"":((()=>{
          return <div className="event">
              <h1 className="event-title">{currentEvent.title}</h1>
              <div className="event-description">{currentEvent.description}</div>
              <div className="event-button-box">
                <button className="cop-button">Send Police</button>
                <button className="fire-button">Send Firefighters</button>
                <button className="ems-button">Send EMS</button>
                <button className="main-button">Send Maintance</button>
              </div>
            </div>
        }))()}
      </div>
    </div>

  </div>
}
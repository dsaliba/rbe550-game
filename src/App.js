import * as React from "react";
import { useReducer} from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import matrix from "./Matrix";
import Select from 'react-select';
import {Events, Stocks} from "./EventData"

let grid;
let freeTiles = [];

let currentEvent = undefined;
let forceUpdate = ()=>undefined;
let events = [];
let addressedEvents = [];
let robots = [];
let copBots = [];
let fireBots = [];
let emsBots = [];
let mainBots = [];
const warehouse_location = {
  cop: { r: 4, c: 11 },
  fire: { r: 4, c: 11 },
  ems: { r: 4, c: 11 }, 
  main: { r: 4, c: 11 }
};
function sketch(p5) {

  let img; 
  let eventImage
  const tileSize = 10;
  let rows;
  let cols;
  
  let botSpeed = 2;
  let dragStart = null;
  let currentSelections = [];
  let imgSize = {w:1200, h:870};
  
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
    
    robots.push(new Robot('cop'));
    robots.push(new Robot('fire'));
    robots.push(new Robot('ems'));
    robots.push(new Robot('main'));
    
    
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

  class Robot {
    
    constructor (type) {
      this.type = type;
      this.tile = getRandomBoringTile();
      this.stock = [];
      this.requested_item = null //Requested item for a dispatch must be cleared after the goal is started
      this.intermediateTargetReached = false


      switch (this.type) {
        case 'cop':
          copBots.push(this);
          // Stocks.cop.forEach((item)=>{this.stock.push(item.value)});
          break;
          case 'fire':
            fireBots.push(this);
            // Stocks.fire.forEach((item)=>{this.stock.push(item.value)});
            break;
            case 'ems':
              emsBots.push(this);
              // Stocks.ems.forEach((item)=>{this.stock.push(item.value)});
              break;
              case 'main':
                // Stocks.main.forEach((item)=>{this.stock.push(item.value)});
                mainBots.push(this)
                break;
      }
    }

    update() { 
      if (this.goal === undefined) {
       //if there is no goal 
      } 
      else {
        // console.log("stock status and target status " + this.has_stock(this.requested_item) + " " + this.intermediateTargetReached + (this.path ? " " + this.path.length : ""));
        
        if (!this.has_stock(this.requested_item) && !this.intermediateTargetReached) {
          // Need to go to warehouse first
          // console.log("Passed check1");
          // console.log("Type " + this.type);
          
          if (this.path === undefined) {
            this.target = warehouse_location[this.type];
            console.log(`Target (${this.target.r}, ${this.target.c}) current tile (${this.tile.r}, ${this.tile.c})`);      
            if (!this.isWalkable(this.target.r, this.target.c)) {
              console.error(`Warehouse location (${this.target.r}, ${this.target.c}) is not walkable!`);
              alert(`Invalid warehouse location for ${this.type}! Please update warehouse coordinates.`);
              this.intermediateTargetReached = true; // Skip warehouse step for now
              return;
            }
            this.path = this.aStar(this.tile, this.target);
            console.log("Path is " + this.path);
            this.pathIndex = 0;
          }
          
          // Move along the path
          if (this.path.length > 0 && this.pathIndex < this.path.length) {
            this.pathIndex = this.pathIndex + 1;
            this.tile = this.path[this.pathIndex];
            
            // Check if we've reached the warehouse
            if (this.pathIndex >= this.path.length - 1) {
              console.log("Reached warehouse");
              this.stock.push(this.requested_item);
              this.requested_item = null;
              this.path = undefined;
              this.pathIndex = undefined;
              this.intermediateTargetReached = true;
              // console.log("Passed check2");
            }
          } else {
            
            console.log("No path needed to warehouse - already there");
            this.stock.push(this.requested_item);
            this.requested_item = null;
            this.path = undefined;
            this.pathIndex = undefined;
            this.intermediateTargetReached = true;
            // console.log("Passed check2");
          }
        }
        else{
          if (this.path === undefined) {
            // console.log(this.goal);
            let target = {r: this.goal.event.r, c: this.goal.event.c};
            let start = { r: this.tile.r, c: this.tile.c };
            this.path = this.aStar(start, target);
            if (this.path.length === 0) {
              this.goal = undefined;
            }
            this.pathIndex = 0;
        }
        

         else 
         {
          if (this.pathIndex < this.path.length-1) {
            this.pathIndex = this.pathIndex + 1;
            this.tile = this.path[this.pathIndex];
          }else {
            this.resolveConflict();
            this.goal = undefined;
            this.path = undefined;
            this.pathIndex = undefined;
          }
          
        }
      }
    }
  }
    has_stock(desired) {
      // console.log("stock currently " + this.stock)
      // console.log("Do we have what we need " + this.stock.includes(desired))
      return this.stock.includes(desired);
    }
    resolveConflict() {
      this.goal.event.requiredStock.forEach((item)=>{
        if (this.stock.includes(item)) {
          this.goal.providedStock.push(item);
        }
      });
      // console.log(this.goal.outstandingBots);
      this.goal.outstandingBots--;
      if (this.goal.outstandingBots < 1) {
        if (this.goal.event.requiredStock.length === this.goal.providedStock.length) {
          // console.log(this.goal.event.requiredStock);
          // console.log(this.goal.providedStock);
          alert("Resolved");
        } else {
          alert("Failed!")
        }
        let eventIndex = 0;
        let addressedEventIndex = 0;
        events.forEach((v, i)=>{if (v===this.goal.event){eventIndex = i; return;}})
          addressedEvents.forEach((v, i)=>{if (v===this.goal){addressedEventIndex = i; return;}})
        events.splice(eventIndex, 1);
        addressedEvents.splice(addressedEventIndex, 1);
      }
      
    }

    aStar(start, goal) {
      console.log("Started A* with "+ `Target (${this.target.r}, ${this.target.c}) current tile (${this.tile.r}, ${this.tile.c})`)
      let openSet = new Set();
      let cameFrom = new Map();
      let gScore = new Map();
      let fScore = new Map();
  
      openSet.add(this.hash(start));
      gScore.set(this.hash(start), 0);
      fScore.set(this.hash(start), this.heuristic(start, goal));
      let counter = 0;
      while (openSet.size > 0) {
        counter ++;
        if (counter > 1000) {
          return[];
        }
       
          let current = this.getLowestFScore(openSet, fScore);
          // console.log(current);
  
          if (current.r === goal.r && current.c === goal.c) {
            console.log("We found a path for "+ `Target (${this.target.r}, ${this.target.c}) current tile (${this.tile.r}, ${this.tile.c})`)
            console.log("Path found is " + this.reconstructPath(cameFrom, goal, start))
              return this.reconstructPath(cameFrom, goal, start);
          }
  
          openSet.delete(this.hash(current));
  
          for (let neighbor of this.getNeighbors(current)) {
            let currentG = gScore.get(this.hash(current));
            
              let tentativeGScore = ( currentG===undefined?Infinity:currentG) + 1;
              
              if (tentativeGScore < (gScore.get(this.hash(neighbor)) || Infinity)) {
                  
                  cameFrom.set(this.hash(neighbor), current);
                  gScore.set(this.hash(neighbor), tentativeGScore);
                  fScore.set(this.hash(neighbor), tentativeGScore + this.heuristic(neighbor, goal));
  
                  openSet.add(this.hash(neighbor));
              }
          }
      }
      console.log("no path")
      return []; // No path found
  }
  
  // Get the node with the lowest fScore from openSet
  getLowestFScore(openSet, fScore) {
      let lowestNode = null;
      let lowestScore = Infinity;
  
      for (let hash of openSet) {
          let node = this.unhash(hash);
          let score = fScore.get(hash) || Infinity;
          if (score < lowestScore) {
              lowestScore = score;
              lowestNode = node;
          }
      }
      return lowestNode;
  }
  
  heuristic(a, b) {
      return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }
  
  getNeighbors(tile) {
      let directions = [
          { r: -1, c: 0 }, { r: 1, c: 0 }, 
          { r: 0, c: -1 }, { r: 0, c: 1 }  
      ];
      
      let neighbors = [];
      for (let dir of directions) {
          let nr = tile.r + dir.r;
          let nc = tile.c + dir.c;
          if (this.isWalkable(nr, nc)) {
              neighbors.push({ r: nr, c: nc });
          }
      }
      return neighbors;
  }
  
  // Check if a tile is walkable
  isWalkable(r, c) {
      return r >= 0 && r < grid.length && c >= 0 && c < grid[r].length && grid[r][c] === 0;
  }
  
  // Reconstruct path from A* search
  reconstructPath(cameFrom, goal, start) {
      let path = [];
      let current = goal;
      let counter = 0;
      // console.log(start);
      // console.log(current);
      while (cameFrom.has(this.hash(current)) && (!(current.r ===start.r && current.c===start.c))) {
        counter ++;
        if (counter > 10000){
          return undefined;
        }
          path.unshift(current);
          current = cameFrom.get(this.hash(current));
      }
      // console.log(path);
      return path;
  }
  
  // Hash function to uniquely identify objects
  hash(node) {
      return `${node.r},${node.c}`;
  }
  
  // Unhash function to get object back
  unhash(hash) {
      let [r, c] = hash.split(',').map(Number);
      return { r, c };
  }

    draw() {
      switch (this.type) {
        case 'cop':
          p5.fill(42, 195, 222);
          break;
          case 'fire':
            p5.fill(247, 118, 142);
            break;
            case 'ems':
              p5.fill(187, 154, 247);
              break;
              case 'main':
                p5.fill(224, 175, 104);
                break;
      }
      p5.stroke(0);
      p5.strokeWeight(2);
      p5.ellipseMode(p5.RADIUS);
      p5.ellipse(this.tile.r*tileSize - p5.width/2 + tileSize/2, this.tile.c*tileSize - p5.height/2 + tileSize/2, tileSize, tileSize);
    }
  }

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
    if (events.length < 5) {
      let spawnTile = getRandomBoringTile();
      let event = Events[Math.floor(Math.random()*Events.length)];
      //copies all the needed infromation from the event, stock and general classes
      events.push({
        color: [247, 118, 142],
        flash: true,
        r: spawnTile.r,
        c: spawnTile.c,
        title: event.title,
        description: event.description,
        requiredStock: event.requiredStock,
        suppliedStock: [],
        image: event.image  
      })
    }
    setTimeout(spawnRandomEvent, 10000 + Math.random()*5000);
  }

  function dispatch() {
    const needs = {
      copNeeded: copBots,
      fireNeeded: fireBots,
      emsNeeded: emsBots, 
      maintanceNeeded: mainBots
    };
    addressedEvents.forEach((currentEvent)=> {
      Object.keys(needs).forEach((need) => {
        if (currentEvent[need]) {  
          needs[need].forEach((bot) => {
            if (bot.goal === undefined) {
              bot.goal = currentEvent;  
              // bot.requested_item = addressedEvents.requestedStock
              bot.requested_item = currentEvent.requestedStock;
              console.log("Requested Item " + bot.requested_item)
              currentEvent[need] = false; 
            }
          });
        }
      });
    });
    // 
    //   if (event.copNeeded) {
    //     copBots.forEach((bot)=> {
    //       if (bot.goal === undefined) {
    //         bot.goal = event;

    //         event.copNeeded = false;
    //       }
    //     })
    //   }
    //   if (event.fireNeeded) {
    //     fireBots.forEach((bot)=> {
    //       if (bot.goal === undefined) {
    //         bot.goal = event;
    //         event.fireNeeded = false;
    //       }
    //     })
    //   }
    //   if (event.emsNeeded) {
    //     emsBots.forEach((bot)=> {
    //       if (bot.goal === undefined) {
    //         bot.goal = event;
    //         event.emsNeeded = false;
    //       }
    //     })
    //   }
    //   if (event.maintanceNeeded) {
    //     mainBots.forEach((bot)=> {
    //       if (bot.goal === undefined) {
    //         bot.goal = event;
    //         event.maintanceNeeded = false;
    //       }
    //     })
    //   }
    // })
  }

  p5.draw = () => {
    dispatch();
    timer ++;
    if (timer % 20 === 0 ) {
      robots.forEach((robot)=> {
        robot.update();
      })
    }
    
    p5.background(250);
    if (img) {
      p5.image(img, -p5.width/2, -p5.height/2, imgSize.w, imgSize.h);
    }
    if (eventImage)
    
    p5.rectMode(p5.CORNERS);
    p5.strokeWeight(0);
    p5.fill(0, 0, 0, 150);
    p5.rect(-p5.width, -p5.height, p5.width, p5.height);

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
      
      p5.rectMode(p5.RADIUS);
      p5.rect(event.r*tileSize - p5.width/2 + tileSize/2, event.c*tileSize - p5.height/2 + tileSize/2, tileSize, tileSize);
    })

    robots.forEach((robot)=> {
      robot.draw();
    })



   
    
  };

  p5.mouseClicked = () => {
    // console.log('Mouse clicked at:', p5.mouseX, p5.mouseY);
    let x = p5.mouseX ;
    let y = p5.mouseY;
    events.forEach((event)=> {
      let ex = event.r*tileSize + tileSize/2;
      let ey = event.c*tileSize + tileSize/2;
      if (((ex-x)*(ex-x))+((ey-y)*(ey-y)) < tileSize*tileSize) {
        currentEvent = event;
        eventImage = currentEvent.image
        // console.log("path to image:", eventImage)
        events.forEach((event) => {

        });
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
  // console.log(output);
}

export default function App() {
  const [, forceUpdateLocal] = useReducer(x => x + 1, 0);
  const [copStock, setCopStock] = React.useState([]);
  const [fireStock, setFireStock] = React.useState([]);
  const [emsStock, setEmsStock] = React.useState([]);
  const [maintanceStock, setMaintanceStock] = React.useState([]);
  forceUpdate = forceUpdateLocal;




  return <div className="outer-box">
    <div className="game-box">
      <div className="sketch-box">
      <ReactP5Wrapper sketch={sketch} />
      </div>
      <div className="side-panel">
        {currentEvent===undefined?"":((()=>{
          // console.log("current event", currentEvent.image);
          return <div className="event">
              <h1 className="event-title">{currentEvent.title}</h1>
              {currentEvent.image && (
                <img 
                    src={currentEvent.image} 
                    alt={currentEvent.title}
                    className="event-image"

                />
            )}
              <div className="event-description">{currentEvent.description}</div>
              <div className="event-button-box">
                <div className="cop-options" >
                  <h1 className="cop-title">Police Items</h1>
                  <Select options={Stocks.cop} className="selector" isMulti onChange={(values)=> {
                // console.log(values);
                setCopStock(values);
              }}/>
                </div>

                <div className="fire-options">
                  <h1 className="fire-title">Firefighter Items</h1>
                  <Select options={Stocks.fire} className="selector" isMulti onChange={(values)=> {
                // console.log(values);
                setFireStock(values);
              }}/>
                </div>

                <div className="ems-options">
                  <h1 className="ems-title">EMS Items</h1>
                  <Select options={Stocks.ems} className="selector" isMulti onChange={(values)=> {
                // console.log(values);
                setEmsStock(values);
              }}/>
                </div>

                <div className="main-options">
                  <h1 className="main-title">Maintance Items</h1>
                  <Select options={Stocks.main} className="selector" isMulti onChange={(values)=> {
                // console.log(values);
                setMaintanceStock(values);
              }}/>
                </div>


              <button className="submit-button" onClick={()=> {
                currentEvent.color = [158, 206, 106]
                
                let requested = [];
                copStock.forEach((item)=>{requested.push(item.value)});
                fireStock.forEach((item)=>{requested.push(item.value)});
                emsStock.forEach((item)=>{requested.push(item.value)});
                maintanceStock.forEach((item)=>{requested.push(item.value)});
                addressedEvents.push({
                  event: currentEvent,
                  requestedStock: requested,
                  copNeeded: copStock.length>0,
                  fireNeeded: fireStock.length>0,
                  emsNeeded: emsStock.length>0,
                  maintanceNeeded: maintanceStock.length>0,
                  providedStock: [],
                  outstandingBots: (copStock.length>0?1:0) + (fireStock.length>0?1:0) + (emsStock.length>0?1:0) +  (maintanceStock.length>0?1:0)
                })
                forceUpdate();
                currentEvent = undefined;
                setCopStock([]);
                setEmsStock([]);
                setFireStock([]);
                setMaintanceStock([]);
              }}>
                <h1>Submit</h1>
              </button>
              
              
              
              </div>
            </div>
        }))()}
      </div>
    </div>

  </div>
}
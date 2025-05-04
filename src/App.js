// import * as React from "react";
// import { useReducer} from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import matrix from "./Matrix";
import Select from 'react-select';
import {Events, Stocks} from "./EventData"
import { supabase } from './supabaseClient';
import React, { useEffect, useReducer } from "react";

console.log("🧪 Supabase client:", supabase);
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
let gt = 0;
// let reservationTable = new Map(); // reservation table for priority queue coordinate, timestamp
let roads = [];
let roadsByGrid;
let sessionId;
let sessionStartTime = Date.now();
let activeEvents = {}; // key: eventId or tile position
const table_name = 'game_sessions'

async function insertTestEventRecord() {    //this just inserts a test call to make sure the schema was good
  const start = new Date();
  const end = new Date(start.getTime() + 5000); 
  const duration = end - start;

  const { data, error } = await supabase
    .from(table_name)
    .insert([{
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      duration_ms: duration,
      event_type: "test_event",
      success: true,
    }])
    .select();

  if (error) {
    console.error("Failed to insert test event:", error);
  } else {
    console.log("Test event inserted:", data);
  }
}

async function startGameSession() {  //starts a game session I am not to sure I actually need to call this because I store the uuid elsewhere
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{ start_time: new Date() }])
    .select();

  if (error) {
    console.error("Session start failed", error);
  } else {
    sessionId = data[0].id;
    sessionStartTime = Date.now();
    console.log("Game session started:", sessionId);
  }
}


async function startEventRecord(event, eventKey) { //This I think should be the main function but not usre how to get the timing calls right
  const now = new Date();

  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{
      start_time: now,
      event_type: event.title
    }])
    .select();

  if (error) {
    console.error("Event start failed", error);
    return;
  }

  const eventId = data[0].id;
  activeEvents[eventKey] = {
    id: eventId,
    startTime: now.getTime()
  };

  event.supabaseId = eventId;
  event.startTimestamp = now.getTime();
}

async function completeEvent(event, eventKey) { //call this after the the event is finished records the event type time to complete and its success bool
  const active = activeEvents[eventKey];
  if (!active) return;

  const endTime = new Date();
  const duration = endTime.getTime() - active.startTime;

  const { error } = await supabase
    .from('game_sessions')
    .update({
      end_time: endTime,
      duration_ms: duration,
      success: event.requiredStock.length === event.providedStock.length
    })
    .eq('id', active.id);

  if (error) {
    console.error("Event completion failed", error);
  } else {
    console.log("Event completed:", active.id);
    delete activeEvents[eventKey];
  }
}

async function endGameSession() {
  const endTime = new Date();
  const duration = endTime.getTime() - sessionStartTime;

  const { error } = await supabase
    .from(table_name)
    .update({
      end_time: endTime,
      duration_ms: duration
    })
    .eq('id', sessionId);

  if (error) console.error("❌ Session end failed", error);
  else console.log("✅ Session ended:", sessionId);
}


function getRandomVibrantColor() {
  const goldenRatioConjugate = 0.618033988749895;
  let hue = Math.random();

  hue += goldenRatioConjugate;
  hue %= 1;

  const rgb = hsvToRgb(hue, 0.9, 0.9);
  return rgb;
}


function hsvToRgb(h, s, v) {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}


function createRoad() {
  return {
    edges: [],
    tiles: [],
    color: getRandomVibrantColor(),
    reservations: []
  }
}

function isTileReserved(r, c, t) {
  let road = roadsByGrid[r][c];
  road.reservations.forEach((res)=> {
    if (res.start <= t && res.end >= t) {
      return true;
    }
  })
  return false;
}

function generateRoads() {
 
  console.log(freeTiles);
  let mask = [];
  freeTiles.forEach((tile)=>{
    mask.push(true);
  })
  let used = []
  freeTiles.forEach((tile, index) => {
    if (mask[index] && tile.r > 0 && tile.c > 0 && tile.r < grid.length-1 && tile.c < grid[0].length-1 && !((grid[tile.r+2][tile.c]===0||grid[tile.r-2][tile.c]===0)&&(grid[tile.r][tile.c+2]===0||grid[tile.r][tile.c-2]===0))) {
      
      if (grid[tile.r-1][tile.c] === 0 && grid[tile.r+1][tile.c] ==0) {  //Horizontal road
        let rMin = undefined;
        let rMax = undefined;
        let i = 1;
        
        while (rMin === undefined || rMax==undefined) {
          if (rMin === undefined) {
            if (tile.r-i < 0 || grid[tile.r-i][tile.c] === 1 || (grid[tile.r-i][tile.c+2] === 0 || grid[tile.r-i][tile.c-2] === 0)) {
              rMin = tile.r-i+1;
            }
          }
          if (rMax === undefined) {
            if (tile.r+i >= grid.length || grid[tile.r+i][tile.c] === 1 || (grid[tile.r+i][tile.c+2] === 0 ||grid[tile.r+i][tile.c-2] === 0)) {
              rMax = tile.r+i-1;
            }
          }
          i++;
        }
        
        // let road = {edges:[], tiles:tiles, color: getRandomVibrantColor()};
        let road = createRoad();
        let tiles = road.tiles;
        
        for (i = rMin; i <= rMax; i++) {
          tiles.push({r: i, c: tile.c})
          roadsByGrid[i][tile.c] = road;
          //grid[i][tile.c]= 1;
        }
        freeTiles.forEach((created, index)=>{
          tiles.forEach((value)=> {
            
            if (created.r === value.r && created.c === value.c) {
              mask[index] = false;
            }
            return
          })
        })
        roads.push(road)
      } else if (grid[tile.r][tile.c-1] == 0 && grid[tile.r][tile.c+1] === 0) {  //Vertical road
        let cMin = undefined;
        let cMax = undefined;
        let i = 1;
        while (cMin === undefined || cMax==undefined) {
          if (cMin === undefined) {
            if (tile.c-i < 0 || grid[tile.r][tile.c-i] === 1 || (grid[tile.r+2][tile.c-i] === 0 || grid[tile.r-2][tile.c-i] === 0)) {
              cMin = tile.c-i+1;
            }
          }
          if (cMax === undefined) {
            if (tile.c+i >= grid[0].length || grid[tile.r][tile.c+i] === 1 || (grid[tile.r+2][tile.c+i] === 0 || grid[tile.r-2][tile.c+i] === 0)) {
              cMax = tile.c+i-1;
            }
          }
          i++;
        }
        let road = createRoad();
        let tiles = road.tiles;

        
        for (i = cMin; i <= cMax; i++) {
          tiles.push({r: tile.r, c: i})
           roadsByGrid[tile.r][i] = road;
          //grid[tile.r][i]= 1;
        }
        freeTiles.forEach((created, index)=>{
          tiles.forEach((value)=> {
            if (created.r === value.r && created.c === value.c) {
              mask[index] = false;
            }
            return
          })
        })
        roads.push(road);
      }else {
        console.log("Malformed road tile");
      }
     
    }
  });

  freeTiles.forEach((tile, index) => {
    if (mask[index] && tile.r > 0 && tile.c > 0 && tile.r < grid.length-1 && tile.c < grid[0].length-1 ) {
      //console.log(tile)
      let orthos = [{r: tile.r-1, c: tile.c}, {r: tile.r+1, c: tile.c}, {r: tile.r, c: tile.c-1}, {r: tile.r, c: tile.c-1}]
      let edges = [];
      // let road = {tiles:[tile],edges: edges, color: getRandomVibrantColor()};
      let road = createRoad();
      road.tiles.push(tile);
      road.edges = edges;
      orthos.forEach((o)=> {
        let e = roadsByGrid[o.r][o.c];
        if (e !== undefined) {
          edges.push(e);
          e.edges.push(road);
        }
      });
      roads.push(road)
      roadsByGrid[tile.r][tile.c] = road;
    }
  });
  //console.log(roads)
  freeTiles.forEach((tile)=> {
    grid[tile.r][tile.c] = 0;
  })
  
}








function sketch(p5) {
  let warehouse_location = {
    cop: { r: 4, c: 11 },
    fire: { r: 4, c: 11 },
    ems: { r: 4, c: 11 }, 
    main: { r: 4, c: 11 }
  };

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
    roadsByGrid = Array.from({ length: grid.length }, () => Array(grid[0].length)); //What am I even doing with my life at this point
    
    robots.push(new Robot('cop'));
    robots.push(new Robot('fire'));
    robots.push(new Robot('ems'));
    robots.push(new Robot('cop'));
    robots.push(new Robot('fire'));
    robots.push(new Robot('ems'));
    robots.push(new Robot('main'));
    robots.push(new Robot('main'));

    warehouse_location.cop = getRandomBoringTile()
    warehouse_location.ems = getRandomBoringTile()
    warehouse_location.fire = getRandomBoringTile()
    warehouse_location.main = getRandomBoringTile()
    generateRoads();
    console.log("sajdlf");
  }

  p5.setup = () => {
    p5.createCanvas(imgSize.w  , imgSize.h, p5.WEBGL)
    // startGameSession()

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
      this.failedPathCounter = 0;


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
    reservePath(path) {
      let i = gt;
      let lastRoad = undefined;
      let start = 0;
      let end = 0;
      path.forEach((tile)=> {
        i++;
        if (lastRoad !== roadsByGrid[tile.r][tile.c]) {
          if (lastRoad !== undefined) {
            lastRoad.reservations.push({start: start, end: end, bot: this});
            
          }
          start = i;
          
        }
        end=i;
        lastRoad = roadsByGrid[tile.r][tile.c];
      });
    }
    
    releaseTile(tile) {
      return;
      let road = roadsByGrid[tile.r]?.[tile.c];
      let cleaned = [];
      road.reservations.forEach((res)=> {
        if (res.bot !== this) cleaned.push(res);
      }) 
      road.reservations = cleaned;
    }

    releaseEntirePath() {
      if (!this.path) return;
      this.path.forEach(tile => this.releaseTile(tile));
    }
    // navigateToTarget(target, onArrival) {
      
    //   if (!this.path) {
    //     const start = { r: this.tile.r, c: this.tile.c };
    //     const path = this.aStar(start, target);
        
    //     if (path) {
    //       this.path = path;
    //       this.pathIndex = 0;
    //       this.reservePath(this.path);
    //     } else {
    //       // Wait for next tick
    //       return;
    //     }
    //   }
    
    //   // Step along the path
    //   if (this.pathIndex < this.path.length - 1) {
    //     const prevTile = this.path[this.pathIndex];
    //     this.releaseTile(prevTile);

    //     this.pathIndex++;
    //     this.tile = this.path[this.pathIndex];
    
        
    //   }
    
    //   // Check if we arrived
    //   if (this.pathIndex >= this.path.length - 1 ||
    //       (this.tile.r === target.r && this.tile.c === target.c)) {
    //     onArrival();
    //   }
    // }
    safeReleaseCurrentTile() {
      if (this.path && this.pathIndex !== undefined && this.path[this.pathIndex]) {
        this.releaseTile(this.path[this.pathIndex]);
      }
    }
    update() {
      if (!this.goal) return;
    
      const atWarehouse = this.tile.r === warehouse_location[this.type].r &&
                          this.tile.c === warehouse_location[this.type].c;
      if (this.path) {
        const myPriority = this.goal?.event?.priority ?? 999;
        for (let tile of this.path) {
          let road = roadsByGrid[tile.r]?.[tile.c];
          // if (road && road.isTileReserved(tile, myPriority)) {
          //   // This means someone else with higher priority owns this tile
          //   this.releaseEntirePath();
          //   this.path = undefined;
          //   this.pathIndex = undefined;
          //   break;
          // }
        }
      }
                        
                          
      // Step 1: Go to warehouse if item is needed and not yet collected
      if (!this.has_stock(this.requested_item) && !this.intermediateTargetReached) {
        const start = { r:this.tile.r, c: this.tile.c};
        const target = warehouse_location[this.type]
        if (!this.path) {
          this.failedPathCounter++;
        
          if (this.failedPathCounter % 5 === 0) { // Try every 5 updates
            const path = this.aStar(start, target);
            if (path && path.length > 0) {
              this.path = path;
              this.pathIndex = 0;
              this.reservePath(path);
              this.failedPathCounter = 0; // Reset on success
            }
          }
        
          return;
        }
        
        if (this.pathIndex < this.path.length - 1) {
          const prevTile = this.path[this.pathIndex];   // <- Add this
          this.releaseTile(prevTile);                   // <- And this
        
          this.pathIndex++;
          this.tile = this.path[this.pathIndex];
        }
        
    
        if (this.pathIndex >= this.path.length - 1 || atWarehouse) {
          console.log("Reached warehouse");
          this.stock.push(this.requested_item);
          this.safeReleaseCurrentTile();
          this.requested_item = null;
          this.releaseEntirePath();
          this.path = undefined;
          this.pathIndex = undefined;
          this.intermediateTargetReached = true;
          // this.releaseTile(this.path[this.pathIndex]);
          
        }
    
        return;
      }
    
      // Step 2: Go to event
      const start = {r: this.tile.r, c: this.tile.c};
      const target = { r: this.goal.event.r, c: this.goal.event.c};
      if (!this.path) {
      this.failedPathCounter++;

      if (this.failedPathCounter % 5 === 0) { // Try every 5 updates
        const path = this.aStar(start, target);
      if (path && path.length > 0) {
        this.path = path;
        this.pathIndex = 0;
        this.reservePath(path);
        this.failedPathCounter = 0; // Reset on success
      }
  }

  return;
}

    
      if (this.pathIndex < this.path.length - 1) {
        const prevTile = this.path[this.pathIndex];  // Save tile before moving
       // this.releaseTile(prevTile);                  // Release it

        this.pathIndex++;
        this.tile = this.path[this.pathIndex];       // Step to next tile
      }
    
      if (this.pathIndex >= this.path.length - 1) {
        this.resolveConflict();
        this.safeReleaseCurrentTile();
        this.releaseEntirePath();
        this.goal = undefined;
        this.path = undefined;
        this.pathIndex = undefined;
        // this.releaseTile(this.path[this.pathIndex]);
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
        // completeEventRecord(this.goal.event)
        if (this.goal.event.requiredStock.length === this.goal.providedStock.length) {
          // console.log(this.goal.event.requiredStock);
          // console.log(this.goal.providedStock);
          alert("Resolved");
        } else {
          alert("Failed!")
          console.log("Required:", this.goal.event.requiredStock);
          console.log("Provided:", this.goal.providedStock);
        }
        const eventKey = `${this.goal.event.title}_${this.goal.event.r}_${this.goal.event.c}`;
        completeEvent(this.goal.event, eventKey);
        let eventIndex = 0;
        let addressedEventIndex = 0;
        events.forEach((v, i)=>{if (v===this.goal.event){eventIndex = i; return;}})
          addressedEvents.forEach((v, i)=>{if (v===this.goal){addressedEventIndex = i; return;}})
        events.splice(eventIndex, 1);
        addressedEvents.splice(addressedEventIndex, 1);
      }
      
    }
    
    aStar(start, goal) {
      // console.log("Started A* with "+ `Target (${this.target.r}, ${this.target.c}) current tile (${this.tile.r}, ${this.tile.c})`)
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
            // console.log("We found a path for "+ `Target (${this.target.r}, ${this.target.c}) current tile (${this.tile.r}, ${this.tile.c})`)
            // console.log("Path found is " + this.reconstructPath(cameFrom, goal, start))
              return this.reconstructPath(cameFrom, goal, start);
          }
  
          openSet.delete(this.hash(current));
          const currentG = gScore.get(this.hash(current)) ?? Infinity;
          const tentativeGScore = currentG + 1;
          for (let neighbor of this.getNeighbors(current, gt + tentativeGScore)) {
            

            if (tentativeGScore < (gScore.get(this.hash(neighbor)) ?? Infinity)) {
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
  
  getNeighbors(tile, t) {
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
  // isWalkable(r, c) {
  //   return r >= 0 && r < grid.length && c >= 0 && c < grid[r].length && grid[r][c] === 0;
  // }
  isWalkable(r, c, t) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) return false;
    if (grid[r][c] !== 0) return false;
  
    const road = roadsByGrid[r]?.[c];
    const priority = this.goal?.event?.priority ?? 999;
    return !(road && isTileReserved(r, c, t));
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
      path.unshift(start)
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
      
      //TEMP
      let roads = [];
      if (this.path !== undefined && this.path.length > 0) {
        this.path.forEach((tile)=>{
          if (!roads.includes(roadsByGrid[tile.c][tile.c])) {
            roads.push(roadsByGrid[tile.r][tile.c]);
          }
        }) 

      }
      p5.strokeWeight(2);
      console.log(roads);
      roads.forEach((road)=> {
        let flag = false;
        
        road.reservations.forEach((res)=> {
          if (res.start <= gt && res.end >= gt) {
            flag = true;
          }
        });
        if (flag){
          p5.stroke(road.color.r, road.color.g, road.color.b);
        let start = road.tiles[0];
        let end = road.tiles[road.tiles.length-1];
        if (road.tiles.length > 1) {
          p5.line(start.r*tileSize + tileSize/2 - p5.width/2, start.c*tileSize + tileSize/2 - p5.height/2, end.r*tileSize + tileSize/2 - p5.width/2, end.c*tileSize + tileSize/2 - p5.height/2);
        } else {
          p5.fill(road.color.r, road.color.g, road.color.b);
          p5.rectMode(p5.CENTER);
          p5.rect(start.r*tileSize + tileSize/2 - p5.width/2, start.c*tileSize + tileSize/2 - p5.height/2, 8, 8);
        }
        }
        
      });

      const isActive = this.goal !== undefined;
      const isFlashing = isActive && timer % 30 < 15;
      let baseColor;
      switch (this.type) {
        case 'cop':
          baseColor = [42, 195, 222];
          break;
        case 'fire':
          baseColor = [247, 118, 142];
          break;
        case 'ems':
          baseColor = [187, 154, 247];
          break;
        case 'main':
          baseColor = [224, 175, 104];
          break;
        default:
          baseColor = [200, 200, 200];
      }
    
      // Flash between red and base color if dispatched
      if (isFlashing) {
        p5.fill(255, 255, 255); // red
      } else {
        p5.fill(...baseColor);
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
        image: event.image , 
        priority: event.priority
      })
    }
    setTimeout(spawnRandomEvent, 10000 + Math.random()*5000);
  }

  function dispatch() {
    const botPools = {
      copNeeded: copBots,
      fireNeeded: fireBots,
      emsNeeded: emsBots,
      maintanceNeeded: mainBots,
    };
  
    // Sort events by priority
    addressedEvents.sort((a, b) => a.event.priority - b.event.priority);
  
    addressedEvents.forEach(event => {
      Object.entries(botPools).forEach(([needKey, botList]) => {
        if (event[needKey]) {
          assignBotToEvent(event, needKey, botList);
        }
      });
    });
  }
  async function assignBotToEvent(event, needKey, botList) {
    for (let bot of botList) {
      if (bot.goal !== undefined) continue;
      if (event.outstandingBots <= 0) break;
  
      const matchingItems = event.requestedStock.filter(item =>
        Stocks[bot.type].map(stock => stock.value).includes(item)
      );
  
      if (matchingItems.length === 0) continue;
      const eventKey = `${event.title}_${event.r}_${event.c}`;
      if (!event.supabaseId) {
        await startEventRecord(event, eventKey);
      }
      bot.goal = event;
      bot.requested_item = matchingItems[0];
      event[needKey] = false;
      // if (!event.supabaseId) {
      //   startEventRecord(event, event.title + "_" + event.r + "_" + event.c);
      // }
      break;
    }
  }
  
  
  function drawWarehouse() {


    Object.entries(warehouse_location).forEach(([type, loc]) => {
      const wx = loc.r * tileSize + tileSize / 2 - p5.width / 2;
      const wy = loc.c * tileSize + tileSize / 2 - p5.height / 2;
      const pentagonRadius = tileSize * 1;
      const alpha = p5.TWO_PI / 5;
      const startAngle = -p5.PI / 2;
    
      // Set fill color based on warehouse type
      switch(type) {
        case 'cop': p5.fill(42, 195, 222); break;
        case 'fire': p5.fill(247, 118, 142); break;
        case 'ems': p5.fill(187, 154, 247); break;
        case 'main': p5.fill(224, 175, 104); break;
        default: p5.fill(150);
      }
    
      p5.stroke(0);
      p5.strokeWeight(1);
      p5.beginShape();
      for (let i = 0; i < 5; i++) {
        const angle = startAngle + i * alpha;
        const vx = wx + pentagonRadius * p5.cos(angle);
        const vy = wy + pentagonRadius * p5.sin(angle);
        p5.vertex(vx, vy);
      }
      p5.endShape(p5.CLOSE);
    });
  }
  p5.draw = () => {
    dispatch();
    timer ++;
    if (timer % 5 === 0 ) {
      gt++;
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
        let road = roadsByGrid[r]?.[c];
        // if (road && road.isTileReserved({r, c})) {
        //   p5.fill(0, 0, 255, 100); // Blue tint for reserved path
        // }
        // p5.fill(grid[r][c]===1?255:0, 0, 0, grid[r][c]===1?50:0);
        if (grid[r][c] === 1) {
          p5.fill(255, 0, 0, 50); // wall
        
        } else {
          p5.noFill();
        }
        //p5.rect(r*tileSize - p5.width/2, c*tileSize - p5.height/2, (r+1)*tileSize - p5.width/2, (c+1)*tileSize - p5.height/2);
      
      });
    });

      /*
      p5.strokeWeight(2);
      roads.forEach((road)=> {
        p5.stroke(road.color.r, road.color.g, road.color.b);
        let start = road.tiles[0];
        let end = road.tiles[road.tiles.length-1];
        if (road.tiles.length > 1) {
          p5.line(start.r*tileSize + tileSize/2 - p5.width/2, start.c*tileSize + tileSize/2 - p5.height/2, end.r*tileSize + tileSize/2 - p5.width/2, end.c*tileSize + tileSize/2 - p5.height/2);
        } else {
          p5.fill(road.color.r, road.color.g, road.color.b);
          p5.rectMode(p5.CENTER);
          p5.rect(start.r*tileSize + tileSize/2 - p5.width/2, start.c*tileSize + tileSize/2 - p5.height/2, 8, 8);
        }
      });
      */

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
    
    drawWarehouse()

   
    
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
  useEffect(() => {
    startGameSession();
  
    // Optionally end the session on window unload
    window.addEventListener("beforeunload", endGameSession);
    return () => window.removeEventListener("beforeunload", endGameSession);
  }, []);



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
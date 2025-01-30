import * as React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import nodes from "./nodes";
import edgesBaked from "./edges";


function sketch(p5) {
  let clicks = [];
  let img; 
  let currentNode = null;
  let edges = [];
  let bots = [];
  let botSpeed = 2;
  p5.preload = () => {
    img = p5.loadImage("/campus.jpg"); 
    edgesBaked.forEach((edge)=> {
      edges.push({a: nodes[edge.a], b:nodes[edge.b]});
    });

    for (var i = 0; i < 5; i++) {
      let startNode = nodes[Math.floor(Math.random()*nodes.length)];
      let bot = {at: startNode, x: startNode.x, y: startNode.y, to: null};
      edges.forEach((edge)=> {
        if (edge.a === startNode) {
          bot.to = edge.b;
        }
        if (edge.b === startNode) {
          bot.to = edge.a;
        }
      })
      bots.push(bot);
      console.log(bots);
    }
  };

  p5.setup = () => {
    p5.createCanvas(1568  , 1238, p5.WEBGL)
    console.log(p5);

  };

  p5.draw = () => {
    p5.background(250);
    if (img) {
      p5.image(img, -p5.width/2, -p5.height/2, p5.width, p5.height);
    }
    edges.forEach((edge)=> {
      p5.line(edge.a.x, edge.a.y, edge.b.x, edge.b.y);
    })
    p5.fill(0, 255, 0);
    nodes.forEach((node)=> {
      if (currentNode === node) {
        p5.fill(0, 0, 255);
      } else {
        p5.fill(0, 255, 0);
      }
      p5.ellipse(node.x, node.y, 8, 8);
    })

    bots.forEach((bot)=> {
      let theta = Math.atan2(bot.to.y - bot.at.y, bot.to.x-bot.at.x);
      bot.x += botSpeed*Math.cos(theta);
      bot.y += botSpeed*Math.sin(theta);
      let dx = bot.x-bot.to.x;
      let dy = bot.y-bot.to.y;
      
      if (dx*dx + dy*dy < 40) {
        bot.x = bot.to.x;
        bot.y = bot.to.y;
        let last = bot.at;
        bot.at = bot.to;
        edges.forEach((edge)=> {
          if (edge.a === bot.at && edge.b !== last) {
            bot.to = edge.b;
          }
          if (edge.b === bot.at && edge.a !== last) {
            bot.to = edge.a;
          }
        })
      }
      p5.fill(255, 0, 255);
      p5.ellipse(bot.x, bot.y, 10, 10);
    })
    
  };

  p5.mouseClicked = () => {
    console.log('Mouse clicked at:', p5.mouseX, p5.mouseY);
    //clicks.push({x:p5.mouseX - (p5.width/2), y:p5.mouseY - p5.height/2});
    
    nodes.forEach((node) => {
      let dx = p5.mouseX - (p5.width/2) - node.x;
      let dy = p5.mouseY - (p5.height/2) - node.y;
      
      if (dx*dx + dy*dy < 70) {
        // if (currentNode === null) {
        //   currentNode = node;
        // } else {
        //   edges.push({a: currentNode, b: node});
        //   let st = "let edges = [\n";
        //   edges.forEach((edge)=> {
        //     st += `{
        //       a: ${edge.a.id},
        //       b: ${edge.b.id}
        //       },`
        //   });
        //   console.log(st);
        //   currentNode = null;
        // }
        
      }
      
    })
   
  };

  


}

export default function App() {
  return <ReactP5Wrapper sketch={sketch} />;
}
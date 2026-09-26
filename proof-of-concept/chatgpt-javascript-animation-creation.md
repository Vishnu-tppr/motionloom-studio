# JavaScript Animation Creation

**User:** Anonymous  
**Created:** 9/15/2026 17:53:19  
**Updated:** 9/15/2026 18:30:12  
**Exported:** 9/26/2026 12:16:01  
**Link:** [https://chatgpt.com/share/6aa938b7-c3a4-83eb-ab37-fa3f7e4f6989](https://chatgpt.com/share/6aa938b7-c3a4-83eb-ab37-fa3f7e4f6989)  

## Prompt:
9/15/2026, 5:37:12 PM

![Screenshot 2026-09-15 at 14-06-49 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntprnortheu.oaiusercontent.com/files/00000000-e4d8-81f4-897a-456fff8a8bc8/raw?se=2026-09-26T06%3A51%3A10Z&sp=r&sv=2026-02-06&sr=b&scid=40051d41-d9a9-42df-be0c-34b4a6357223&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T01%3A36%3A52Z&ske=2026-09-27T01%3A36%3A52Z&sks=b&skv=2026-02-06&sig=z1T6nCF1LTtGQuRPSu1GSFed3ZZEwA02cl4D5n8uGJ8%3D)

How can someone make animations with just JavaScript? I saw this on Twitter. Someone shared a 30-second animation and said that this was done by Claude Opus entirely in JavaScript. You know, I'll give you a screenshot, maybe this will make sense to you. But, you know, it wasn't just, like, something very simple, like geometric shapes. It was actually looked like actual images, you know?

## Response:
9/15/2026, 5:37:17 PM

I’ll explain how JavaScript can build up images like these, using the screenshot to distinguish the likely technique from what we can actually verify.

> **Searched 6 websites**
>
> 
>
> Worked for 24s

Yes—**JavaScript can describe how to draw an entire illustration, including its textures, shading and movement.** It isn’t limited to moving boxes around a webpage. Your screenshot describes a technique called *procedural graphics*: storing a recipe for producing the pictures.

The browser provides a **canvas**, a drawing surface inside a webpage. JavaScript gives the browser instructions such as “draw a curve through these points”, “fill this area”, or “paint these tiny dots”. The browser turns those instructions into the coloured pixels you see. Curves can describe arbitrary outlines, so the subject can be a jellyfish, a tree or a face—not just recognisable geometric shapes. [Mozilla’s explanation of canvas drawing](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)

Take the jellyfish mentioned in your screenshot. A program could draw a curved, translucent dome for its body, add overlapping strokes for its internal structure, draw long wavering curves for its tentacles, and surround it with faint coloured marks suggesting a glow. Scatter many tiny dots across the background and you start getting underwater particles or grain. **Each operation is simple; the accumulated result can look like a detailed illustration.** A pencil drawing is also built from individual marks—the sophistication lies in their arrangement.

Programming makes repetition especially powerful. The author doesn’t need to specify ten thousand specks individually. They can write a rule that generates their positions, sizes and colours, with controlled randomness. Rules can also make marks denser in shadowed areas or follow the contour of an object. That is how relatively compact code can produce lots of visual detail.

Your screenshot describes an additional trick that helps explain the printed, textured appearance: **simulating separate blue, pink and yellow ink layers**. According to the text, the program turns these into dot patterns, slightly misaligns them, and combines their colours. That imitates the imperfections of printing. The browser has built-in ways of blending overlapping colours, including the “multiply” operation named in the screenshot. So something that looks like scanned artwork can actually be freshly computed marks. [Mozilla’s documentation on colour blending](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)

Animation adds **time as an input to the drawing recipe**. At one moment, draw the jellyfish at a particular height with its tentacles curving left. A moment later, draw it slightly higher with the curves shifted. Repeat rapidly and it moves. The same code produces successive frames by changing the numbers used to draw them; nobody needs to write hundreds of separate pictures. This repeated updating and redrawing is a standard way to animate a browser canvas. [Mozilla’s explanation of canvas animation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations)

That also clarifies the claim that “Claude drew every frame”. In this setup, **Claude writes the program; the browser executes it and draws the frames.** Claude doesn’t need to keep running while the animation plays. The resulting webpage could then be recorded as a video for Twitter.

I can’t verify the particular file or its authorship from this screenshot alone, but the described mechanism is entirely plausible. The impressive part would be the model’s ability to translate visual ideas into well-composed drawing and animation rules. JavaScript already provides the means; getting those rules to produce something beautiful is the harder achievement.

## Prompt:
9/15/2026, 5:39:02 PM

So is it similar to how SVGs are made?

## Response:
9/15/2026, 5:39:04 PM

Yes—**the central idea is very similar: describe how to draw the picture instead of storing a finished grid of pixels.** Both can use curves, outlines, fills, gradients and transparency to build elaborate illustrations.

The main difference is what the browser keeps around. With **SVG**, the picture is a collection of individual objects: “here’s a curve, here’s a circle, here’s a filled outline”. Those objects remain separately accessible, so JavaScript can change a particular tentacle’s shape or move the jellyfish as a group. The browser can also redraw them sharply when you zoom in.

With the **canvas approach in your screenshot**, JavaScript issues drawing commands that paint onto a pixel surface. Once painted, a tentacle is just coloured pixels; the canvas doesn’t remember that it was a separate object. To change it, the program typically clears and redraws the relevant scene. The program itself can still remember everything about the jellyfish.

So your intuition is right: **the same visual design could often be implemented either way.** Canvas is often convenient when you’re repeatedly generating huge numbers of marks—like the grain and printing dots here—whereas SVG is convenient when you want distinct shapes that remain individually editable or interactive. Neither is limited to simple-looking graphics.

## Prompt:
9/15/2026, 5:40:13 PM

Okay, so can you create a simple static image using that technique? Just as a proof of concept. Well, but, you know, maybe something more fancy than just a blue dot, for example.

## Response:
9/15/2026, 5:40:14 PM

I’ll make a small jellyfish illustration with JavaScript curves, translucent colour and grain, and include the webpage so you can see the drawing code. I’ll use the Library skill to make the files available.

The drawing code is ready: the same jellyfish recipe draws all three animals at different sizes and angles. I’m rendering it now to check the result and give you a static preview.

The image is ready. Its tentacles come from wave formulas, and its texture comes from thousands of generated dots. I’m saving the preview and the self-contained HTML file.

> **Inspecting workspace configuration files**
>
>
> **Inspected configuration, checked runtime, patched files, and captured screenshot**
>
> 
>
> **Locating Installed Browser Executables**
>
>
> **Rendered JavaScript artwork to PNG using installed Chromium and graphics dependencies**
>
> 
>
> **Auto-review stopped**
>
> 
>
> **Uploading jellyfish assets to library**
>
>
> **Uploaded jellyfish assets to the library**
>
> 
>
> Worked for 3m 8s

Here’s a jellyfish illustration drawn entirely with **JavaScript drawing commands**: curves for the bodies, wave formulas for the tentacles, and thousands of tiny dots for texture.

![Jellyfish illustration drawn using JavaScript](sandbox:/workspace/scratch/6977b51aa74c/jellyfish.png)

All three jellyfish use **the same drawing recipe**, with different sizes, positions and rotations.

Download [jellyfish.html](sandbox:/workspace/scratch/6977b51aa74c/jellyfish.html) and open it in Firefox: it draws the picture from scratch, offline, without loading any images. The static export is [jellyfish.png](sandbox:/workspace/scratch/6977b51aa74c/jellyfish.png).
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>After the light — a JavaScript drawing</title>
<style>
html,body{margin:0;background:#061c2a;min-height:100%;display:grid;place-items:center}
canvas{width:min(100vw,100vh);height:auto;display:block}
</style>
<canvas id="art" width="1200" height="1200" aria-label="Three luminous pink jellyfish floating in a dark blue sea, drawn entirely with JavaScript.">A procedural jellyfish illustration.</canvas>
<script>
// No image files, libraries, network requests or embedded media.
// Every mark is generated below with the browser's Canvas drawing commands.
const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');
const W=1200, H=1200;
let seed=1847;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function stroke(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}

// Deep-water background, with a soft shaft of light.
const sea=ctx.createLinearGradient(0,0,W,H);
sea.addColorStop(0,'#174b60');sea.addColorStop(.5,'#092b40');sea.addColorStop(1,'#071525');
ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
const light=ctx.createRadialGradient(280,180,0,340,270,780);
light.addColorStop(0,'rgba(55,147,153,.25)');light.addColorStop(1,'rgba(24,73,96,0)');
ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
for(let j=0;j<14;j++){
  ctx.beginPath();ctx.moveTo(90+j*42,0);ctx.lineTo(580+j*40,1080);ctx.lineTo(360+j*38,1080);ctx.closePath();
  ctx.fillStyle='rgba(98,192,192,.009)';ctx.fill();
}
// Suspended particles: one rule generates thousands of different marks.
for(let i=0;i<6200;i++){
  const x=random()*W,y=random()*H,r=.25+random()*1.2;
  dot(x,y,r,`rgba(133,211,209,${.02+random()*.2})`);
}

function jellyfish(x,y,scale,angle){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
  // Light around the animal, using a transparent radial gradient.
  const halo=ctx.createRadialGradient(0,-25,10,0,-25,300);
  halo.addColorStop(0,'rgba(255,126,169,.16)');halo.addColorStop(1,'rgba(255,126,169,0)');
  ctx.fillStyle=halo;ctx.fillRect(-300,-325,600,600);

  // Fine tentacles. Sine waves give their curves a fluid, organic shape.
  for(let j=0;j<36;j++){
    const root=(random()-.5)*280,length=210+random()*420,phase=random()*6.28;
    const points=[];
    for(let t=0;t<=1;t+=.006){
      points.push([root+Math.sin(t*7+phase)*(12+t*37)+t*t*82,20+t*length]);
    }
    stroke(points,`rgba(${j%3?255:123},${j%3?161:223},${j%3?190:227},${.19+random()*.4})`,.6+random()*1.5);
  }
  // Four thicker, folded oral arms, built from many translucent cross-strokes.
  for(let arm=0;arm<4;arm++){
    const length=310+random()*110,phase=arm*1.4;
    for(let i=0;i<420;i++){
      const t=i/420,yy=18+t*length;
      const xx=(arm-1.5)*37+Math.sin(t*8+phase)*27+t*t*70;
      const width=(1-t)*22+4;
      const ruffle=Math.sin(t*93+phase)*width;
      stroke([[xx-width*.4,yy-4],[xx+ruffle,yy],[xx+width*.6,yy+5]],`rgba(255,${146+Math.round(70*t)},192,.19)`,1.5);
    }
  }
  // The bell is a custom curved outline, not an imported picture.
  function bell(){
    ctx.beginPath();ctx.moveTo(-177,24);
    ctx.bezierCurveTo(-168,-77,-93,-160,0,-162);
    ctx.bezierCurveTo(94,-163,168,-80,177,24);
    ctx.bezierCurveTo(124,54,-117,57,-177,24);ctx.closePath();
  }
  const body=ctx.createLinearGradient(0,-170,0,65);
  body.addColorStop(0,'rgba(255,217,218,.87)');body.addColorStop(.22,'rgba(246,130,171,.65)');
  body.addColorStop(.72,'rgba(181,78,143,.27)');body.addColorStop(1,'rgba(255,158,171,.58)');
  bell();ctx.fillStyle=body;ctx.fill();
  ctx.save();bell();ctx.clip();
  // Curved internal ribs and a cloud of stippled pigment.
  for(let j=-10;j<=10;j++){
    ctx.beginPath();ctx.moveTo(j*2,-158);
    ctx.bezierCurveTo(j*8,-130,j*17,-63,j*16.5,44);
    ctx.strokeStyle='rgba(255,218,213,.23)';ctx.lineWidth=1.3;ctx.stroke();
  }
  for(let i=0;i<4500;i++){
    dot((random()-.5)*360,-165+random()*220,.25+random()*1.2,`rgba(255,219,211,${random()*.24})`);
  }
  // Four softly drawn internal loops.
  for(let k=0;k<4;k++){
    ctx.save();ctx.translate((k-1.5)*29,-22+Math.abs(k-1.5)*5);ctx.rotate((k-1.5)*.35);
    ctx.beginPath();ctx.ellipse(0,0,23,39,0,0,Math.PI*2);ctx.strokeStyle='rgba(255,208,182,.5)';ctx.lineWidth=4;ctx.stroke();ctx.restore();
  }
  ctx.restore();
  bell();ctx.strokeStyle='rgba(255,219,212,.74)';ctx.lineWidth=1.8;ctx.stroke();
  // Scalloped luminous edge.
  const edge=[];
  for(let i=0;i<=280;i++){
    const t=i/280;edge.push([-177+354*t,24+19*Math.sin(Math.PI*t)+3*Math.sin(t*Math.PI*32)]);
  }
  stroke(edge,'rgba(255,211,199,.95)',2.5);
  ctx.restore();
}

// Same drawing recipe, three sets of position / size / rotation inputs.
jellyfish(912,652,.42,.24);
jellyfish(245,775,.28,-.23);
jellyfish(565,390,1.25,-.15);

// A final thin layer of grain ties the illustration together.
for(let i=0;i<45000;i++){
  const v=random()>.5?'255,227,208':'0,6,24';
  ctx.fillStyle=`rgba(${v},${.015+random()*.045})`;
  ctx.fillRect(random()*W,random()*H,1,1);
}
// Quiet specimen-plate typography and border, also drawn on the canvas.
ctx.strokeStyle='rgba(174,214,210,.3)';ctx.lineWidth=1;ctx.strokeRect(38.5,38.5,1123,1123);
ctx.fillStyle='#a3c8ca';ctx.font='13px sans-serif';ctx.letterSpacing='3px';
ctx.fillText('PELAGIC STUDIES',76,92);
ctx.textAlign='right';ctx.fillText('PLATE 01',1124,92);ctx.textAlign='left';
ctx.fillStyle='#f0dcd6';ctx.font='italic 43px Georgia,serif';ctx.letterSpacing='0px';ctx.fillText('After the light',76,1079);
ctx.fillStyle='#9bbcc1';ctx.font='14px sans-serif';ctx.fillText('Curves, colour, and a little controlled randomness.',78,1110);
window.drawingComplete=true;
</script>
</html><!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>After the light — a JavaScript drawing</title>
<style>
html,body{margin:0;background:#061c2a;min-height:100%;display:grid;place-items:center}
canvas{width:min(100vw,100vh);height:auto;display:block}
</style>
<canvas id="art" width="1200" height="1200" aria-label="Three luminous pink jellyfish floating in a dark blue sea, drawn entirely with JavaScript.">A procedural jellyfish illustration.</canvas>
<script>
// No image files, libraries, network requests or embedded media.
// Every mark is generated below with the browser's Canvas drawing commands.
const canvas = document.getElementById('art');
const ctx = canvas.getContext('2d');
const W=1200, H=1200;
let seed=1847;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function stroke(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}

// Deep-water background, with a soft shaft of light.
const sea=ctx.createLinearGradient(0,0,W,H);
sea.addColorStop(0,'#174b60');sea.addColorStop(.5,'#092b40');sea.addColorStop(1,'#071525');
ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
const light=ctx.createRadialGradient(280,180,0,340,270,780);
light.addColorStop(0,'rgba(55,147,153,.25)');light.addColorStop(1,'rgba(24,73,96,0)');
ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
for(let j=0;j<14;j++){
  ctx.beginPath();ctx.moveTo(90+j*42,0);ctx.lineTo(580+j*40,1080);ctx.lineTo(360+j*38,1080);ctx.closePath();
  ctx.fillStyle='rgba(98,192,192,.009)';ctx.fill();
}
// Suspended particles: one rule generates thousands of different marks.
for(let i=0;i<6200;i++){
  const x=random()*W,y=random()*H,r=.25+random()*1.2;
  dot(x,y,r,`rgba(133,211,209,${.02+random()*.2})`);
}

function jellyfish(x,y,scale,angle){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);
  // Light around the animal, using a transparent radial gradient.
  const halo=ctx.createRadialGradient(0,-25,10,0,-25,300);
  halo.addColorStop(0,'rgba(255,126,169,.16)');halo.addColorStop(1,'rgba(255,126,169,0)');
  ctx.fillStyle=halo;ctx.fillRect(-300,-325,600,600);

  // Fine tentacles. Sine waves give their curves a fluid, organic shape.
  for(let j=0;j<36;j++){
    const root=(random()-.5)*280,length=210+random()*420,phase=random()*6.28;
    const points=[];
    for(let t=0;t<=1;t+=.006){
      points.push([root+Math.sin(t*7+phase)*(12+t*37)+t*t*82,20+t*length]);
    }
    stroke(points,`rgba(${j%3?255:123},${j%3?161:223},${j%3?190:227},${.19+random()*.4})`,.6+random()*1.5);
  }
  // Four thicker, folded oral arms, built from many translucent cross-strokes.
  for(let arm=0;arm<4;arm++){
    const length=310+random()*110,phase=arm*1.4;
    for(let i=0;i<420;i++){
      const t=i/420,yy=18+t*length;
      const xx=(arm-1.5)*37+Math.sin(t*8+phase)*27+t*t*70;
      const width=(1-t)*22+4;
      const ruffle=Math.sin(t*93+phase)*width;
      stroke([[xx-width*.4,yy-4],[xx+ruffle,yy],[xx+width*.6,yy+5]],`rgba(255,${146+Math.round(70*t)},192,.19)`,1.5);
    }
  }
  // The bell is a custom curved outline, not an imported picture.
  function bell(){
    ctx.beginPath();ctx.moveTo(-177,24);
    ctx.bezierCurveTo(-168,-77,-93,-160,0,-162);
    ctx.bezierCurveTo(94,-163,168,-80,177,24);
    ctx.bezierCurveTo(124,54,-117,57,-177,24);ctx.closePath();
  }
  const body=ctx.createLinearGradient(0,-170,0,65);
  body.addColorStop(0,'rgba(255,217,218,.87)');body.addColorStop(.22,'rgba(246,130,171,.65)');
  body.addColorStop(.72,'rgba(181,78,143,.27)');body.addColorStop(1,'rgba(255,158,171,.58)');
  bell();ctx.fillStyle=body;ctx.fill();
  ctx.save();bell();ctx.clip();
  // Curved internal ribs and a cloud of stippled pigment.
  for(let j=-10;j<=10;j++){
    ctx.beginPath();ctx.moveTo(j*2,-158);
    ctx.bezierCurveTo(j*8,-130,j*17,-63,j*16.5,44);
    ctx.strokeStyle='rgba(255,218,213,.23)';ctx.lineWidth=1.3;ctx.stroke();
  }
  for(let i=0;i<4500;i++){
    dot((random()-.5)*360,-165+random()*220,.25+random()*1.2,`rgba(255,219,211,${random()*.24})`);
  }
  // Four softly drawn internal loops.
  for(let k=0;k<4;k++){
    ctx.save();ctx.translate((k-1.5)*29,-22+Math.abs(k-1.5)*5);ctx.rotate((k-1.5)*.35);
    ctx.beginPath();ctx.ellipse(0,0,23,39,0,0,Math.PI*2);ctx.strokeStyle='rgba(255,208,182,.5)';ctx.lineWidth=4;ctx.stroke();ctx.restore();
  }
  ctx.restore();
  bell();ctx.strokeStyle='rgba(255,219,212,.74)';ctx.lineWidth=1.8;ctx.stroke();
  // Scalloped luminous edge.
  const edge=[];
  for(let i=0;i<=280;i++){
    const t=i/280;edge.push([-177+354*t,24+19*Math.sin(Math.PI*t)+3*Math.sin(t*Math.PI*32)]);
  }
  stroke(edge,'rgba(255,211,199,.95)',2.5);
  ctx.restore();
}

// Same drawing recipe, three sets of position / size / rotation inputs.
jellyfish(912,652,.42,.24);
jellyfish(245,775,.28,-.23);
jellyfish(565,390,1.25,-.15);

// A final thin layer of grain ties the illustration together.
for(let i=0;i<45000;i++){
  const v=random()>.5?'255,227,208':'0,6,24';
  ctx.fillStyle=`rgba(${v},${.015+random()*.045})`;
  ctx.fillRect(random()*W,random()*H,1,1);
}
// Quiet specimen-plate typography and border, also drawn on the canvas.
ctx.strokeStyle='rgba(174,214,210,.3)';ctx.lineWidth=1;ctx.strokeRect(38.5,38.5,1123,1123);
ctx.fillStyle='#a3c8ca';ctx.font='13px sans-serif';ctx.letterSpacing='3px';
ctx.fillText('PELAGIC STUDIES',76,92);
ctx.textAlign='right';ctx.fillText('PLATE 01',1124,92);ctx.textAlign='left';
ctx.fillStyle='#f0dcd6';ctx.font='italic 43px Georgia,serif';ctx.letterSpacing='0px';ctx.fillText('After the light',76,1079);
ctx.fillStyle='#9bbcc1';ctx.font='14px sans-serif';ctx.fillText('Curves, colour, and a little controlled randomness.',78,1110);
window.drawingComplete=true;
</script>
</html>

## Prompt:
9/15/2026, 5:44:30 PM

Thanks, this is fantastic. And how tricky is it to animate something like this?

## Response:
9/15/2026, 5:44:32 PM

**Making these jellyfish gently float and pulse would be fairly straightforward. Making them swim convincingly would take more care.** The drawing code already gives us most of what we need.

Right now, the program draws each jellyfish at a fixed position, size and angle. To animate it, I’d make those values depend on elapsed time: gradually move the animal upwards, rock it slightly, and gently widen and narrow its bell. The tentacles already follow wave formulas; shifting those waves over time would make them sway. The program would repeatedly draw the updated scene.

The difference between “moving illustration” and “convincing creature” is **how those movements relate to each other**. If the bell contracts, the jellyfish should accelerate; its tentacles should trail behind and react slightly later. Independent wobbling can look like a screensaver. Coordinated motion starts to suggest an animal moving through water—even without a full physics simulation.

There’s also a subtle trap in this particular image: **the random texture needs to stay consistent between frames**. If we generate completely new dots every time, the jellyfish’s skin will look like television static. We’d keep each animal’s speckles attached to its body, while letting underwater particles drift separately.

Finally, the static version happily draws tens of thousands of marks once. Repeating all that dozens of times a second could become expensive. We could draw the unchanging background once and reuse it, then spend the repeated work on the moving animals.

So a gentle, attractive animation would be a modest extension of this code. Most of the extra craft would go into the timing and coordination that make its movement feel alive.

## Prompt:
9/15/2026, 5:46:00 PM

Okay, let's try it. Let's do a simple animation, even if it's imperfect.

## Response:
9/15/2026, 5:46:01 PM

I’ll animate the jellyfish with gentle drifting, pulsing bells and swaying tentacles, keeping the grain steady so it doesn’t flicker.

The movement is in place. I’ve linked the bell’s pulse to a small upward movement and made waves travel down the tentacles, so the parts move together. I’m checking the loop and creating a video preview.

The animation now loops cleanly every 12 seconds. The texture stays steady, and the HTML version has a pause button. I’m saving it alongside the video preview.

> **Checking jellyfish files and FFmpeg availability**
>
>
> **Preparing bell sprites**
>
> **Preparing bell sprites**
>
> **Constructing offscreen bell sprites**
>
> **Constructing offscreen bell sprites**
>
> **Prepared and constructed offscreen bell sprites**
>
> 
>
> **Reading jellyfish HTML file**
>
>
> **Preparing Python scratch code**
>
> **Preparing Python scratch code**
>
> **Prepared Python scratch code**
>
> 
>
> **Creating animated jellyfish illustration file**
>
>
> **Created animated jellyfish illustration after checking files and FFmpeg**
>
> 
>
> **Applying a patch to files**
>
>
> **Applied a patch and rendered the animation script**
>
> 
>
> **Analyzing Jellyfish Video Metadata**
>
>
> **Analyzed metadata and uploaded animated jellyfish files**
>
> 
>
> Worked for 3m 29s

Here it is: gentle drifting, pulsing bells and rippling tentacles, in a **12-second loop**.

![Animated jellyfish preview](sandbox:/workspace/scratch/6977b51aa74c/jellyfish-animated.mp4)

Download [jellyfish-animated.html](sandbox:/workspace/scratch/6977b51aa74c/jellyfish-animated.html) and open it in Firefox to run the animation, with a pause button. It works offline—the JavaScript draws everything.

The video is also available as [jellyfish-animated.mp4](sandbox:/workspace/scratch/6977b51aa74c/jellyfish-animated.mp4).
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>After the light — animated in JavaScript</title>
<style>
*{box-sizing:border-box}html,body{margin:0;background:#061c2a;color:#b9d2d2;font:14px system-ui,sans-serif}
body{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center}
canvas{display:block;width:min(100vw,calc(100svh - 66px));height:auto}
footer{height:66px;display:flex;align-items:center;justify-content:center;gap:22px}
button{font:inherit;background:#13394a;color:#e9e3df;border:1px solid #426574;border-radius:7px;padding:8px 18px;cursor:pointer}
button:hover{background:#214b5c}button:focus-visible{outline:2px solid #ffc5d2;outline-offset:3px}
span{font-size:12px;letter-spacing:.025em}
</style>
<canvas id="art" width="1200" height="1200" aria-label="Three luminous pink jellyfish gently drifting, pulsing and trailing their tentacles through dark blue water.">An animated jellyfish illustration.</canvas>
<footer><button id="toggle" type="button" aria-pressed="false">Pause</button><span>A drawing made with JavaScript</span></footer>
<script>
// Every image used below is drawn by this code on startup. No imported media,
// libraries, network requests or AI services are needed to play this animation.
const canvas=document.getElementById('art');
const main=canvas.getContext('2d');
let ctx=main;
const W=1200,H=1200,TAU=Math.PI*2,LOOP=12;
function surface(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
let seed=1847;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function dot(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function stroke(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}


// Render the expensive, unchanging marks once and reuse them every frame.
const backdrop=surface(W,H);ctx=backdrop.getContext('2d');
// Deep-water background, with a soft shaft of light.
const sea=ctx.createLinearGradient(0,0,W,H);
sea.addColorStop(0,'#174b60');sea.addColorStop(.5,'#092b40');sea.addColorStop(1,'#071525');
ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
const light=ctx.createRadialGradient(280,180,0,340,270,780);
light.addColorStop(0,'rgba(55,147,153,.25)');light.addColorStop(1,'rgba(24,73,96,0)');
ctx.fillStyle=light;ctx.fillRect(0,0,W,H);
for(let j=0;j<14;j++){
  ctx.beginPath();ctx.moveTo(90+j*42,0);ctx.lineTo(580+j*40,1400);ctx.lineTo(360+j*38,1400);ctx.closePath();
  ctx.fillStyle='rgba(98,192,192,.009)';ctx.fill();
}
// Suspended particles: one rule generates thousands of different marks.
for(let i=0;i<6200;i++){
  const x=random()*W,y=random()*H,r=.25+random()*1.2;
  dot(x,y,r,`rgba(133,211,209,${.02+random()*.2})`);
}


const lettering=surface(W,H);ctx=lettering.getContext('2d');
// A final thin layer of grain ties the illustration together.
for(let i=0;i<45000;i++){
  const v=random()>.5?'255,227,208':'0,6,24';
  ctx.fillStyle=`rgba(${v},${.015+random()*.045})`;
  ctx.fillRect(random()*W,random()*H,1,1);
}
// Quiet specimen-plate typography and border, also drawn on the canvas.
ctx.strokeStyle='rgba(174,214,210,.3)';ctx.lineWidth=1;ctx.strokeRect(38.5,38.5,1123,1123);
ctx.fillStyle='#a3c8ca';ctx.font='13px sans-serif';ctx.letterSpacing='3px';
ctx.fillText('PELAGIC STUDIES',76,92);
ctx.textAlign='right';ctx.fillText('PLATE 01',1124,92);ctx.textAlign='left';
ctx.fillStyle='#f0dcd6';ctx.font='italic 43px Georgia,serif';ctx.letterSpacing='0px';ctx.fillText('After the light',76,1079);
ctx.fillStyle='#9bbcc1';ctx.font='14px sans-serif';ctx.fillText('Curves, colour, and a little controlled randomness.',78,1110);

function makeBell(id){
  seed=id;
  const sprite=surface(900,900);ctx=sprite.getContext('2d');
  ctx.save();ctx.scale(1.5,1.5);ctx.translate(300,325);
  // Light around the animal, using a transparent radial gradient.
  const halo=ctx.createRadialGradient(0,-25,10,0,-25,300);
  halo.addColorStop(0,'rgba(255,126,169,.16)');halo.addColorStop(1,'rgba(255,126,169,0)');
  ctx.fillStyle=halo;ctx.fillRect(-300,-325,600,600);

  // The bell is a custom curved outline, not an imported picture.
  function bell(){
    ctx.beginPath();ctx.moveTo(-177,24);
    ctx.bezierCurveTo(-168,-77,-93,-160,0,-162);
    ctx.bezierCurveTo(94,-163,168,-80,177,24);
    ctx.bezierCurveTo(124,54,-117,57,-177,24);ctx.closePath();
  }
  const body=ctx.createLinearGradient(0,-170,0,65);
  body.addColorStop(0,'rgba(255,217,218,.87)');body.addColorStop(.22,'rgba(246,130,171,.65)');
  body.addColorStop(.72,'rgba(181,78,143,.27)');body.addColorStop(1,'rgba(255,158,171,.58)');
  bell();ctx.fillStyle=body;ctx.fill();
  ctx.save();bell();ctx.clip();
  // Curved internal ribs and a cloud of stippled pigment.
  for(let j=-10;j<=10;j++){
    ctx.beginPath();ctx.moveTo(j*2,-158);
    ctx.bezierCurveTo(j*8,-130,j*17,-63,j*16.5,44);
    ctx.strokeStyle='rgba(255,218,213,.23)';ctx.lineWidth=1.3;ctx.stroke();
  }
  for(let i=0;i<4500;i++){
    dot((random()-.5)*360,-165+random()*220,.25+random()*1.2,`rgba(255,219,211,${random()*.24})`);
  }
  // Four softly drawn internal loops.
  for(let k=0;k<4;k++){
    ctx.save();ctx.translate((k-1.5)*29,-22+Math.abs(k-1.5)*5);ctx.rotate((k-1.5)*.35);
    ctx.beginPath();ctx.ellipse(0,0,23,39,0,0,Math.PI*2);ctx.strokeStyle='rgba(255,208,182,.5)';ctx.lineWidth=4;ctx.stroke();ctx.restore();
  }
  ctx.restore();
  bell();ctx.strokeStyle='rgba(255,219,212,.74)';ctx.lineWidth=1.8;ctx.stroke();
  // Scalloped luminous edge.
  const edge=[];
  for(let i=0;i<=280;i++){
    const t=i/280;edge.push([-177+354*t,24+19*Math.sin(Math.PI*t)+3*Math.sin(t*Math.PI*32)]);
  }
  stroke(edge,'rgba(255,211,199,.95)',2.5);

  ctx.restore();return sprite;
}
const animals=[
 {x:912,y:652,size:.42,angle:.24,phase:1.9,id:127},
 {x:245,y:775,size:.28,angle:-.23,phase:3.7,id:468},
 {x:565,y:390,size:1.25,angle:-.15,phase:0,id:1847}
];
for(const a of animals){
  a.bell=makeBell(a.id);seed=a.id;
  // Generate each tentacle's identity only once, so it cannot flicker.
  a.tentacles=Array.from({length:36},(_,j)=>({
    root:(random()-.5)*280,length:210+random()*420,phase:random()*TAU,
    color:`rgba(${j%3?255:123},${j%3?161:223},${j%3?190:227},${.19+random()*.4})`,width:.6+random()*1.5
  }));
  a.arms=Array.from({length:4},()=>310+random()*110);
}
ctx=main;seed=532;
const motes=Array.from({length:65},()=>({x:random()*W,y:random()*H,r:.8+random()*1.6,p:random()*TAU}));

function drawAnimal(a,seconds){
  const slow=TAU*seconds/LOOP+a.phase;
  const beat=TAU*seconds/3+a.phase;
  const flow=TAU*seconds/6;
  const bellWidth=1+.065*Math.sin(beat);
  const bellHeight=1-.045*Math.sin(beat);
  ctx.save();
  // Small vertical kicks share the bell's rhythm; slower drift completes a loop.
  ctx.translate(a.x+14*Math.sin(slow),a.y+17*Math.cos(slow)-7*Math.cos(beat));
  ctx.rotate(a.angle+.035*Math.sin(slow));ctx.scale(a.size,a.size);
  for(const f of a.tentacles){
    const points=[];
    for(let i=0;i<=100;i++){
      const t=i/100;
      // A wave travels down the length: the ends react later than the roots.
      const sway=Math.sin(t*7+f.phase-flow)*(12+t*37);
      const lag=12*t*Math.sin(beat-t*4);
      points.push([f.root*bellWidth+sway+t*t*82+lag,20*bellHeight+t*f.length]);
    }
    stroke(points,f.color,f.width);
  }
  for(let arm=0;arm<4;arm++){
    for(let i=0;i<210;i++){
      const t=i/210,phase=arm*1.4;
      const yy=18*bellHeight+t*a.arms[arm];
      const xx=(arm-1.5)*37*bellWidth+Math.sin(t*8+phase-flow)*27+t*t*70+9*t*Math.sin(beat-t*4);
      const width=(1-t)*22+4;
      const ruffle=Math.sin(t*93+phase-flow)*width;
      stroke([[xx-width*.4,yy-4],[xx+ruffle,yy],[xx+width*.6,yy+5]],`rgba(255,${146+Math.round(70*t)},192,.29)`,1.7);
    }
  }
  // Rescale the already-drawn bell; its stippled texture stays attached to it.
  ctx.scale(bellWidth,bellHeight);ctx.drawImage(a.bell,-300,-325,600,600);
  ctx.restore();
}
function renderAt(seconds){
  ctx=main;ctx.save();ctx.scale(canvas.width/W,canvas.height/H);
  ctx.drawImage(backdrop,0,0);
  for(const m of motes){
    const p=TAU*seconds/LOOP+m.p;
    dot(m.x+11*Math.sin(p),m.y+17*Math.cos(p),m.r,'rgba(171,224,218,.3)');
  }
  for(const a of animals)drawAnimal(a,seconds);
  ctx.drawImage(lettering,0,0);ctx.restore();
}
// A small playback controller. Clamp the clock after a suspended browser tab.
const button=document.getElementById('toggle');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let playing=!reduceMotion,elapsed=0,last=null;
function syncButton(){button.textContent=playing?'Pause':'Play';button.setAttribute('aria-pressed',String(!playing));}
button.addEventListener('click',()=>{playing=!playing;syncButton();last=null;});
function tick(now){
  if(last!==null&&playing)elapsed=(elapsed+Math.min((now-last)/1000,.1))%LOOP;
  last=now;
  if(playing)renderAt(elapsed);
  window.requestAnimationFrame(tick);
}
syncButton();renderAt(0);window.requestAnimationFrame(tick);
// Exposed for an offline video export; the browser uses the same drawing code.
window.renderAt=renderAt;
window.drawingComplete=true;
</script>
</html>
## Prompt:
9/15/2026, 5:59:13 PM

This is perfect. Thank you. And in terms of efficiency of how quickly it runs, or how many resources it consumes, is it better than ready-made assents images? Or what are the trade-offs of using assets like image files and videos versus this type of procedural JavaScript-based images and animations?

## Response:
9/15/2026, 5:59:14 PM

I’ll compare file size, playback work and flexibility, using the files we just made as a concrete example.

> **Checking jellyfish file sizes**
>
>
> **Checked jellyfish file sizes**
>
> 
>
> **Searched 1 website**
>
> 
>
> Worked for 37s

**Our JavaScript version is much cheaper to download, but it isn’t necessarily cheaper to run.** Those are different kinds of efficiency: you can send a small recipe and ask the viewer’s computer to do more work, or send a larger finished result that requires less work to display.

I checked the files we made:

| Our example | JavaScript + HTML | Exported image or video |
|---|---:|---:|
| Static illustration | 6 KB | PNG: 1.13 MB |
| Animated illustration | 9.3 KB | MP4: 2.79 MB |

The animation’s code is about **300 times smaller** than its video export. That is a comparison of these particular files, not a universal benchmark: different compression settings, resolutions and image formats would change the numbers.

**During playback, the balance can reverse.** With our JavaScript animation, your browser repeatedly calculates tentacle positions, draws curves and combines transparent layers. That consumes processor time and graphics resources. More animals, finer detail or a higher frame rate means more work.

The video also requires computation: the device must *decode* its compressed contents to reconstruct the frames. But many computers and phones have specialised hardware for doing that efficiently. Consequently, a video can play more smoothly and use less battery than a complicated procedural animation, despite being much larger to download. The outcome depends on the device and video format; I haven’t measured the two versions on your computer. [Mozilla’s explanation of playback efficiency](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API)

For a **static picture**, the distinction is less dramatic. Our JavaScript draws it once and stops. A PNG is decoded once and displayed. Neither requires continually reconstructing the scene, although generating a complicated procedural picture could cause a longer initial delay.

There’s another distinction: **file size is not memory usage**. A 1,200 × 1,200 pixel surface using four bytes per pixel occupies about 5.8 MB uncompressed, however tiny the recipe that produced it. Our animation keeps several drawing surfaces in memory. Its 9.3 KB download therefore does not mean it runs using 9.3 KB of RAM.

In fact, our animation already uses a useful compromise. At startup, the code draws the background and textured jellyfish bells into hidden drawing surfaces. Each frame then reuses those pictures, while calculating the changing tentacles. **It effectively makes its own reusable image assets.** This avoids regenerating thousands of speckles every frame—a standard canvas optimisation. [Mozilla’s canvas performance guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)

The biggest advantage beyond download size is **flexibility**. We could make the jellyfish follow your mouse, change their colours or adjust their movements without recording new videos. A video contains a fixed sequence of pictures; it cannot independently change one jellyfish’s behaviour.

However, image files can also participate in interactive animation. A program could load a painted jellyfish body from a PNG, move or stretch it, and draw procedural tentacles underneath. So the practical choice is often made **component by component**: use pictures for detailed artwork, formulas for adaptable movement, and video for a finished sequence whose content won’t change. Our jellyfish suit procedural drawing because much of their apparent complexity comes from repeated curves and dots; a detailed photograph would be far harder to describe with such a compact recipe.

## Prompt:
9/15/2026, 6:14:16 PM

![Screenshot 2026-09-15 at 14-43-04 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntpritalynorth.oaiusercontent.com/files/00000000-d058-8246-9b05-aab4bb4bda6c/raw?se=2026-09-26T06%3A51%3A11Z&sp=r&sv=2026-02-06&sr=b&scid=d3372d58-0e4c-4c2a-b858-499133f61f45&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T01%3A21%3A49Z&ske=2026-09-27T01%3A21%3A49Z&sks=b&skv=2026-02-06&sig=QuLq7QIi7eEL2bs6CNj9MRB3QpmIwsFBMNwJDjhH/B4%3D)

![Screenshot 2026-09-15 at 14-42-50 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntpritalynorth.oaiusercontent.com/files/00000000-f490-8246-be23-75564fc85a41/raw?se=2026-09-26T06%3A51%3A10Z&sp=r&sv=2026-02-06&sr=b&scid=6412ccce-4ccc-4a69-9506-7a3e8248ef53&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T05%3A43%3A58Z&ske=2026-09-27T05%3A43%3A58Z&sks=b&skv=2026-02-06&sig=UVdM39Gy01NSPpfLQfdxiKg9Lh/P9eCh4uQYxvqtiDc%3D)

![Screenshot 2026-09-15 at 14-40-50 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntpreastus.oaiusercontent.com/files/00000000-42d4-81f9-8c1d-e8836db0714a/raw?se=2026-09-26T06%3A51%3A11Z&sp=r&sv=2026-02-06&sr=b&scid=4503da4a-7f42-406f-a5ce-3d41eb0c96a8&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T01%3A38%3A06Z&ske=2026-09-27T01%3A38%3A06Z&sks=b&skv=2026-02-06&sig=jevaawfg/Qb3IEGA/djlO/31wmOaXtktGaQNvu/REXc%3D)

![Screenshot 2026-09-15 at 14-40-16 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntprukwest.oaiusercontent.com/files/00000000-84e8-8243-8042-c9f6ea35b347/raw?se=2026-09-26T06%3A51%3A11Z&sp=r&sv=2026-02-06&sr=b&scid=054abac0-5922-4e7d-87f8-6b0e2c524632&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T01%3A22%3A08Z&ske=2026-09-27T01%3A22%3A08Z&sks=b&skv=2026-02-06&sig=LFMFTh/hwYKNNro62Sr9vb8i/w6u2aenlCED0c5lGIg%3D)

![Screenshot 2026-09-15 at 14-39-56 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntprsoutheastus3.oaiusercontent.com/files/00000000-659c-820c-84ba-c50e1e607ae7/raw?se=2026-09-26T06%3A51%3A11Z&sp=r&sv=2026-02-06&sr=b&scid=58c27c79-d8c0-4b87-bb57-c8b0f685760c&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T04%3A41%3A02Z&ske=2026-09-27T04%3A41%3A02Z&sks=b&skv=2026-02-06&sig=E26NZYhj1eCoDQrgGUJ9KKTWSTxpJQ2v9OcLf6qScM8%3D)

![Screenshot 2026-09-15 at 14-39-45 Kevin Ngo on X Claude Opus 5 drew every frame of this animation using JavaScript. _ X.png](https://sdmntprdenmarkeast.oaiusercontent.com/files/00000000-0010-8210-b527-a869a4f7545a/raw?se=2026-09-26T06%3A51%3A11Z&sp=r&sv=2026-02-06&sr=b&scid=59f10a31-5829-49a5-8587-bb17770e66d1&skoid=37f774a3-b6f2-4e56-9fdd-339e5d6e97f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2026-09-26T01%3A07%3A21Z&ske=2026-09-27T01%3A07%3A21Z&sks=b&skv=2026-02-06&sig=CXxdun4MPspPtha8CokMUWz2pLV/k77%2Bg6JICLCgm74%3D)

Ah, okay. So that Twitter video was like, wait, it was... So it was almost 30 seconds long, and it was like a sequence of images that are changing very quickly. They have a certain aesthetic. I don't know what you would call it. And then, well, it wasn't a slideshow. Those images were like smooth animation when one image was changed into another, and there were some common themes running through all of them, like the circles that were on top of the images. I don't know how to describe it, but I suppose to produce something like this, someone would need to basically have a good prompt for what they want to achieve, and then animating it maybe wouldn't be all that tough. I mean, you can give me a reality check, because if someone actually works, I mean does this for a living, they would probably know what to ask for, how to name what they need, and how to articulate it. Because I don't even know what those effects are called.I can just give you a couple of frames, but they change very quickly so the final effect is pretty impressive.

## Response:
9/15/2026, 6:14:24 PM

I’ll look through the frames to identify the visual style. They can help explain how it was made, though I’ll have to be more tentative about the transitions without seeing them move.

> **Checking Adobe/Riso sources**
>
> **Checking Adobe/Riso sources**
>
> **Checked Adobe and Riso sources**
>
> 
>
> **Searched 14 websites**
>
> 
>
> Worked for 58s

**A clear artistic brief would help enormously here, and much of the animation could use standard techniques. The harder part is making all the pictures, movements and transitions feel like one deliberately designed piece.** These frames give us a much better basis for judging that.

I’d describe the aesthetic as **risograph-inspired motion graphics**: saturated pink, yellow and blue, paper-like backgrounds, slightly imperfect colour alignment, and prominent **halftone** patterns—the dots that create shading and colour mixtures. That connects it to printed posters, illustration and some comic-book art. “Motion graphics” is the broad category for animated graphic design. [Adobe’s explanation of halftone effects](https://www.adobe.com/products/photoshop/halftone-effects.html)

Something revealing about these particular pictures is that **their subjects suit procedural drawing unusually well**. A Ferris wheel repeats cabins around a circle. Fireworks repeat lines radiating from a centre. A sunflower repeats petals and seeds. A forest repeats variations of tree silhouettes. The lighthouse uses a fairly compact set of outlines and stripes. The composition and detailed printing texture make these recognisable structures feel much richer.

That creates a useful economy: once the program has a convincing system for applying the coloured dots and ink effects, it can reuse that system across every scene. It doesn’t have to invent the entire visual treatment separately for the bee, lighthouse and mountains.

The circles could also be doing substantial design work. They give your eye a recurring shape to follow while the subject changes. For example, a designer could align a sunflower’s centre with a Ferris wheel, then expand a circular opening to reveal the next scene. The movement connects otherwise unrelated images.

**A smooth transition doesn’t necessarily require one drawing to physically transform into another.** It might use a *circular wipe* or *iris transition*: the next picture becomes visible through an expanding circular window. Alternatively, two pictures might overlap and fade while zooming in a coordinated way. Actual *morphing* means the shapes themselves change into new shapes. I can’t tell which techniques this video uses from still frames, but the first options can produce striking continuity with relatively manageable code. [Adobe’s example of an iris transition](https://helpx.adobe.com/ph_fil/after-effects/how-to/iris-transition.html)

So your intuition about professional experience is partly right. A motion designer would likely know how to ask for consistent colour treatment, recurring motifs, controlled acceleration and deceleration, and particular transitions. More significantly, they could watch a first attempt and identify **why it feels wrong**: the next image appears too early, the circle distracts from the subject, every transition has the same rhythm, or the viewer has nowhere consistent to look.

Knowing the terminology helps communicate those decisions, but you can also describe them in ordinary language: “Keep the circle in the same place while the picture changes inside it, then let it expand to fill the screen.” That is already useful direction. References and pointing to specific moments can communicate things that a paragraph of specialist vocabulary won’t.

My reality check would therefore be: **producing a plausible version of this could be quite approachable with a capable coding model; reliably achieving a particular polished result is a more demanding task.** A fast montage can feel extremely elaborate even when each scene has fairly modest movement, because the sequencing, transitions and shared aesthetic do so much work. Making that combination effective is a real design achievement. The frames show a result well suited to code, but they don’t tell us how much direction, revision or selection went into getting it.

## Prompt:
9/15/2026, 6:19:09 PM

Okay, again, as a proof of concept, could you generate, like, a short video that follows a similar aesthetic? But I don't want this to be an exact rip-off. But, you know, just basically I want to see how quick, how easy it would be to make those types of smooth transitions between images. There should be something linking the images. You know, I really don't have the vocabulary for it, but it shouldn't feel like a slide show. But my main exposure for exposure this type of stuff is from ads, I suppose. Sometimes you have something more artistic going on in the ad, and they just do those types of images when one image melts into another, like transforms from something into something else, gets zoomed in or zoomed out, this type of trickery.

## Response:
9/15/2026, 6:19:10 PM

I’ll make a short sequence linked by a travelling pink ribbon: it will become steam above a cup, a winding river, then a kite’s tail. I’ll use a textured print look and flowing transitions, with JavaScript generating the images and motion.

The three scenes and transitions are built. The same ribbon changes shape and width throughout: steam spreads into a river, then narrows into the kite’s tail as the hills move out of view. I’m checking the frames before rendering the full clip.

The frame checks look good. I adjusted the closing title to leave room for the moving ribbon. The 15-second clip is now rendering; it combines the ribbon’s shape change with moving scenery and a subtle zoom.

The video is ready. I’m saving it with a browser version that lets you pause and drag through the transitions to see how they work.

> **Checking runtime and library upload availability**
>
>
> **Planning ribbon-linked scenes**
>
> **Planning ribbon-linked scenes**
>
> **Building procedural canvas**
>
> **Building procedural canvas**
>
> **Planned ribbon-linked scenes and built a procedural canvas**
>
> 
>
> **Planning ribbon-linked scenes**
>
> **Planning ribbon-linked scenes**
>
> **Building procedural canvas**
>
> **Building procedural canvas**
>
> **Planned ribbon-linked scenes and built procedural canvas**
>
> 
>
> **Planning ribbon-linked scenes**
>
> **Planning ribbon-linked scenes**
>
> **Building procedural canvas**
>
> **Building procedural canvas**
>
> **Mapping river-to-kite morph**
>
> **Mapping river-to-kite morph**
>
> **Built procedural canvas linking river-to-kite morph scenes**
>
> 
>
> **Creating a workspace directory**
>
>
> **Checking prepared renderer frames**
>
> **Checking prepared renderer frames**
>
> **Checked prepared renderer frames**
>
> 
>
> **Checked runtime, created workspace, and applied code patch**
>
> 
>
> **Applying a code patch**
>
>
> **Checking ribbon overlap**
>
> **Checking ribbon overlap**
>
> **Checked ribbon overlap**
>
> 
>
> **Improving headline spacing**
>
> **Improving headline spacing**
>
> **Improved headline spacing**
>
> 
>
> **Improving headline spacing**
>
> **Improving headline spacing**
>
> **Adjusting headline spacing**
>
> **Adjusting headline spacing**
>
> **Improved and adjusted headline spacing**
>
> 
>
> **Applying a patch to files**
>
>
> **Rendering the prepared video**
>
> **Rendering the prepared video**
>
> **Rendered the prepared video**
>
> 
>
> **Applied code patches and rendered previews and output**
>
> 
>
> **Inspecting Video Metadata and Properties**
>
>
> **Inspected video metadata and uploaded HTML and MP4 files**
>
> 
>
> Worked for 6m 27s

Here’s a **15-second motion study** with a textured print aesthetic. A continuous pink ribbon changes from **steam → river → kite tail**, linking the scenes as the scenery shifts around it.

![Follow a little wonder — animated preview](sandbox:/workspace/scratch/6977b51aa74c/follow-a-little-wonder.mp4)

Everything is drawn with JavaScript. The transitions combine actual shape changes, moving scenery and a gentle zoom.

Download [follow-a-little-wonder.mp4](sandbox:/workspace/scratch/6977b51aa74c/follow-a-little-wonder.mp4), or open [follow-a-little-wonder.html](sandbox:/workspace/scratch/6977b51aa74c/follow-a-little-wonder.html) in Firefox—the slider lets you inspect the transformations slowly.
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Follow a little wonder</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100svh;background:#183c46;color:#f4ebd8;display:flex;flex-direction:column;align-items:center;justify-content:center;font:14px system-ui,sans-serif}
canvas{display:block;width:min(100vw,calc(100svh - 68px));height:auto}
footer{height:68px;display:flex;align-items:center;gap:14px;width:min(90vw,550px)}
button{font:inherit;color:inherit;background:transparent;border:1px solid #77908c;border-radius:6px;padding:7px 12px;cursor:pointer;min-width:72px}
button:hover{background:#31555e}input{flex:1;min-width:40px;accent-color:#e77578}button:focus-visible,input:focus-visible{outline:2px solid #f2ca62;outline-offset:3px}
</style>
<canvas id="art" width="1080" height="1080" aria-label="An animated print illustration: pink steam above a cup stretches into a river, then becomes the tail of a flying kite."></canvas>
<footer><button id="play" type="button">Pause</button><input id="time" type="range" min="0" max="15" step="0.01" value="0" aria-label="Animation position"><button id="replay" type="button">Replay</button></footer>
<script>
// Original procedural motion study. All artwork is created by this program.
// No downloaded images, media, libraries, fonts or network connections.
// The same sampled ribbon changes shape and width across all three scenes.
const canvas=document.getElementById('art'),c=canvas.getContext('2d');
const W=1080,TAU=Math.PI*2,DURATION=15;
const P={paper:'#f4ecd9',ink:'#153f4a',coral:'#df596c',gold:'#eab844',sage:'#b2beb0',light:'#eee0bf'};
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
const mix=(a,b,t)=>a+(b-a)*t;
let seed=308;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function surface(w,h){let a=document.createElement('canvas');a.width=w;a.height=h;return a;}
function path(fn){let p=new Path2D();fn(p);return p;}
const dots=surface(9,9),dc=dots.getContext('2d');
dc.fillStyle=P.ink;dc.beginPath();dc.arc(2.5,2.5,1.35,0,TAU);dc.fill();
const dotPattern=c.createPattern(dots,'repeat');
const lines=surface(12,12),lc=lines.getContext('2d');
lc.strokeStyle=P.ink;lc.lineWidth=1;lc.beginPath();lc.moveTo(0,12);lc.lineTo(12,0);lc.stroke();
const linePattern=c.createPattern(lines,'repeat');
function paint(p,color,texture=.2,hatch=false){
  c.fillStyle=color;c.fill(p);
  if(texture){c.save();c.clip(p);c.globalAlpha*=texture;c.fillStyle=hatch?linePattern:dotPattern;c.fillRect(-1500,-1500,4000,4000);c.restore()}
}
function line(p,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(p)}
function ellipse(x,y,rx,ry,color,texture=.2){paint(path(p=>p.ellipse(x,y,rx,ry,0,0,TAU)),color,texture)}
function poly(points,color,texture=.2){paint(path(p=>{points.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath()}),color,texture)}
function label(txt,x,y,size,color=P.ink,italic=false){c.fillStyle=color;c.font=`${italic?'italic ':''}${size}px Georgia,serif`;c.fillText(txt,x,y)}
// Fixed paper fibres and pigment: cached, so they never regenerate and flicker.
const paper=surface(W,W),pc=paper.getContext('2d');
for(let i=0;i<67000;i++){
  pc.fillStyle=rnd()>.4?`rgba(21,63,74,${.025+rnd()*.09})`:`rgba(255,255,244,${.08+rnd()*.18})`;
  pc.fillRect(rnd()*W,rnd()*W,.5+rnd()*1.4,.5+rnd()*1.4);
}
const stars=Array.from({length:24},()=>({x:rnd()*W,y:70+rnd()*590,r:2+rnd()*3}));

function leaf(x,y,length,width,angle,color){
  c.save();c.translate(x,y);c.rotate(angle);
  const p=path(p=>{p.moveTo(0,0);p.bezierCurveTo(-width,-length*.3,-width*.7,-length*.85,0,-length);p.bezierCurveTo(width*.8,-length*.75,width,-length*.25,0,0)});
  paint(p,color,.27,true);line(path(p=>{p.moveTo(0,0);p.quadraticCurveTo(5,-length*.5,0,-length*.9)}),P.paper,1.8);c.restore();
}
function plant(t,amount){
  if(amount<.001)return;
  c.save();c.translate(-220*(1-amount),150*(1-amount));c.rotate(-.025*Math.sin(t));
  line(path(p=>{p.moveTo(89,1100);p.bezierCurveTo(155,820,75,635,156,460)}),P.ink,7);
  for(let j=0;j<7;j++){
    const yy=510+j*76,xx=120+18*Math.sin(j);
    leaf(xx,yy,120+j*5,32+(j%2)*13,(j%2?1:-1)*.94,P.ink);
  }
  c.restore();
}
function cloud(x,y,s,t){
 c.save();c.translate(x,y);c.scale(s,s);
 paint(path(p=>{p.moveTo(-140,25);p.bezierCurveTo(-176,-2,-130,-35,-94,-25);p.bezierCurveTo(-103,-90,-10,-102,13,-59);p.bezierCurveTo(59,-94,116,-55,109,-18);p.bezierCurveTo(175,-23,176,28,127,28);p.closePath()}),P.paper,.13);
 line(path(p=>{p.moveTo(-114,41);p.quadraticCurveTo(0,57,107,40)}),P.ink,1.3);c.restore();
}
function sun(t,a,b){
  const x=mix(790,238,b),y=mix(mix(247,238,a),256,b),r=mix(146,119,b);
  c.save();c.translate(x,y);c.rotate(.025*t);
  for(let j=0;j<32;j++){
    const q=j*TAU/32;
    line(path(p=>{p.moveTo(Math.cos(q)*(r+14),Math.sin(q)*(r+14));p.lineTo(Math.cos(q)*(r+28+6*Math.sin(j)),Math.sin(q)*(r+28+6*Math.sin(j)))}),P.gold,2.2);
  }
  ellipse(0,0,r,r,P.gold,.27);
  c.restore();
}
// The tabletop's initially straight edge bends into a landscape ridge.
function landscape(t,a,b){
  const fall=b*850;
  const ridge=(base,amp,freq,phase,color)=>{
    const p=path(p=>{p.moveTo(-30,1200+fall);
      for(let x=-30;x<=1110;x+=12){
        const riverY=base+amp*Math.sin(x*freq+phase)+22*Math.sin(x*.014+phase);
        p.lineTo(x,mix(780,riverY,a)+fall);
      }p.lineTo(1110,1200+fall);p.closePath();});
    paint(p,color,.3);
  };
  ridge(438,60,.006,1.8,P.sage);
  ridge(576,80,.005,-1,P.gold);
  ridge(710,72,.006,.5,P.ink);
  // Tablecloth stripes contract into contour lines during the transition.
  c.save();c.globalAlpha=1-a;
  for(let j=0;j<19;j++)line(path(p=>{p.moveTo(-200+j*91,795);p.lineTo(-420+j*125,1200)}),P.paper,4);
  c.restore();
  if(a>.001){
    c.save();c.globalAlpha=a;
    for(let band=0;band<9;band++){
      const p=path(p=>{for(let x=-20;x<=1100;x+=10){let y=785+band*26+44*Math.sin(x*.006+band*.08)+fall;x===-20?p.moveTo(x,y):p.lineTo(x,y)}});
      line(p,band%2?P.gold:P.paper,1.1);
    }
    c.restore();
  }
}
function cup(t,a){
  if(a>=1)return;
  c.save();c.translate(540,740+a*570);c.scale(1+a*.55,1+a*.55);c.rotate(-.035*Math.sin(t*.7)*(1-a));
  ellipse(0,103,234,40,P.paper,.2);ellipse(0,95,206,26,P.gold,.3);
  // Handle first; its cutout is a paper-coloured shape, then the cup covers it.
  ellipse(147,-9,84,75,P.coral,.2);ellipse(147,-11,47,43,P.paper,.13);
  const body=path(p=>{p.moveTo(-149,-85);p.lineTo(-129,41);p.bezierCurveTo(-116,128,106,136,128,40);p.lineTo(150,-85);p.closePath()});
  paint(body,P.coral,.27);
  c.save();c.clip(body);
  for(let j=0;j<8;j++)line(path(p=>{p.moveTo(-121+j*35,-75);p.bezierCurveTo(-118+j*35,-10,-102+j*32,47,-100+j*33,94)}),P.paper,2);
  c.restore();ellipse(0,-85,151,45,P.paper,.18);ellipse(0,-84,128,29,P.ink,.25);
  line(path(p=>p.ellipse(-3,-86,155,47,0,0,TAU)),P.ink,2);
  ellipse(-36,-86,40,9,P.gold,.15);c.restore();
}
function tree(x,y,s,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);
  line(path(p=>{p.moveTo(0,5);p.lineTo(0,-131)}),P.ink,6);
  for(let j=0;j<4;j++)poly([[0,-154+j*29],[-29-j*10,-88+j*29],[32+j*10,-88+j*29]],P.ink,.1);
  line(path(p=>{p.moveTo(-2,-143);p.lineTo(-2,-7)}),P.gold,1.2);c.restore();
}
function trees(t,a,b){
  const s=ease((a-.25)/.75);if(s<.001)return;
  for(let j=0;j<14;j++){
    const x=40+j*79,y=790+78*Math.sin(j*.8)+b*760;
    // Leave the middle of the image free for the river.
    if(x>400&&x<690)continue;
    tree(x,y,s*(.78+(j%3)*.14),.025*Math.sin(t+j));
  }
}
// Interpolate corresponding points: real shape morphing, not scene crossfades.
function ribbonPoint(u,t,a,b){
  const steam={x:540+26*Math.sin(u*10-t*1.8)*Math.sin(Math.PI*u),y:648-455*u};
  const river={x:570+165*Math.sin(u*6.8+.7)*(1-u)+18*Math.sin(t*.7+u*5)*(1-u),y:1160-767*u};
  const kite={x:mix(355,733,u)+92*Math.sin(u*7.2-t*1.4)*(1-u),y:1030-651*u};
  return {x:mix(mix(steam.x,river.x,a),kite.x,b),y:mix(mix(steam.y,river.y,a),kite.y,b)};
}
function ribbon(t,a,b){
  const n=200,points=[];
  for(let i=0;i<=n;i++){
    const u=i/n,pt=ribbonPoint(u,t,a,b);
    const width=mix(mix(8+5*Math.sin(u*Math.PI),2+152*(1-u)**1.5,a),6+5*(1-u),b);
    const next=ribbonPoint(Math.min(1,u+.003),t,a,b),prev=ribbonPoint(Math.max(0,u-.003),t,a,b);
    const dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1;
    points.push({...pt,nx:-dy/len,ny:dx/len,width});
  }
  const shape=path(p=>{points.forEach((q,i)=>{let x=q.x+q.nx*q.width,y=q.y+q.ny*q.width;i?p.lineTo(x,y):p.moveTo(x,y)});[...points].reverse().forEach(q=>p.lineTo(q.x-q.nx*q.width,q.y-q.ny*q.width));p.closePath()});
  paint(shape,P.coral,.3);
  const seam=path(p=>{points.forEach((q,i)=>{let x=q.x+q.nx*q.width*.43,y=q.y+q.ny*q.width*.43;i?p.lineTo(x,y):p.moveTo(x,y)})});
  line(seam,P.paper,mix(2,3,a)*(1-b*.6));
  // River ripples shrink away as it becomes the kite's thin tail.
  c.save();c.globalAlpha=a*(1-b);
  for(let j=0;j<15;j++){
    let u=.08+j*.051,q=points[Math.floor(u*n)];
    line(path(p=>{p.moveTo(q.x-q.width*.52,q.y+2*Math.sin(t+j));p.lineTo(q.x+q.width*.2,q.y-4)}),P.paper,2);
  }
  c.restore();
  // Bows open along the ribbon as the kite takes shape.
  if(b>.001){for(let j=0;j<6;j++){
    const u=.18+j*.115,q=points[Math.floor(u*n)],s=b*(18+j);
    c.save();c.translate(q.x,q.y);c.rotate(.3*Math.sin(t*1.5+j));
    poly([[0,0],[-s,-s*.7],[-s,s*.7]],j%2?P.gold:P.ink,.27);
    poly([[0,0],[s,-s*.7],[s,s*.7]],j%2?P.gold:P.ink,.27);c.restore();
  }}
}
function boat(t,a,b){
  const visibility=ease((a-.7)/.3)*(1-ease(b*2));if(visibility<.001)return;
  const q=ribbonPoint(.44,t,a,b);
  c.save();c.translate(q.x,q.y);c.rotate(-.13+.035*Math.sin(t*2));c.scale(visibility,visibility);
  poly([[-44,0],[50,0],[28,21],[-25,20]],P.paper,.2);
  line(path(p=>{p.moveTo(0,0);p.lineTo(0,-93)}),P.paper,4);
  poly([[-5,-87],[-5,-8],[-57,-8]],P.gold,.2);
  poly([[6,-66],[6,-8],[38,-8]],P.paper,.2);c.restore();
}
function kite(t,a,b){
  if(b<.001)return;
  const q=ribbonPoint(1,t,a,b);
  c.save();c.translate(q.x,q.y);c.rotate(.09*Math.sin(t*1.2));c.scale(b,b);
  const left=[-121,-151],top=[0,-310],right=[121,-151],bottom=[0,0],centre=[0,-151];
  poly([bottom,left,centre],P.ink,.25);poly([left,top,centre],P.gold,.35);
  poly([top,right,centre],P.coral,.28);poly([right,bottom,centre],P.paper,.26,true);
  line(path(p=>{p.moveTo(0,0);p.lineTo(0,-310);p.moveTo(-121,-151);p.lineTo(121,-151)}),P.ink,3);
  line(path(p=>{p.moveTo(4,0);p.lineTo(4,-310)}),P.paper,1.5);
  line(path(p=>{p.moveTo(-121,-151);p.lineTo(0,-310);p.lineTo(121,-151);p.lineTo(0,0);p.closePath()}),P.ink,2);
  c.restore();
}
function birds(t,b){
 if(b<.001)return;
 c.save();c.globalAlpha=b;
 for(let j=0;j<4;j++){
  const x=70+j*255+36*Math.sin(t*.5+j),y=160+j%2*340;
  const flap=10+8*Math.sin(t*3+j);
  line(path(p=>{p.moveTo(x-20,y-flap);p.quadraticCurveTo(x-9,y-12,x,y);p.quadraticCurveTo(x+12,y-11,x+23,y-flap+3)}),P.ink,3);
 }c.restore();
}
function renderAt(t){
  t=Math.max(0,Math.min(DURATION,t));
  const a=ease((t-3)/2.3),b=ease((t-8)/2.4),end=ease((t-12.3)/1.5);
  c.save();c.scale(canvas.width/W,canvas.height/W);c.fillStyle=P.paper;c.fillRect(0,0,W,W);
  // A slow camera push unifies the transformation while keeping its centre fixed.
  const zoom=1+.035*Math.sin(Math.PI*t/DURATION);
  c.save();c.translate(540,540);c.scale(zoom,zoom);c.translate(-540,-540);
  sun(t,a,b);
  c.save();c.globalAlpha=.12;
  for(const s of stars)ellipse(s.x,s.y,s.r,s.r,P.ink,0);
  c.restore();
  const cloudVisibility=a;
  c.save();c.globalAlpha=cloudVisibility;
  cloud(270+17*Math.sin(t*.3),mix(324,434,b),1.3,t);
  cloud(916+19*Math.cos(t*.3),mix(423,655,b),.82,t);
  c.restore();
  landscape(t,a,b);plant(t,1-a);trees(t,a,b);
  cup(t,a);ribbon(t,a,b);boat(t,a,b);kite(t,a,b);birds(t,b);
  c.restore();
  c.drawImage(paper,0,0);
  // Typography arrives only at the end; the scenes themselves stay uninterrupted.
  if(end>0){
    c.save();c.globalAlpha=end;
    label('Follow a',80,640+20*(1-end),64,P.ink,true);
    label('little wonder.',80,718+20*(1-end),64,P.ink,true);
    c.font='14px sans-serif';c.letterSpacing='3px';c.fillStyle=P.ink;c.fillText('A SMALL JOURNEY IN THREE INKS',84,773+20*(1-end));
    c.restore();
  }
  c.strokeStyle='rgba(21,63,74,.35)';c.lineWidth=1;c.strokeRect(28.5,28.5,1023,1023);
  c.restore();
}
const play=document.getElementById('play'),scrub=document.getElementById('time'),replay=document.getElementById('replay');
let elapsed=0,last=null,playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function sync(){play.textContent=playing?'Pause':elapsed>=DURATION?'Play again':'Play';scrub.value=elapsed}
play.addEventListener('click',()=>{if(elapsed>=DURATION)elapsed=0;playing=!playing;last=null;sync()});
replay.addEventListener('click',()=>{elapsed=0;playing=true;last=null;renderAt(0);sync()});
scrub.addEventListener('input',()=>{elapsed=Number(scrub.value);playing=false;renderAt(elapsed);last=null;sync()});
function tick(now){
 if(last!==null&&playing){elapsed=Math.min(DURATION,elapsed+Math.min((now-last)/1000,.1));renderAt(elapsed);if(elapsed===DURATION)playing=false;sync()}
 last=now;window.requestAnimationFrame(tick);
}
renderAt(0);sync();window.requestAnimationFrame(tick);window.renderAt=renderAt;window.duration=DURATION;
</script>
</html>

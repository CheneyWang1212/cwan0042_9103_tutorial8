let song;
  //audio file from freesound https://freesound.org/people/multitonbits/sounds/383935/?
function preload() {
  song = loadSound("assets/bgm.mp3");
}

//Added the isExploding property to mark whether the bubble is exploding. In the move method, added a check for isExploding to ensure the bubble does not move while exploding. In the display method, added a check for isExploding to ensure the bubble is not rendered while exploding. Added the explode method to mark the bubble as exploding and generate particle effects.

class MovingBubble {
  constructor(text, col1, col2) {
    this.x = random(width);
    this.y = random(height);
    this.size = random(100, 190);
    this.baseSize = this.size; // Store the base size
    this.col1 = col1;
    this.col2 = col2;
    this.noiseOffset = random(1000);
    this.phase = 0;
    this.text = text;
    this.speedX = random(-0.5, 0.5);
    this.speedY = random(-0.5, 0.5);
    this.isHovered = false;
    this.isExploding = false;
  }

  move() {
    if (!this.isHovered && !this.isExploding) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    } else if (this.isHovered) {
      this.phase += 0.04;
      this.size = this.baseSize * (1 + 0.2 * sin(this.phase));
    }
  }

  display() {
    if (this.isExploding) return; // Skip rendering if exploding

    noStroke();
    let gradientSteps = 10;
    for (let i = gradientSteps; i > 0; i--) {
      let t = i / gradientSteps;
      let col = lerpColor(this.col1, this.col2, t);
      fill(col);
      beginShape();
      let angleStep = TWO_PI / 100;
      for (let angle = 0; angle < TWO_PI; angle += angleStep) {
        let r = (this.size / 2) * t + 20 * noise(cos(angle) + 1, sin(angle) + 1, frameCount * 0.02 + this.noiseOffset);
        let x = this.x + r * cos(angle);
        let y = this.y + r * sin(angle);
        vertex(x, y);
      }
      endShape(CLOSE);
    }

    fill(255, 255, 255);
    textSize(26);
    text(this.text, this.x, this.y);
  }

  explode() {
    this.isExploding = true;
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(this.x, this.y, this.col1));
    }
  }
}

//Added parameters x, y, and col to the constructor to initialize the particle's starting position and color. In the move method, added a decrement to the alpha property to simulate the particle's fading effect.

class Particle {
  constructor(x, y, col) {
    this.x = x;
    this.y = y;
    this.size = random(3, 8);
    this.speedX = random(-3, 3);
    this.speedY = random(-3, 3);
    this.alpha = 255;
    this.col = col;
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 5;
  }

  display() {
    if (this.alpha <= 0) return;
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}


let noiseMax = 1;
let phase = 0;
let scaleValue = 1;
let scaleDirection = 1;

let foamOffset = 0;
let movingBubbles = [];
let particles = [];
let displayMessage = "";
let displayMessageColor;
let displayMessageAlpha = 0;
let isMessageDisplayed = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  initializeBubbles();

  let button = createButton('Play/Stop');
  button.position((width - button.width) / 2, height - button.height - 2);
  button.mousePressed(play_pause);
}

function draw() {
  let topColor = color(153, 186, 221);
  let bottomColor = color(102, 153, 204);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColor, bottomColor, inter);
    stroke(c);
    line(0, y, width, y);
  }

  noStroke();
  fill(231, 254, 255, 100);
  let foamXoff = foamOffset;
  for (let x = 0; x < width; x += 10) {
    let foamYoff = 0;
    for (let y = height * 0; y < height; y += 10) {
      let foamSize = map(noise(foamXoff, foamYoff, frameCount * 0.01), 0, 1, 2, 25);
      ellipse(x + noise(foamXoff * 0.01, frameCount * 0.01) * 20, y, foamSize);
      foamYoff += 0.1;
    }
    foamXoff += 0.1;
  }

  for (let bubble of movingBubbles) {
    bubble.isHovered = dist(mouseX, mouseY, bubble.x, bubble.y) < bubble.size / 2;
    bubble.move();
    bubble.display();
  }

  for (let particle of particles) {
    particle.move();
    particle.display();
  }

//Added the global variables displayMessage, displayMessageColor, displayMessageAlpha, and isMessageDisplayed to control the display of messages. 

  if (displayMessage) {
    fill(displayMessageColor);
    textSize(getAdaptiveTextSize(displayMessage));
    text(displayMessage, width / 2, height / 2);
    if (displayMessageAlpha < 255) {
      displayMessageAlpha += 5;
    }
  }
}

//Added the mousePressed function to handle mouse click events. When a bubble is clicked, it explodes and displays the corresponding healing message. 

function mousePressed() {
  if (isMessageDisplayed) {
    isMessageDisplayed = false;
    displayMessage = "";
    initializeBubbles();
  } else {
    for (let bubble of movingBubbles) {
      if (dist(mouseX, mouseY, bubble.x, bubble.y) < bubble.size / 2) {
        bubble.explode();
        displayMessage = getHealingMessage(bubble.text);
        displayMessageColor = color(red(bubble.col1) * 1.2, green(bubble.col1) * 1.2, blue(bubble.col1) * 1.2);
        displayMessageAlpha = 0;
        movingBubbles = [];
        isMessageDisplayed = true;
        break;
      }
    }
  }
}

//Added the initializeBubbles function to initialize all bubbles.

function initializeBubbles() {
  movingBubbles = [];
  movingBubbles.push(new MovingBubble("sad", color(0, 0, 139, 150), color(221, 160, 221, 150)));
  movingBubbles.push(new MovingBubble("love", color(173, 216, 230, 150), color(255, 182, 193, 150)));
  movingBubbles.push(new MovingBubble("joy", color(255, 127, 80, 150), color(255, 223, 0, 150)));
  movingBubbles.push(new MovingBubble("peace", color(173, 216, 230, 150), color(143, 188, 143)));
  movingBubbles.push(new MovingBubble("anxious", color(227, 218, 201, 150), color(145, 129, 81, 150)));
  movingBubbles.push(new MovingBubble("lonely", color(25, 25, 112, 150), color(65, 105, 225, 150)));
  movingBubbles.push(new MovingBubble("helpless", color(192, 192, 192, 150), color(220, 220, 220, 150)));
  movingBubbles.push(new MovingBubble("powerful", color(255, 223, 0, 150), color(255, 37, 0, 150)));
  movingBubbles.push(new MovingBubble("angry", color(16, 12, 8, 150), color(194, 0, 0, 150)));
}

//Added the getHealingMessage function to return the corresponding healing message based on the text content of the bubble.

function getHealingMessage(text) {
  switch (text) {
    case "sad":
      return "It's okay to feel sad sometimes.";
    case "love":
      return "You are loved.";
    case "joy":
      return "Be happy and spread joy.";
    case "peace":
      return "Peace begins with a smile.";
    case "anxious":
      return "Take a deep breath, you got this.";
    case "lonely":
      return "You are never truly alone.";
    case "helpless":
      return "Stay strong, you are capable.";
    case "powerful":
      return "You have the power within you.";
    case "angry":
      return "Take a moment to calm down.";
    default:
      return "";
  }
}

function play_pause() {
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function getAdaptiveTextSize(text) {
  let len = text.length;
  let baseSize = min(width, height) / 10;
  return baseSize / (len / 10);
}

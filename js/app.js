///////- DOM INTERACTION -//////////
////////////////////////////////////

$(() => {
  console.log('version 0.2');
  ///////- START SCREEN -//////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  const header = document.querySelector('header');
  // NOTE: nothing too special, the screen is hidden when the enter key is pressed


  ///////- INSTRUCTION SCREEN -//////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  const instrucScreen = document.querySelector('.game-start');
  const startBtn = document.querySelector('#begin-game');
  const selectObsticals = document.querySelector('#set-obsticals');
  const audio = document.createElement('audio');
  const nextBtn = document.querySelector('.next-instruct');
  const actions = document.querySelector('.actions');
  const instructions = document.querySelector('.instructions');
  const playInstructions = document.querySelector('.play-instructions');
  instrucScreen.appendChild(audio);
  startBtn.addEventListener('click', startGame);
  nextBtn.addEventListener('click', nextInstruction);

  let setObsticalNumber = 0;

  selectObsticals.addEventListener('change', () => {
    setObsticalNumber = parseInt(selectObsticals.options[selectObsticals.selectedIndex].value);
    console.log(setObsticalNumber);
  });

  // to transition from the start screen to the instruction page
  function goToInstruct() {
    header.style.display = 'none';
    instrucScreen.style.display = 'flex';
    playInstructAudio();
  }

  function nextInstruction () {
    nextBtn.style.display = 'none';
    instructions.style.display = 'none';

    playInstructions.style.display = 'flex';
    actions.style.display = 'flex';
  }

  //begin playing game audio clip on repeat
  let instructAudioIntID = null;
  function playInstructAudio(){
    audio.setAttribute('src', 'styles/audio/battle-track-sekater-instruct-repeatplay.mp3');
    audio.play();
    instructAudioIntID = setInterval(() =>{
      audio.play();
    }, 17000);
  }

  ///////- GAME END SCREEN -////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  const endScreen = document.querySelector('.winner');
  const announceEnd = document.querySelector('.winner h2');
  const describeEnd = document.querySelector('.winner h3');
  const resetBtn = document.querySelector('.re-play');

  resetBtn.addEventListener('click', restart);

  function restart() {
    location.reload();
  }

  //when a players health reaches zero
  function gameEndPure(winner, loser){
    endScreen.style.display = 'flex';
    $main.hide();
    announceEnd.innerText = `Victory to ${winner}!!`;
    describeEnd.innerText = `${loser} could not stay composed during the heat of battle!`;
    audio.setAttribute('src', 'styles/audio/celebration-crowd.mp3');
    //audio.play();
  }

  //when player drives into the water!
  function gameEndWater(loser){
    const winner = loser === 'Player 1' ? 'Player 2' : 'Player 1';
    endScreen.style.display = 'flex';
    $main.hide();
    announceEnd.innerText = `GAME OVER FOR ${loser}!!`;
    describeEnd.innerText = `${winner} wins by default! \n  ${loser} drove into WATER! Tanks can't swim, soldier!`;
    audio.setAttribute('src', 'styles/audio/splash.mp3');
    //audio.play();
  }

  ///////- BATTLEFIELD SCREEN -//////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/

  const randomDelay = Math.random()* 10000;

  const obsticalTypes = ['Mountain', 'Water', 'Marsh'];
  const powerUpTypes = ['SpeedUp'];

  ///-- START GAME -- ///

  function startGame(){
    instrucScreen.style.display = 'none';
    $main.css('display', 'flex');
    clearInterval(instructAudioIntID);
    audio.setAttribute('src', 'styles/audio/battle-track-sekater-game-play.mp3');
    audio.play();
    addRandomObstical(obsticalTypes, setObsticalNumber);
    setTimeout(function () {
      powerUps();
    }, randomDelay);
  }

  const $main = $('.battle-screen');
  $main.cssText = 'display: none';

  let gameItems = [];

  const battleFieldObj = {
    width: 900,
    height: 700,

    style: `
      position: relative;
      justify-content: center;
      align-items: center;
      width: 900px;
      height: 700px;
      border-radius: 30px;
      background-image: url('styles/images/terrain-barren-crackedmud.png');
      background-repeat: repeat;
      background-size: cover;`
  };
  // margin: 25px auto 0 auto;

  ///////////////- GAME CONSTRUCTOR -////////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  class gameItem {
    constructor(name, top, left, width, height, type, domElement, movementSpeed, direction) {
      this.name = name;
      this.top = top;
      this.left = left;
      this.type = type;
      this.width = width;
      this.height = height;
      this.domElement = domElement;
      this.movementSpeed = movementSpeed;
      this.direction = direction;

      // Draw the DOM element
      battleField.appendChild(domElement);
      //orientate the dom element by direction
      if(direction){
        domElement.classList.add(direction);
      }

    }

    drawDomElement() {
      $(this.domElement).css('top', this.top);
      $(this.domElement).css('left', this.left);
    }

    remove(){
      $(this.domElement).remove();
    }

    move(direction) {
      const newPosition = {
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height
      };

      const speed = this.movementSpeed;

      switch(direction){
        case 'left':
          newPosition.left -= speed;
          this.direction = 'left';
          break;
        case 'right':
          newPosition.left += speed;
          this.direction = 'right';
          break;
        case 'up':
          newPosition.top -= speed;
          this.direction = 'up';
          break;
        case 'down':
          newPosition.top += speed;
          this.direction = 'down';
          break;
      }

      if(!positionIsOnBoard(newPosition.top, newPosition.left, this.width, this.height)){
        return false;
      }

      const overlappingObjects = objectOverlapsObjects(this, newPosition, gameItems);

      if(overlappingObjects){
        const collidedWith = overlappingObjects[0].object.name;
        const collidingItemType = this.type;

        if(collidedWith === 'Water' && collidingItemType === 'tank'){
          gameEndWater(this.name);

        }else if((collidedWith === 'Water' || collidedWith === 'Marsh' || collidedWith === 'SpeedUp') && collidingItemType === 'bullet'){
          //const nothing = 'do nothing';
        }else if(collidedWith === 'SpeedUp' && collidingItemType === 'tank'){

          console.log('the movement speed was changed to 10 ', this.movementSpeed);
          this.movementSpeed = 30;

          // IDEA: : could add in a timer here to show how long the powerup goes for!
          setTimeout(()=>{
            this.movementSpeed = 10;
          }, 7000);
        }else if(collidedWith === 'Marsh' && collidingItemType === 'tank'){
          const stickFactor = overlappingObjects[0].object.movementSpeed;

          switch(direction){
            case 'left':
              newPosition.left += speed - stickFactor;
              this.direction = 'left';
              break;
            case 'right':
              newPosition.left -= speed - stickFactor;
              this.direction = 'right';
              break;
            case 'up':
              newPosition.top += speed - stickFactor;
              this.direction = 'up';
              break;
            case 'down':
              newPosition.top -= speed - stickFactor;
              this.direction = 'down';
              break;
          }
        }else{
          return overlappingObjects;
        }
      }

      this.left = newPosition.left;
      this.top = newPosition.top;
      this.domElement.setAttribute('class', direction);
      return true;
    }
  }

  ///////////////- BULLET CONSTRUCTOR -////////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  class Bullet extends gameItem {
    constructor (tankPositionTop, tankPositionLeft, direction) {

      const width = 5;
      const height = 5;
      const bulletSpeed = 1;

      const element = document.createElement('div');
      element.classList.add('bullet');

      super(
        'bullet',
        tankPositionTop,
        tankPositionLeft,
        width,
        height,
        'bullet',
        element,
        bulletSpeed,
        direction
      );

      element.style.cssText = `
      margin: 2px;
      box-sizing: border-box;
      border: 1px solid black;
      position: absolute;
      background-color: red;
      top: ${tankPositionTop}px;
      left: ${tankPositionLeft}px;
      width: ${width}px;
      height: ${height}px;
      border-radius: 100%;`;

      // to make an explosion nois when bullet hits home
      this.playExplode = function () {
        const explodeAudio = document.createElement('audio');
        instrucScreen.appendChild(explodeAudio);
        explodeAudio.setAttribute('src', 'styles/audio/grenade-explode.mp3');
        explodeAudio.play();
      };

      this.damage = 5;

      //repeatedly moves a bullet accross the screen
      this.fly = function() {
        //console.log('the shooter at fly is: ', shooter);
        this.move(this.direction);

        setTimeout(() => {
          const moveResult = this.move(this.direction);
          if(!moveResult) {
            this.remove();
            gameItems = gameItems.filter(gameItem => gameItem.object !== this);
            //this.element.style.display = 'none';
          } else if (Array.isArray(moveResult)) {
            this.playExplode();

            if(moveResult[0].object.name === 'Player 1'){
              getPlayer(1).health -= this.damage;
            }else if(moveResult[0].object.name === 'Player 2'){
              getPlayer(2).health -= this.damage;
            }
            this.remove();
            gameItems = gameItems.filter(gameItem => gameItem.object !== this);

            // this.playExplode();
            // setTimeout(()=>{
            // }, 1400);
          }else{
            this.fly();
          }
        }, 1.0 / 30.0);
      };
    }
  }

  /////////////////- TANK CONSTRUCTOR -//////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  class Tank extends gameItem{
    constructor (startTop, startLeft, identity, colour, direction) {
      const width = 60;
      const height = 60;
      const name = identity;

      const element = document.createElement('div');
      element.id = 'tank';

      element.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      background-image: url('styles/images/TopDown_soldier_tank_body.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      border: 1px solid ${colour};
      position: absolute;
      top: ${startTop}px;
      left: ${startLeft}px;
      width: ${width}px;
      height: ${height}px;
      z-index: 1;`;

      const imageStyle = 'style="position: relative; width: 101px; height: 25px; z-index: 1; padding-right: 20px;"';

      element.innerHTML = `<img ${imageStyle} src="styles/images/TopDown_soldier_tank_turrent.png">`;

      const movementPoints = 10;

      super(name, startTop, startLeft, width, height, 'tank', element, movementPoints, direction);

      this.playFire = function () {
        const fireAudio = document.createElement('audio');
        element.appendChild(fireAudio);
        fireAudio.setAttribute('src', 'styles/audio/tank-firing.mp3');
        fireAudio.play();
      };

      this.health = 100;

      this.movingSpeed = 70;

      ////////- firing bullets -////////////
      this.addBullet = function (){
        const top = this.bulletStart(this.top, this.left, this.direction)[0];
        const left = this.bulletStart(this.top, this.left, this.direction)[1];

        const bullet = new Bullet(top, left, this.direction);
        gameItems.push({name: 'bullet', object: bullet, type: 'bullet'});
        this.playFire();
        bullet.fly(this.name);
      };

      this.bulletStart = function(top, left, direction){
        switch(direction){
          case 'right':
            return [top + 27, left + 82];
          case 'left':
            return [top + 28, left - 30];
          case 'up':
            return [top - 28, left + 27];
          case 'down':
            return [top + 83, left + 27];
        }
      };
    }
  }

  ///////////////- OBSTICAL CONSTRUCTORS -////////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  class Mountain extends gameItem {
    constructor (startTop, startLeft) {
      const name = 'Mountain';
      const width = 100;
      const height = 100;

      const element = document.createElement('div');
      element.classList.add('.fade-in');

      element.style.cssText = `
      position: absolute;
      top: ${startTop}px;
      left: ${startLeft}px;
      width: ${width}px;
      height: ${height}px;
      background-image: url('styles/images/terrain-mountain.jpg');
      background-repeat: repeat;
      background-size: cover;
      border-radius: 100%;`;

      super(name, startTop, startLeft, width, height, 'obstical', element, 0, 0);
    }
  }

  class Water extends gameItem {
    constructor (startTop, startLeft) {
      const name = 'Water';
      const width = 100;
      const height = 100;
      const waterRadius = Math.random() * 100;

      const element = document.createElement('div');
      element.classList.add('.fade-in');

      element.style.cssText = `
      position: absolute;
      top: ${startTop}px;
      left: ${startLeft}px;
      width: ${width}px;
      height: ${height}px;
      border-radius: ${waterRadius}%;
      background-image: url('styles/images/terrain-water-3.jpg');
      background-repeat: repeat;
      background-size: cover;`;

      super(name, startTop, startLeft, width, height, 'obstical', element, 0, 0);
    }
  }

  class Marsh extends gameItem {
    constructor (startTop, startLeft) {
      const name = 'Marsh';
      const width = 100;
      const height = 100;
      const stickFactor = 4;

      const element = document.createElement('div');
      element.classList.add('.fade-in');

      element.style.cssText = `
      position: absolute;
      top: ${startTop}px;
      left: ${startLeft}px;
      width: ${width}px;
      height: ${height}px;
      background-image: url('styles/images/terrain-wetland.jpg');
      background-repeat: repeat;
      background-size: cover;`;

      super(name, startTop, startLeft, width, height, 'obstical', element, stickFactor, 0);
    }
  }

  ///////////////- POWER-UP CONSTRUCTORS -////////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  class SpeedUp extends gameItem {
    constructor (startTop, startLeft) {
      const name = 'SpeedUp';
      const width = 50;
      const height = 50;
      const speedUp = 4;

      const element = document.createElement('div');
      element.classList.add('.fade-in');

      element.style.cssText = `
      position: absolute;
      top: ${startTop}px;
      left: ${startLeft}px;
      width: ${width}px;
      height: ${height}px;
      border-radius: 100%;
      background-image: url('styles/images/powerup-speed-burning-tyre.jpg');
      background-repeat: repeat;
      background-position: center;
      background-size: cover;`;

      super(name, startTop, startLeft, width, height, 'powerup', element, speedUp, 0);

      this.removeMe = function() {
        setTimeout(() => {
          this.remove();
          gameItems = gameItems.filter(gameItem => gameItem.object !== this);
        }, 5000);
      };
    }
  }

  ///////- GLOBAL GAME CONTROL -//////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/

  ///////- Add battlefield and obsticals-////////////

  const battleField = document.createElement('div');
  battleField.classList.add('battle-field');
  battleField.style.cssText = battleFieldObj.style;
  $main.append(battleField);

  // add board items
  gameItems.push({
    name: 'Player 1',
    object: new Tank(0, 0, 'Player 1', 'blue', 'right'),
    type: 'tank'
  });
  gameItems.push({
    name: 'Player 2',
    object: new Tank(battleFieldObj.height - 60, battleFieldObj.width - 60,
      'Player 2', 'red', 'left'),
    type: 'tank'
  });

  function getPlayer(number) {
    return gameItems.filter(item => item.name === `Player ${number}`)[0].object;
  }

  function getType(type) {
    return gameItems.filter(item => item.type === type)[0].object;
  }


  function addRandomObstical(addInArray, number) {
    //const obsticalTypes = ['SpeedUp'];
    console.log('Value selected on instruc page: ' + number);
    for( let i = 0; i < number; i++ ){
      const randomObsticalIndex = Math.floor(Math.random() * addInArray.length);
      const randomObstical = addInArray[randomObsticalIndex];
      let randomTop = Math.floor(Math.random() * battleFieldObj.height);
      let randomLeft = Math.floor(Math.random() * battleFieldObj.width);

      //top and bottom must be > 0 and less than width/height -100
      if(randomTop < 0 ) randomTop += 101;
      if(randomLeft < 0 ) randomLeft += 101;
      if(randomTop > (battleFieldObj.height - 100)) randomTop -= 101;
      if(randomLeft > (battleFieldObj.width - 100)) randomLeft -= 101;

      let object = null;

      switch(randomObstical){
        case 'Mountain':
          object = new Mountain(randomTop, randomLeft);
          break;
        case 'Water':
          object = new Water(randomTop, randomLeft);
          break;
        case 'Marsh':
          object = new Marsh(randomTop, randomLeft);
          break;
        case 'SpeedUp':
          object = new SpeedUp(randomTop, randomLeft);
          break;
      }

      gameItems.push({
        name: randomObstical,
        object: object,
        type: randomObstical === 'SpeedUp' ? 'powerup' : 'obstical'
      });
    }
    //console.log(gameItems);
  }

  // to move the powerup around the page
  function powerUps(){
    addRandomObstical(powerUpTypes, 1);
    getType('powerup').removeMe();
    setTimeout(()=>{
      powerUps();
    }, 5000);
  }

  function updateScore(){
    const $playerOneHealth = $('#playerOneHealth');
    const $playerTwoHealth = $('#playerTwoHealth');

    $playerOneHealth.css('width', `${getPlayer(1).health}%`);
    $playerTwoHealth.css('width', `${getPlayer(2).health}%`);
  }

  function checkForWin () {
    if (getPlayer(1).health === 0){
      gameEndPure(getPlayer(2).name, getPlayer(1).name);
    }
    if (getPlayer(2).health === 0){
      gameEndPure(getPlayer(1).name, getPlayer(2).name);
    }
  }

  function updateDOM() {
    //console.log(gameItems);
    for (let i = 0; i < gameItems.length; i++) {
      gameItems[i].object.drawDomElement();
    }
    updateScore();
    checkForWin();
  }
  setInterval(() => updateDOM(), 1.0 / 30.0);

  //////- CHECKS FOR COLLISION -////////
  // Gives either an array of overlapping objects
  // or false if there are none.
  function objectOverlapsObjects(object, objNewPos, objectArray) {
    const overlapping = [];
    for (let i = 0; i < objectArray.length; i++) {
      // We don't check ourselves!
      if(object !== objectArray[i].object) {
        //console.log('removed itself from test: ' + object !== objectArray[i].object);
        // Do the positions overlap?
        if (positionsOverlap(objNewPos, objectArray[i].object)) {
          //console.log('check position overlap: ', object);
          overlapping.push(objectArray[i]);
        }
      }
    }
    if (overlapping.length) {
      return overlapping;
    } else {
      return false;
    }
  }

  function positionsOverlap(obj1, obj2) {
    const obj1right = obj1.left + obj1.width;
    const obj1bottom = obj1.top + obj1.height;
    const obj2right = obj2.left + obj2.width;
    const obj2bottom = obj2.top + obj2.height;

    const result = ((obj1right > obj2.left) && (obj1.left < obj2right)) &&
    ((obj1.top < obj2bottom) && (obj1bottom > obj2.top));
    //console.log('positions do overlap: ' + result);
    return result;
  }

  function positionIsOnBoard(top, left, width, height){
    const boardHeight = battleFieldObj.height;
    const boardWidth = battleFieldObj.width;

    return (top >= 0) && (left >= 0) &&
      ((top + height) <= boardHeight) && ((left + width) <= boardWidth);
  }

  //////////////////- KEY PRESS CONTROLL -//////////////////////
  // \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/
  //to determine what key has been pressed and assign correct function

  // BUG: appears to be a bug with the player 2 movement [SOLVED]
  //which causes the players tank to glitch and move on its own
  const keyState = {
    arrowdown: false,
    arrowup: false,
    arrowleft: false,
    arrowright: false,
    s: false,
    w: false,
    a: false,
    d: false
  };

  //start the element moving on key down
  function keyDownIdentifier(e){
    const key = e.originalEvent.key.toLowerCase();
    console.log('key down is: ' + key);
    if(!keyState[key]){
      switch(key) {
        case 'arrowdown':
          keyState[key] = true;
          moveDownA('down');
          break;
        case 'arrowup':
          keyState[key] = true;
          moveUpA('up');
          break;
        case 'arrowleft':
          keyState[key] = true;
          moveLeftA('left');
          break;
        case 'arrowright':
          keyState[key] = true;
          moveRightA('right');
          break;
        case 'w':
          keyState[key] = true;
          moveUpK('up');
          break;
        case 's':
          keyState[key] = true;
          moveDownK('down');
          break;
        case 'd':
          keyState[key] = true;
          moveRightK('right');
          break;
        case 'a':
          keyState[key] = true;
          moveLeftK('left');
          break;
        case ' ':
          getPlayer(2).addBullet();
          break;
        case 'shift':
          getPlayer(1).addBullet();
          break;
        case 'enter':
          goToInstruct();
          break;
      }
    }

  }

  let downIntId = '';
  let upIntId = '';
  let leftIntId = '';
  let rightIntId = '';
  let sIntId = '';
  let wIntId = '';
  let aIntId = '';
  let dIntId = '';

  const playerOneSpeed = getPlayer(1).movingSpeed;
  const playerTwoSpeed = getPlayer(2).movingSpeed;

  function moveDownA (direction){
    downIntId = setInterval(()=>{
      getPlayer(2).move(direction);
    }, playerTwoSpeed);
  }
  function moveUpA (direction){
    upIntId = setInterval(()=>{
      getPlayer(2).move(direction);
    }, playerTwoSpeed);
  }
  function moveLeftA (direction){
    leftIntId = setInterval(()=>{
      getPlayer(2).move(direction);
    }, playerTwoSpeed);
  }
  function moveRightA (direction){
    rightIntId = setInterval(()=>{
      getPlayer(2).move(direction);
    }, playerTwoSpeed);
  }
  function moveDownK (direction){
    sIntId = setInterval(()=>{
      getPlayer(1).move(direction);
    }, playerOneSpeed);
  }
  function moveUpK (direction){
    wIntId = setInterval(()=>{
      getPlayer(1).move(direction);
    }, playerOneSpeed);
  }
  function moveLeftK (direction){
    aIntId = setInterval(()=>{
      getPlayer(1).move(direction);
    }, playerOneSpeed);
  }
  function moveRightK (direction){
    dIntId = setInterval(()=>{
      getPlayer(1).move(direction);
    }, playerOneSpeed);
  }

  //clear the key down interval on key up
  function keyUpIdentifier(e) {
    const key = e.originalEvent.key.toLowerCase();
    console.log('key up is: ' + key);
    switch(key) {
      case 'arrowdown':
        clearInterval(downIntId);
        keyState[key] = false;
        break;
      case 'arrowup':
        clearInterval(upIntId);
        keyState[key] = false;
        break;
      case 'arrowleft':
        clearInterval(leftIntId);
        keyState[key] = false;
        break;
      case 'arrowright':
        clearInterval(rightIntId);
        keyState[key] = false;
        break;
      case 's':
        clearInterval(sIntId);
        keyState[key] = false;
        break;
      case 'w':
        clearInterval(wIntId);
        keyState[key] = false;
        break;
      case 'a':
        clearInterval(aIntId);
        keyState[key] = false;
        break;
      case 'd':
        clearInterval(dIntId);
        keyState[key] = false;
        break;
    }
  }


  $('body').on('keydown', keyDownIdentifier);
  $('body').on('keyup', keyUpIdentifier);
});

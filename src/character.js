/*
 *  character.js
 *  2016/12/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define('Character', {
  superClass: 'phina.display.DisplayElement',
  init: function(type) {
    this.superInit();
    this.setOrigin(0, 0);

    this.type = type;
    this.sprite = phina.display.Sprite("player", 24, 32)
      .setPosition(16, 10)
      .addChildTo(this);

    this.sprite.setFrameTrimming((type%4)*72, Math.floor(type/4)*128, 72, 128);
    this.direction = 180;

    this.frame = [];
    this.frame[0]   = [0, 1, 2, 1];
    this.frame[90]  = [3, 4, 5, 4];
    this.frame[180] = [6, 7, 8, 7];
    this.frame[270] = [9, 10, 11, 10];

    this.index = 0;
    this.sprite.frameIndex = 25;
    this.moving = false;
    this.move = false;
    this.moveWaitCount = 30;
    this.wait = false;

    this.tweener.clear().setUpdateType('fps');
    this.time = 0;
  },

  update: function(e) {
    if (e.ticker.frame % 15 == 0) {
      this.index = (this.index+1)%4;
      this.sprite.frameIndex = this.frame[this.direction][this.index];
    }

    //うろうろ動く
    if (!this.wait && this.move && this.moveWaitCount == 0) {
      this.moveWaitCount = Math.randint(90, 120);
      var dir = Math.randint(0, 4)*90;
      var rad = dir.toRadian();
      var ax = Math.sin(rad)*32;
      var ay = Math.cos(rad)*-32;
      if (!this.parentScene.mapCollision(this.x+ax, this.y+ay)) this.tweener.clear().by({x: ax, y: ay}, 30);
      this.setDirection(dir);
    }

    this.moveWaitCount--;
    this.time++;
  },

  setDirection: function(dir) {
    dir = dir % 360 || 0;
    this.direction = dir;
  },
});

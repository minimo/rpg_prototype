/*
 *  mainscene.js
 *  2016/12/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define('MainScene', {
  superClass: 'phina.display.DisplayScene',
  init: function() {
    this.superInit({width:SC_W, height: SC_H});

    //マップ表示用ベース
    this.mapOffsetX = -16;
    this.mapOffsetY = -16;
    this.mapBase = phina.display.DisplayElement().setPosition(this.mapOffsetX, this.mapOffsetY).addChildTo(this);

    //.tmxファイルからマップをイメージとして取得し、スプライトで表示
    this.tmx = phina.asset.AssetManager.get("tmx", "map");
    this.map = phina.display.Sprite(this.tmx.image)
      .setOrigin(0, 0)
      .setPosition(0, 0)
      .addChildTo(this.mapBase);
    this.map.tweener.clear().setUpdateType('fps');

    //オブジェクトグループの取得
    this.npc = this.tmx.getObjectGroup("NPCGroup");
    this.addNPC();

    //マップデータから'Collision'レイヤーを取得
    this.collision = this.tmx.getMapData("collision");

    //プレイヤー用キャラクタ
    this.player = Character(0).setPosition(160, 160).addChildTo(this.map);

    this.moving = false;
    this.textWait = false;
    this.talkingChr = null;
    this.tweener.clear().setUpdateType('fps');

    //メッセージウィンドウ
    var that = this;
    this.messageWindow = phina.display.RectangleShape({
      cornerRadius: 10,
      width: SC_W*0.9,
      height:SC_H*0.3,
      strokeWidth: 5,
      stroke: 'white',
      fill: 'black',
    }).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
    this.messageWindow.update = function() {
      if (that.labelArea.text == "") this.visible = false;
      else this.visible = true;
    }
    this.labelArea = phina.ui.LabelArea({
      text: "",
      width: SC_W*0.9-10,
      height: SC_H*0.3-10,
      fill: 'white',
      fontSize: 15,
    }).addChildTo(this.messageWindow).setPosition(5, 5);
  },

  update: function() {
    var spd = 20;
    var kb = app.keyboard;
    if (!this.moving && !this.textWait) {
      var mx = -this.map.x;
      var my = -this.map.y;
      if (kb.getKey("up")) {
        this.player.setDirection(0);
        if (this.player.y > 0 && !this.mapCollision(this.player.x, this.player.y-32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: -32}, spd);
          if (0 < my && this.player.y < this.map.height-SC_H/2+32) this.map.tweener.clear().by({y: 32}, spd);
        }
      }
      if (kb.getKey("down")) {
        this.player.setDirection(180);
        if (this.player.y < this.map.height-32 && !this.mapCollision(this.player.x, this.player.y+32)) {
          this.moving = true;
          this.player.tweener.clear().by({y: 32}, spd);
          if (my < this.map.height && this.player.y > 128 && this.player.y < this.map.height-SC_H/2+this.mapOffsetX*2) this.map.tweener.clear().by({y: -32}, spd);
        }
      }
      if (kb.getKey("left")) {
        this.player.setDirection(270);
        if (this.player.x > 0 && !this.mapCollision(this.player.x-32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: -32}, spd);
          if (0 < mx && this.player.x < this.map.width-SC_W/2+32) this.map.tweener.clear().by({x: 32}, spd);
        }
      }
      if (kb.getKey("right")) {
        this.player.setDirection(90);
        if (this.player.x < this.map.width-32 && !this.mapCollision(this.player.x+32, this.player.y)) {
          this.moving = true;
          this.player.tweener.clear().by({x: 32}, spd);
         if (mx < this.map.width && this.player.x > 128 && this.player.x < this.map.width-SC_W/2+this.mapOffsetY*2) this.map.tweener.clear().by({x: -32}, spd);
        }
      }
      if (kb.getKey("z")) {
        if (!this.moving && !this.textWait) {
          var rad = this.player.direction.toRadian();
          var ax = this.player.x + Math.sin(rad)*32
          var ay = this.player.y + Math.cos(rad)*-32;
          var chr = this.checkMap(ax, ay);
          if (chr && chr.data.properties.talk1) {
            this.moving = true;
            this.textWait = true;
            this.labelArea.text = chr.data.properties.talk1;
            if (chr.data.properties.talk2) {
              this.labelArea.text += "\n"+chr.data.properties.talk2;
            }
            chr.setDirection((this.player.direction+180)%360);
            chr.wait = true;
            this.talkingChr = chr;
          }
        }
      }

      if (this.moving) {
        this.tweener.clear().wait(spd).call(function(){this.moving = false;}.bind(this));
      }
    }

    //メッセージ表示待機の解除
    if (!this.moving && this.textWait) {
      if (kb.getKey("z")) {
        this.moving = true;
        this.textWait = false;
        this.labelArea.text = "";
        this.talkingChr.wait = false;
        this.talkingChr.moveWaitCount = 60;
        this.talkingChr = null;
        this.tweener.clear().wait(spd).call(function(){this.moving = false;}.bind(this));
      }
    }
  },

  //マップ衝突判定
  mapCollision: function(x, y) {
    var mapx = Math.floor(x / 32);
    var mapy = Math.floor(y / 32);

    //指定座標にマップチップがあると真を返す
    var chip = this.collision[mapy * this.tmx.width + mapx];
    if (chip !== -1) return true;

    //マップ上キャラクタとの衝突判定
    var children = this.map.children;
    for (var i = 0; i < children.length; i++) {
      var chr = children[i];
      if (x == chr.x && y == chr.y) return true;
    }

    return false;
  },

  //NPC存在チェック
  checkMap: function(x, y) {
    var children = this.map.children;
    for (var i = 0; i < children.length; i++) {
      var chr = children[i];
      if (x == chr.x && y == chr.y) return chr;
    }
  },

  //Non Player Characterをマップに追加
  addNPC: function() {
    for(var i = 0; i < this.npc.objects.length; i++) {
      var npc = this.npc.objects[i];
      var chr = Character(npc.properties.chrtype)
        .setPosition(npc.x, npc.y)
        .addChildTo(this.map);
        chr.data = npc;
        chr.move = chr.data.properties.move == "true"? true: false;
        chr.parentScene = this;
    }
  },
});


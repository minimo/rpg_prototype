/*

  Tiledmapサンプル

*/

var SC_W = 320;
var SC_H = 320;

var ASSETS = {
  image: {
    "player": "assets/chara01_a1.png",
  },
  //LoadingSceneで読み込む場合の設定
  tmx: {
    "map": "assets/map.tmx",
  }
};

phina.define("SceneFlow", {
  superClass: "phina.game.ManagerScene",

  init: function() {
    this.superInit({
      startLabel: "load",
      scenes: [{
        label: "load",
        className: "phina.game.LoadingScene",
        arguments: {
          assets: ASSETS,
        },
        nextLabel: "main",
      },{
        label: "main",
        className: "MainScene",
      }],
    });
  }
});

phina.main(function() {
  app = phina.game.GameApp({
    width: SC_W,
    height: SC_H,
    backgroundColor: "#ccc",
  });
  app.fps = 60;
  app.enableStats();

  app.replaceScene(SceneFlow());

  app.run();
});

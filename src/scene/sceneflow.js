/*
 *  sceneflow.js
 *  2016/12/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

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

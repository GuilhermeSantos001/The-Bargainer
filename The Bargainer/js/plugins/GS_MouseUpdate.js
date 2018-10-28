/*:
* @plugindesc Atualiza a data do mouse
*             
* @author GuilhermeSantos
* 
*/
(function () {
    "use strict";
    let mouseX = 0,
        mouseY = 0,
        mouseTileX = 0,
        mouseTileY = 0,
        sceneMap_start = Scene_Map.prototype.start;

    Object.defineProperties(Game_Map.prototype, {
        _mouseX: { get: function () { return mouseX; }, configurable: true },
        _mouseY: { get: function () { return mouseY; }, configurable: true },
        _mouseTileX: { get: function () { return mouseTileX; }, configurable: true },
        _mouseTileY: { get: function () { return mouseTileY; }, configurable: true }
    });

    Scene_Map.prototype.start = function () {
        sceneMap_start.call(this);
        mouseTileX = $gamePlayer.x;
        mouseTileY = $gamePlayer.y;
    };

    function _onMouseMove(event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        var tileX = x;
        var tileY = y;
        if ($gameMap !== undefined && $gameMap !== null && $dataMap !== undefined && $dataMap !== null) {
            tileX = $gameMap.canvasToMapX(x);
            tileY = $gameMap.canvasToMapY(y);
        }
        mouseX = x;
        mouseY = y;
        mouseTileX = tileX;
        mouseTileY = tileY;
    };
    document.addEventListener('mousemove', _onMouseMove.bind(this));
})();
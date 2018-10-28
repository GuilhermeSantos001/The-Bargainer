//=============================================================================
// OuterSelfSwitch.js
//=============================================================================

/*:
 * @plugindesc Changes a self switch for other events.
 * @author Yoji Ojima
 *
 * @help
 *
 * Script:
 * $gameSystem.changeSelfSwitch(mapId, target, character, value);
 * 
 * $gameSystem.changeSelfSwitch(1, 2, 'A', 'on');
 * 
 * Plugin Command:
 *   OuterSelfSwitch on 3 A     # Turns on the switch A for the event #3
 *   OuterSelfSwitch on 4 B     # Turns on the switch B for the event #4
 *   OuterSelfSwitch off 5 C    # Turns off the switch C for the event #5
 *   OuterSelfSwitch off 6 D    # Turns off the switch D for the event #6
 *   OuterSelfSwitch off all A  # Turns off the switch A for all the events
 */

(function () {

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'OuterSelfSwitch') {
            var operation = args[0];
            if (operation === 'on' || operation === 'off') {
                var target = args[1];
                var character = String(args[2]);
                var value = (operation === 'on');
                changeSelfSwitch(this._mapId, target, character, value);
            }
        }
    };

    Game_System.prototype.changeSelfSwitch = function (mapId, target, character, value) {
        changeSelfSwitch(mapId, target, character, value);
    };

    function changeSelfSwitch(mapId, target, character, value) {
        if (character.match(/^[A-D]$/)) {
            if (target === 'all') {
                for (var i = 1; i < $dataMap.events.length; i++) {
                    changeSelfSwitch(mapId, i, character, value);
                }
            } else {
                var eventId = Number(target);
                if (eventId > 0) {
                    var key = [mapId, eventId, character];
                    $gameSelfSwitches.setValue(key, value);
                }
            }
        }
    }

})();

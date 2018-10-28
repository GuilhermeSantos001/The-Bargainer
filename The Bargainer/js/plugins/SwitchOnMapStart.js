//=============================================================================
// SwitchOnMapStart.js
//=============================================================================

/*:
 * @plugindesc Ativa um Switch quando o mapa é iniciado
 * @author GuilhermeSantos
 *
 * @param Switch ID
 * @desc O id do switch para ser ativado
 * @default 1
 * @type number
 * @min 1
 * @max 2000
 *
 * @help Este plugin não fornece comandos de plugin.
 */

(function () {

    var parameters = PluginManager.parameters('SwitchOnMapStart');
    var switchId = Number(parameters['Switch ID']) || 0;

    var _scene_map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _scene_map_start.call(this);
        $gameSwitches.setValue(switchId, true);
    };

})();

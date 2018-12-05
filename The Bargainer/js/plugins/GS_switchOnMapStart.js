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
 * @param Switch One Started
 * @desc O switch deve ser iniciado só uma vez?
 * @type boolean
 * @on Sim
 * @off Não
 * @default true
 *
 * @help Este plugin não fornece comandos de plugin.
 */

(function () {
    var parameters = PluginManager.parameters('GS_switchOnMapStart');
    var switchId = Number(parameters['Switch ID']) || 0;
    var switchOneStarted = [
        JSON.parse(parameters['Switch One Started']) || true,
        false
    ];
    var _scene_map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _scene_map_start.call(this);
        if (switchOneStarted[0]) {
            if (!switchOneStarted[1]) {
                $gameSwitches.setValue(switchId, true);
                switchOneStarted[1] = true;
            }
        } else { $gameSwitches.setValue(switchId, true); }
    };
})();

//==================================================================================================
// GS_dailyMissions.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Aciona as missões diárias
 *
 * @author GuilhermeSantos
 *
 */
(function () {
    "use strict";
    /**
     * Variaveis Globais
     */
    let missionsId = [],
        missionsStatus = {};

    /**
     * FUNÇÕES
     */
    function localPath(p) {
        if (p.substring(0, 1) === '/')
            p = p.substring(1);
        var path = require('path'),
            base = path.dirname(process.mainModule.filename);
        return path.join(base, p);
    };

    function saveData() {
        let obj = {
            missionsId: missionsId,
            missionsStatus: missionsStatus
        },
            fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_2.data');
        if (fs.existsSync(pathFolder)) {
            fs.writeFileSync(pathFile, LZString.compressToBase64(JSON.stringify(obj)), 'utf8');
        }
    };

    function loadData() {
        let fs = require('fs'),
            pathFolder = localPath('save'),
            pathFile = localPath('save/data_2.data');
        if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
            return JSON.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
        }
        return null;
    };

    /**
     * Game_Interpreter
     */
    const _game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _game_interpreter_pluginCommand.apply(this, arguments);
        command = String(command).toLowerCase();
        if (command === 'dailymission') {
            args[0] = String(args[0]).toLowerCase();
            if (args[0] === 'add') {
                let questId = Number(args[1]);
                if (missionsId.filter(missionId => {
                    if (missionId === questId) return true;
                }).length <= 0) {
                    _game_interpreter_pluginCommand.call(this, 'Quest', ['Add', questId]);
                    missionsId.push(questId);
                    missionsStatus[questId] = {
                        dayMonth: $gameVariables.value(10),
                        status: 'incomplete'
                    };
                }
            } else if (args[0] === 'complete') {
                let questId = Number(args[1]);
                missionsId.map(missionId => {
                    if (missionId === questId) {
                        if (missionsStatus[questId]['status'] === 'incomplete') {
                            _game_interpreter_pluginCommand.call(this, 'Quest', ['Set', 'Completed', questId]);
                            missionsStatus[questId]['status'] = 'complete';
                        }
                    }
                });
            }
        }
    };

    /**
     * Game_System
     */
    const _game_map_onBeforeSave = Game_System.prototype.onBeforeSave;
    Game_System.prototype.onBeforeSave = function () {
        _game_map_onBeforeSave.call(this);
        saveData();
    };

    const _game_map_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function () {
        _game_map_onAfterLoad.call(this);
        let obj = loadData();
        if (obj) {
            missionsId = obj.missionsId;
            missionsStatus = obj.missionsStatus;
        }
    };

    /**
     * Game_Map
     */
    const _game_map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function (sceneActive) {
        _game_map_update.apply(this, arguments);
        if (sceneActive) {
            this.updateDailyMissions();
        }
    };

    Game_Map.prototype.updateDailyMissions = function () {
        missionsId.map(questId => {
            if (missionsStatus[questId] && missionsStatus[questId]['status'] === 'complete') {
                if (missionsStatus[questId]['dayMonth'] < $gameVariables.value(10)) {
                    this._interpreter.pluginCommand('Quest', ['Set', 'Available', questId]);
                    missionsStatus[questId]['status'] = 'incomplete';
                    missionsStatus[questId]['dayMonth'] = $gameVariables.value(10);
                    saveData();
                }
            }
        });
    };
})();
//==================================================================================================
//GS_skillCore.js
//==================================================================================================
/*:
 * @plugindesc v1.00 - Controla as habilidades do jogo
 * @author GuilhermeSantos
*/
(function () {
  "use strict";
  /**
   * Variaveis
   */
  let skillLevels = {};

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

  function saveData(data, path) {
    let fs = require('fs'),
      pathFolder = localPath('save'),
      pathFile = localPath('save/data_8.data');
    if (path) pathFile = localPath(`save/${path}.data`);
    if (fs.existsSync(pathFolder)) {
      fs.writeFileSync(pathFile, LZString.compressToBase64(JsonEx.stringify(data)), 'utf8');
    }
  };

  function loadData(path) {
    let fs = require('fs'),
      pathFolder = localPath('save'),
      pathFile = localPath('save/data_8.data');
    if (path) pathFile = localPath(`save/${path}.data`);
    if (fs.existsSync(pathFolder) && fs.existsSync(pathFile)) {
      return JsonEx.parse(LZString.decompressFromBase64(fs.readFileSync(pathFile, 'utf8')));
    }
    return null;
  };

  //-----------------------------------------------------------------------------
  // Graphics
  //
  const _graphics_createGameFontLoader = Graphics._createGameFontLoader;
  Graphics._createGameFontLoader = function () {
    _graphics_createGameFontLoader.call(this);
    this._createFontLoader("GameFont2");
  };

  //-----------------------------------------------------------------------------
  // Scene_Boot
  //
  Game_Actor.prototype.skill = function (skillId) {
    return skillLevels[skillId];
  };

  //-----------------------------------------------------------------------------
  // Scene_Boot
  //
  const _scene_boot = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _scene_boot.call(this);
    this.loadSystemSkillCore();
  };

  Scene_Boot.prototype.loadSystemSkillCore = function () {
    this.loadSystemLevelsSkills();
  };

  Scene_Boot.prototype.loadSystemLevelsSkills = function () {
    let dataSkills = loadData();
    $dataSkills.map(skill => {
      if (skill) {
        let level = Number(skill.meta["Skill Level"]) || 1,
          levelMax = Number(skill.meta["Skill Max Level"]) || 100,
          scoreBonus = [],
          fameBonus = [],
          scoreDivider = Number((20 * levelMax) / 100),
          fameDivider = Number((20 * scoreDivider) / 100),
          iconIndex = Number(skill.meta["Skill IconIndex"]) || 16,
          levelName = {},
          help = [];
        if (
          String(skill.meta["Skill Score Bonus"]).replace(/\s{1,}/g, "") != "undefined"
        )
          scoreBonus = eval(String(skill.meta["Skill Score Bonus"]));
        if (
          String(skill.meta["Skill Fame Bonus"]).replace(/\s{1,}/g, "") != "undefined"
        )
          fameBonus = eval(String(skill.meta["Skill Fame Bonus"]));
        if (
          String(skill.meta["Skill Help"]).replace(/\s{1,}/g, "") != "undefined"
        )
          help = eval(String(skill.meta["Skill Help"]));
        if (
          String(skill.meta["Skill Level Name"]).replace(/\s{1,}/g, "") != "undefined"
        )
          levelName = eval(String(skill.meta["Skill Level Name"]));
        skillLevels[skill.id] = {
          level: level,
          levelName: levelName,
          iconIndex: iconIndex,
          levelMax: levelMax,
          range: 0,
          levelRange() {
            if (level >= levelMax) return this.levelMaxRange();
            return this.range;
          },
          levelRangeFormat(range) {
            let level = this.level * .6,
              levelMax = this.levelMax * .8;
            return Math.floor(range + (levelMax * level));
          },
          levelMaxRange() {
            let level = (this.level * .6) * this.level,
              levelMax = (this.levelMax * .8) * this.levelMax;
            return Math.ceil(level * levelMax + (this.level * (this.levelMax / .2)) * (1000 + level + levelMax));
          },
          scoreBonus: scoreBonus,
          fameBonus: fameBonus,
          scoreDivider: scoreDivider,
          fameDivider: fameDivider,
          help: help
        };
        if (dataSkills) {
          if (dataSkills[skill.id].range != undefined)
            skillLevels[skill.id].range = dataSkills[skill.id].range;
          if (dataSkills[skill.id].level != undefined)
            skillLevels[skill.id].level = dataSkills[skill.id].level;
        }
      }
    });
  };

  //-----------------------------------------------------------------------------
  // Game_Temp
  //
  Game_Temp.prototype.addRangeSkill = function (id, range) {
    if (skillLevels[id].levelRangeFormat(range) >= skillLevels[id].levelMaxRange()) {
      addlevel();
    } else {
      addrange();
    }
    function addlevel() {
      if (skillLevels[id].level < skillLevels[id].levelMax) {
        $gameParty.gainRangeSkill($dataSkills[id].name, (() => {
          let name = "\\tx[2016]";
          skillLevels[id].levelName.map(levelName => {
            if (levelName.level === skillLevels[id].level)
              return (name =
                levelName.text[$gameSystem.getterLanguageSystem()]);
          });
          return name;
        })(), skillLevels[id].iconIndex, (() => {
          let name = "\\tx[2016]";
          skillLevels[id].levelName.map(levelName => {
            if (levelName.level === skillLevels[id].level + 1)
              return (name =
                levelName.text[$gameSystem.getterLanguageSystem()]);
          });
          return name;
        })(), `Subiu para `);
        skillLevels[id].level++;
        skillLevels[id].range = 0;
        saveData(skillLevels);
      }
    }
    function addrange() {
      skillLevels[id].range += skillLevels[id].levelRangeFormat(range);
      if (skillLevels[id].levelRange(range) >= skillLevels[id].levelMaxRange()) {
        addlevel();
      } else {
        $gameParty.gainRangeSkill($dataSkills[id].name, (() => {
          let name = "\\tx[2016]";
          skillLevels[id].levelName.map(levelName => {
            if (levelName.level === skillLevels[id].level)
              return (name =
                levelName.text[$gameSystem.getterLanguageSystem()]);
          });
          return name;
        })(), skillLevels[id].iconIndex, skillLevels[id].levelRangeFormat(range) + ` de Exp. Total ${skillLevels[id].range}`, `+`);
        saveData(skillLevels);
      }
    }
  };

  //-----------------------------------------------------------------------------
  // Scene_Skill
  //
  const _scene_skill_create = Scene_Skill.prototype.create;
  Scene_Skill.prototype.create = function () {
    _scene_skill_create.call(this);
    this.createSkillStaus();
  };

  Scene_Skill.prototype.createSkillStaus = function () {
    this._skillStatusEx = new Window_SkillStatusEx();
    this.addWindow(this._skillStatusEx);
  };

  const _scene_skill_onItemCancel = Scene_Skill.prototype.onItemCancel;
  Scene_Skill.prototype.onItemCancel = function () {
    _scene_skill_onItemCancel.call(this);
    this._skillStatusEx._skill = null;
    this._statusWindow._skill = null;
    this._skillStatusEx.refresh();
    this._statusWindow.refresh();
  };

  //-----------------------------------------------------------------------------
  // Window_SkillStatus
  //
  Window_SkillStatus.prototype.refresh = function () {
    this.contents.clear();
    var w = this.width - this.padding * 2;
    var h = this.height - this.padding * 2;
    var y = h / 4 - this.textPadding() * 2;
    var width = w - 162 - this.textPadding();
    var color = this.gaugeBackColor();
    this.contents.paintOpacity = this.standardBackOpacity();
    this.contents.fillRect(this.textPadding(), y, 96, 96, color);
    this.contents.fillRect(96 + this.textPadding() * 2, y + 3, (width / 2) + (this.textPadding() * 2) + 6, (96 / 2) - this.textPadding() / 2, color);
    this.contents.fillRect((96 + this.textPadding() * 4) + (width / 2) + this.textPadding() * 2, y + 3,
      (width / 2) + this.textPadding() * 8, (96 / 2) - this.textPadding() / 2, color);
    this.contents.fillRect(96 + this.textPadding() * 2, y + (96 / 2) + this.textPadding() / 2,
      (width / 2) + (this.textPadding() * 2) + 6, (96 / 2) - this.textPadding(), color);
    this.contents.fillRect((96 + this.textPadding() * 4) + (width / 2) + this.textPadding() * 2, y + (96 / 2) + this.textPadding() / 2,
      (width / 2) + this.textPadding() * 8, (96 / 2) - this.textPadding(), color);
    this.contents.paintOpacity = 255;
    var skill = this._skill;
    if (this._skill) {
      let level = skillLevels[skill.id].level,
        LevelNameNext = (() => {
          let name = "\\tx[2016]";
          skillLevels[skill.id].levelName.map(levelName => {
            if (levelName.level === level + 1)
              return (name =
                levelName.text[$gameSystem.getterLanguageSystem()]);
          });
          return name;
        })(),
        levelRange = skillLevels[skill.id].levelRange(),
        levelMaxRange = skillLevels[skill.id].levelMaxRange(),
        x = 104 + this.textPadding() * 2,
        y = 8 + this.textPadding() * 4,
        iconIndex = (() => {
          let low = 89,
            medium = 88,
            high = 87;
          if (levelRange >= levelMaxRange) return high;
          if (levelRange >= Math.floor(levelMaxRange / 2) || levelRange >= Math.floor(levelMaxRange / 4)) return medium;
          if (levelRange < levelMaxRange) return low;
        })();
      this.contents.fontFace = "GameFont2";
      this.drawIconEx(iconIndex, 11 + this.textPadding() * 2, h / 4 + this.textPadding() + 2);
      this.drawTextEx2(`\\}\\tx[1017]\\{`, x, y);
      this.drawTextEx2(`\\}${LevelNameNext}\\{`, x + (width / 2) + this.textPadding() * 4, y);
      this.drawTextEx2(`\\}\\tx[1018]\\{`, x, y + (this.textPadding() * 8) - 1);
      this.drawTextEx2(`\\}\\C[3]${levelRange}\\C[0] | \\C[3]${levelMaxRange}\\C[0]\\{`, x + (width / 2) + this.textPadding() * 4, y + (this.textPadding() * 8) - 1);
    }
  };

  Window_SkillStatus.prototype.drawIconEx = function (iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem("IconSet");
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = (iconIndex % 16) * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 60, 60);
  };

  Window_SkillStatus.prototype.drawTextEx2 = function (text, x, y) {
    if (text) {
      var textState = { index: 0, x: x, y: y, left: x };
      textState.text = this.convertEscapeCharacters(text);
      textState.height = this.calcTextHeight(textState, false);
      this.resetFontSettingsEx();
      while (textState.index < textState.text.length) {
        this.processCharacter(textState);
      }
      return textState.x - x;
    } else {
      return 0;
    }
  };

  Window_SkillStatus.prototype.resetFontSettingsEx = function () {
    this.contents.fontFace = this.standardFontFaceEx();
    this.contents.fontSize = this.standardFontSize();
    this.resetTextColor();
  };

  Window_SkillStatus.prototype.standardFontFaceEx = function () {
    if ($gameSystem.isChinese()) {
      return "SimHei, Heiti TC, sans-serif";
    } else if ($gameSystem.isKorean()) {
      return "Dotum, AppleGothic, sans-serif";
    } else {
      return "GameFont2";
    }
  };

  //-----------------------------------------------------------------------------
  // Window_SkillStatusEx
  //
  Window_SkillList.prototype.drawItem = function (index) {
    var skill = this._data[index];
    if (skill) {
      var costWidth = this.costWidth();
      var rect = this.itemRect(index);
      this.changePaintOpacity(this.isEnabled(skill));
      this.drawItemName(skill, rect.x, rect.y, rect.width - costWidth);
    }
  };

  Window_SkillList.prototype.drawItemName = function (item, x, y, width) {
    width = width || 312;
    if (item) {
      this.resetTextColor();
      let fontSize = this.contents.fontSize;
      this.contents.fontSize = fontSize - 12;
      this.drawText(item.name, x, y, width);
      this.contents.fontSize = fontSize;
    }
  };

  const _window_skillList_updateHelp = Window_SkillList.prototype.updateHelp;
  Window_SkillList.prototype.updateHelp = function () {
    _window_skillList_updateHelp.call(this);
    let window = SceneManager._scene._skillStatusEx,
      window2 = SceneManager._scene._statusWindow;
    window._skill = this.item();
    window2._skill = this.item();
    window.refresh();
    window2.refresh();
  };

  //-----------------------------------------------------------------------------
  // Window_SkillStatusEx
  //
  function Window_SkillStatusEx() {
    this.initialize.apply(this, arguments);
  }

  Window_SkillStatusEx.prototype = Object.create(Window_Base.prototype);
  Window_SkillStatusEx.prototype.constructor = Window_SkillStatusEx;

  Window_SkillStatusEx.prototype.initialize = function () {
    Window_Base.prototype.initialize.call(this, 5, 5, 100, 100);
    this._skill = null;
  };

  Window_SkillStatusEx.prototype.refresh = function () {
    this.contents.clear();
    var color = this.gaugeBackColor();
    this.contents.paintOpacity = this.standardBackOpacity();
    this.contents.fillRect(0, 0, 96, 96, color);
    this.contents.fillRect(100, 15, 350, 32, color);
    this.contents.fillRect(100, 55, 350, 32, color);
    this.contents.fillRect(455, 15, 410, 32, color);
    this.contents.fillRect(455, 55, 410, 32, color);
    this.contents.fillRect(
      0,
      100,
      this.contentsWidth(),
      this.contentsHeight(),
      color
    );
    this.contents.paintOpacity = 255;
    if (this._skill) {
      this.drawItem();
    }
  };

  Window_SkillStatusEx.prototype.drawIconEx = function (iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem("IconSet");
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = (iconIndex % 16) * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y, 60, 60);
  };

  Window_SkillStatusEx.prototype.drawItem = function () {
    var skill = this._skill;
    if (skill) {
      let level = skillLevels[skill.id].level,
        LevelName = (() => {
          let name = "\\tx[2016]";
          skillLevels[skill.id].levelName.map(levelName => {
            if (levelName.level === level)
              return (name =
                levelName.text[$gameSystem.getterLanguageSystem()]);
          });
          return name;
        })(),
        levelMax = skillLevels[skill.id].levelMax,
        scoreDivider = skillLevels[skill.id].scoreDivider,
        fameDivider = skillLevels[skill.id].fameDivider,
        help = skillLevels[skill.id].help,
        scoreBonus = (() => {
          let bonus = skillLevels[skill.id].scoreBonus[0][0] || 0;
          skillLevels[skill.id].scoreBonus.map(meta => {
            if (meta[level] != undefined)
              return (bonus = meta[level]);
          });
          return bonus;
        })(),
        score = ((level * (levelMax / scoreDivider)) / 100) + scoreBonus,
        fameBonus = (() => {
          let bonus = skillLevels[skill.id].fameBonus[0][0] || 0;
          skillLevels[skill.id].fameBonus.map(meta => {
            if (meta[level] != undefined)
              return (bonus = meta[level]);
          });
          return bonus;
        })(),
        fame = ((level * (score / fameDivider)) / 100) + fameBonus;
      this.drawIconEx(
        skill.iconIndex,
        96 / 4 - this.textPadding(),
        96 / 4 - this.textPadding() + 2
      );
      this.contents.fontFace = "GameFont2";
      this.drawTextEx2(`\\}\\tx[2013]: ${level}/${levelMax}\\{`, 108, 14);
      this.drawTextEx2(`\\}${LevelName}\\{`, 108, 53);
      this.drawTextEx2(`\\}\\tx[2014]: \\C[3]+${score.toFixed(2)}%\\C[0]\\{`, 463, 14);
      this.drawTextEx2(`\\}\\tx[2015]: \\C[3]+${fame.toFixed(2)}%\\C[0]\\{`, 463, 53);
      var y = 110,
        i = 1;
      if (help.length > 0) {
        help.map(line => {
          if (i <= 1) {
            this.drawTextEx(
              `\\}\\I[${line.iconIndex}] ${
              line.text[$gameSystem.getterLanguageSystem()]
              }\\{`,
              this.textPadding() + 2,
              y
            );
          } else {
            y = y + 40;
            this.drawTextEx(
              `\\}\\I[${line.iconIndex}] ${
              line.text[$gameSystem.getterLanguageSystem()]
              }\\{`,
              this.textPadding() + 2,
              y
            );
          }
          i++;
        });
      }
    }
  };

  Window_SkillStatusEx.prototype.drawTextEx2 = function (text, x, y) {
    if (text) {
      var textState = { index: 0, x: x, y: y, left: x };
      textState.text = this.convertEscapeCharacters(text);
      textState.height = this.calcTextHeight(textState, false);
      this.resetFontSettingsEx();
      while (textState.index < textState.text.length) {
        this.processCharacter(textState);
      }
      return textState.x - x;
    } else {
      return 0;
    }
  };

  Window_SkillStatusEx.prototype.resetFontSettingsEx = function () {
    this.contents.fontFace = this.standardFontFaceEx();
    this.contents.fontSize = this.standardFontSize();
    this.resetTextColor();
  };

  Window_SkillStatusEx.prototype.standardFontFaceEx = function () {
    if ($gameSystem.isChinese()) {
      return "SimHei, Heiti TC, sans-serif";
    } else if ($gameSystem.isKorean()) {
      return "Dotum, AppleGothic, sans-serif";
    } else {
      return "GameFont2";
    }
  };
})();

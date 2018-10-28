// This plugin was compiled from sapphirescript (v1.0 Beta)
// sapphirescript by Nilo K. - Khas (arcthunder.blogspot.com/p/sapphire-script.html)
//=====================================================================================================================
// * KhasAdvancedFog
//=====================================================================================================================
if (!(Khas && Khas.Graphics && Khas.Graphics.version >= 1.0)) {
  var current_plugin = "KhasAdvancedFog";
  var missing_plugin = "KhasGraphics";
  var missingVersion = 1.0;
  alert("Please install " + (missing_plugin) + " v" + (missingVersion) + " in order to use " + (current_plugin) + "");
};
Khas.Fog = {};
Khas.Fog.version = 3.0;
Khas.Fog.Settings = {};
/*:
 * @plugindesc [3.0] Adds procedural fog to your game.
 * 
 * @author Nilo K. (Khas - arcthunder.blogspot.com)
 * 
 * @param Variable Fog Density
 * @desc [ON/OFF] If ON, fog will vary its density around the
 * player, being less dense the closer to the player.
 * @default ON
 * 
 * @param Zoom Compatibility
 * @desc [ON/OFF] If ON, this plugin is compatible with zoom
 * commands. Leave OFF if not used.
 * @default OFF
 * 
 * @param MBS Zoom
 * @desc [ON/OFF] Compatibility with MBS Map Zoom.
 * Set Zoom Compatibility ON if you need this.
 * @default OFF
 *
 * @param Transfer Reset
 * @desc [ON/OFF] Fog is set to off after transfering.
 * @default OFF
 *
 * @param Auto Battle Fog
 * @desc [ON/OFF] Battles' fog will match the current fog.
 * @default ON
 *
 * @help - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * [MV] Khas Advanced Fog
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * By Nilo K. (Khas)
 *  * Version 3.0
 *  * Released on 07.26.2017
 * 
 *  * Social Media
 * Blog: arcthunder.blogspot.com
 * Twitter: twitter.com/arcthunder
 * Youtube: youtube.com/c/khasarc
 * 
 *  * Support for this plugin at RPG Maker Web forums
 * forums.rpgmakerweb.com/index.php?threads/khas-advanced-fog.77678
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * Terms of Use
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 * If you want to use this plugin with a free RPG Maker game, you can do it for 
 * free and there's no need to contact me. I only ask you to give credit to 
 * "Khas" or "Khas Custom Scripts" somewhere in your game. You may include my 
 * blog url if you want.
 * 
 * This plugin is NOT FREE for COMMERCIAL use. If you want to use it on a 
 * commercial title (any game that you may sell), you must pay a one-time 
 * $15 USD fee (payable via PayPal only - please send me an e-mail, see the
 * Contact page on my blog). This license covers commercial use for your
 * current and future projects, and it allows you to use all my plugins.
 * 
 * Please note that this plugin is provided “as is”, without warranty of any 
 * kind. You are responsible for testing it and checking if it’s compatible 
 * with your game. In no event shall the author of this plugin be liable for 
 * any claim, damages or other liability, whether in an action of contract, 
 * tort or otherwise, arising from, out of or in connection with the software 
 * or the use or other dealings in the software.
 * 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * Instructions
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 * Please check the complete tutorial at my blog:
 * arcthunder.blogspot.com.br/p/tutorial-advanced-fog.html
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * Share feedback / Get help
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * You may give feedback or get help at RPG Maker Web:
 * forums.rpgmakerweb.com/index.php?threads/khas-advanced-fog.77678
 * 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * Log
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 *  * Version 3.0 (07.26.2017)
 * Fixed bug with uppercase OFF in [fog OFF]
 * Added "Transfer Reset" parameter
 * Added "Auto Battle Fog" parameter
 * Added colored fog
 * Added optional property (color: {"r": 0-255, "g": 0-255, "b": 0-255})
 * Fixed bug "pixi cannot read property 'location' of undefined"
 *
 *  * Version 2.0 (04.08.2017)
 * Plugin completely rewritten
 * Added safety check on plugin commands (prevent null/undefined)
 * Effects have been separated into layers (better parallax compatibility)
 * Improved shader management system
 * Fixed inverted Y sampling on shaders
 * Now compatible with weather effects
 * Now compatible with MBS Zoom (zoomX == zoomY only)
 * Added [fog fogId switchId] for conditional change
 *
 *  * Version 1.1 (03.03.2017)
 * MV updated to 1.3.5
 * Requires Khas Core 1.2 
 * Added compatibility with zoom controls (zoom in only!)
 * Added compatibility with different tile sizes
 * Added Pixi.js version checking (requires v3 or later)
 * Fixed event not turning off light on page switch
 * Added commands to create lights with region tags and terrain tags
 * Fixed lighting/fog being applied to pictures
 * Performance tweaks
 * Fixed shader problems with opacity and exposure
 * 
 *  * Version 1.0.1 (01.24.2017)
 * Fixed inverted lighting/fog on menu screen
 * 
 *  * Version 1.0 (01.20.2017)
 * First release!
 * 
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
 */;
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Fogs
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Khas.Fog.FOGS = {
  rare: {
    speed: { x: 0.2, y: 0.07 },
    size: 1.0,
    ambientDensity: 30,
    playerDensity: 10,
    playerRange: 5
  },
  medium: {
    speed: { x: 0.2, y: 0.07 },
    size: 1.0,
    ambientDensity: 5,
    playerDensity: 0,
    playerRange: 0
  },
  dense: {
    speed: { x: 0.2, y: 0.05 },
    size: 1.0,
    ambientDensity: 10,
    playerDensity: 0,
    playerRange: 0
  },
  red: {
    speed: { x: 0.2, y: 0.07 },
    size: 1.0,
    ambientDensity: 60,
    playerDensity: 20,
    playerRange: 5,
    color: { "r": 255, "g": 0, "b": 0 }
  },
  green: {
    speed: { x: 0.2, y: 0.07 },
    size: 1.0,
    ambientDensity: 60,
    playerDensity: 20,
    playerRange: 5,
    color: { "r": 0, "g": 255, "b": 0 }
  },
  blue: {
    speed: { x: 0.2, y: 0.07 },
    size: 1.0,
    ambientDensity: 60,
    playerDensity: 20,
    playerRange: 5,
    color: { "r": 0, "g": 0, "b": 255 }
  },
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  // * Custom Fogs - Begin
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  /*
  In order to create custom fogs, copy any of the fogs above and add them below. Check the template
  explained here and edit the copied fog to achieve the effect you're looking for. 
  
  
  Template:
  Please note that playerDensity and playerRange will only work if you enable "Variable Fog Density".
  
  rare: {                       // This is the fog name, must be lowercase.
      speed: {x: 0.2, y: 0.07}, // The fog's speed, a float. Small values recommended for best effect (like 0.0 - 1.0).
      size: 1.0,                // Increases/decreases the fog size. The default is 1.0.
      ambientDensity: 20,       // The ambient fog density, an integer from 0 to 100.
      playerDensity: 10,        // The fog density around the player, an integer from 0 to 100.
      playerRange: 5            // The range the player sees through the fog (in tiles).
  },
  
  Since version 3.0, a new property can be included for colored fog:
      color: {"r": X, "g": Y, "b": Z}    
  
  Where X, Y and Z are integer values from 0 to 255.
  
  PLACE YOUR CUSTOM FOGS HERE: */






  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  // * Custom Fogs - End
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
};
Khas.Fog.PARAMETERS = PluginManager.parameters("KhasAdvancedFog");
Khas.Fog.Settings.VARIABLE_FOG_DENSITY = Khas.Fog.PARAMETERS["Variable Fog Density"].toLowerCase() == "on";
Khas.Fog.Settings.ENABLE_ZOOM = Khas.Fog.PARAMETERS["Zoom Compatibility"].toLowerCase() == "on";
Khas.Fog.Settings.ENABLE_MBS = Khas.Fog.PARAMETERS["MBS Zoom"].toLowerCase() == "on";
Khas.Fog.Settings.TRANSFER_RESET = Khas.Fog.PARAMETERS["Transfer Reset"].toLowerCase() == "on";
Khas.Fog.Settings.AUTO_BATTLE_FOG = Khas.Fog.PARAMETERS["Auto Battle Fog"].toLowerCase() == "on";
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Scene Manager
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
SceneManager.kaf_loadKhasPlugins = SceneManager.loadKhasPlugins;
SceneManager.loadKhasPlugins = function () {
  this.kaf_loadKhasPlugins();
  this.loadFogCache();
};
SceneManager.loadFogCache = function () {
  Khas.Filters.FOG = new Khas_FogFilter();
  Khas.Filters.VARIABLE_FOG = new Khas_VariableFogFilter();
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Game Screen
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
if (Khas.Fog.Settings.ENABLE_ZOOM && !Khas.Fog.Settings.ENABLE_MBS) {
  Game_Screen.prototype.syncZoom = function (filter) {
    filter.setZoom(this._zoomX, this._zoomY, this._zoomScale);
  };
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Game Map
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Object.defineProperty(Game_Map.prototype, 'fog', { get: function () { return this._fog; }, });
Object.defineProperty(Game_Map.prototype, 'battleFog', { get: function () { return this._battleFog; }, });
Game_Map.prototype.kaf_initialize = Game_Map.prototype.initialize;
Game_Map.prototype.kaf_callKhasCommand = Game_Map.prototype.callKhasCommand;
Game_Map.prototype.kaf_khasSetupMap = Game_Map.prototype.khasSetupMap;
Game_Map.prototype.initialize = function () {
  this._fog = new Game_Fog();
  this._battleFog = new Game_Fog(false);
  this.kaf_initialize();
};
Game_Map.prototype.khasSetupMap = function () {
  if (Khas.Fog.Settings.TRANSFER_RESET) this._fog.set(null);
  this.kaf_khasSetupMap();
};
Game_Map.prototype.callKhasCommand = function (command, value1, value2) {
  if (command == "fog") {
    var switchId = Number(value2 || "");
    if (switchId > 0) {
      if (value1 && value1.toLowerCase() != "off") {
        if ($gameSwitches.value(switchId)) this._fog.set(value1);
      } else {
        if ($gameSwitches.value(switchId)) this._fog.set(null);
      };
    } else {
      if (this._fog.autoFog) {
        if (value1 && value1.toLowerCase() != "off") {
          this._fog.set(value1);
        } else {
          this._fog.set(null);
        };
      };
    };
  } else {
    this.kaf_callKhasCommand(command, value1, value2);
  };
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Game Interpreter
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Game_Interpreter.prototype.kaf_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function (command, args) {
  if (!(command)) return;
  args = args || [];
  switch (command.toLowerCase()) {
    case "fog":
      var fogId = args[0] || "";
      if (fogId.toLowerCase() == "off") {
        $gameMap.fog.set(null);
      } else {
        $gameMap.fog.set(fogId);
      };
      break;
    case "autofog":
      var state = (args[0] || "").toLowerCase();
      if (state == "on") $gameMap.fog.autoFog = true;
      if (state == "off") $gameMap.fog.autoFog = false;
      break;
    case "battlefog":
      var fogId = args[0] || "";
      if (fogId.toLowerCase() == "off") {
        $gameMap.battleFog.set(null);
      } else {
        $gameMap.battleFog.set(fogId);
      };
      break;
    default:
      this.kaf_pluginCommand(command, args);
  };
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Game Fog
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function Game_Fog() { this.initialize.apply(this, arguments); };
Object.defineProperty(Game_Fog.prototype, 'fogId', { get: function () { return this._fogId; }, });
Object.defineProperty(Game_Fog.prototype, 'mapFog', { get: function () { return this._mapFog; }, });
Object.defineProperty(Game_Fog.prototype, 'autoFog', { get: function () { return this._autoFog; }, set: function (value) { this._autoFog = value; } });
Game_Fog.prototype.initialize = function (mapFog) {
  this._fogId = null;
  this._autoFog = true;
  this._mapFog = (mapFog == null ? true : mapFog);
};
Game_Fog.prototype.getData = function () {
  return Khas.Fog.FOGS[this._fogId];
};
Game_Fog.prototype.set = function (fogId) {
  if (fogId) {
    if (Khas.Fog.FOGS[fogId]) {
      this._fogId = fogId;
    } else {
      alert("Fog not found: " + (fogId) + "");
      this._fogId = null;
    };
  } else {
    this._fogId = null;
  };
};
Game_Fog.prototype.copyFog = function (gameFog) {
  this.set(gameFog.fogId);
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Khas Fog
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function Khas_Fog() { this.initialize.apply(this, arguments); };
Object.defineProperty(Khas_Fog.prototype, 'layerSprite', { get: function () { return this._layerSprite; }, });
Khas_Fog.prototype.initialize = function (fogState) {
  this._fogTime = Math.randomInt(10000);
  this._fogState = fogState;
  this._filter = (Khas.Fog.Settings.VARIABLE_FOG_DENSITY && this._fogState.mapFog ? Khas.Filters.VARIABLE_FOG : Khas.Filters.FOG);
  this._filter.setResolution(Graphics.width, Graphics.height);
  this._layerSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
  this._layerSprite.addFilter(this._filter);
  this._layerSprite.filterArea = new PIXI.Rectangle(0, 0, Graphics.width, Graphics.height);
  if (Khas.Fog.Settings.ENABLE_ZOOM) this.refreshZoom();
  this.refreshFog();
};
Khas_Fog.prototype.update = function () {
  if (this._fogId != this._fogState.fogId) this.refreshFog();
  if (!(this._fogId)) return;
  this._filter.setFogTime(this._fogTime);
  this._filter.setFogOffset($gameMap.displayX() * 48 - $gameScreen.shake(), $gameMap.displayY() * 48);
  if (Khas.Fog.Settings.ENABLE_ZOOM) {
    this.refreshZoom();
  } else {
    this._filter.setPlayerScreenPos($gamePlayer.screenX(), $gamePlayer.screenY());
  };
  this._fogTime += 0.01;
};
Khas_Fog.prototype.refreshZoom = function () {
  if (Khas.Fog.Settings.ENABLE_MBS) {
    var zoom = $gameMap._zoom.x;
    this._filter.setZoom(0, 0, zoom);
    this._filter.setPlayerScreenPos($gamePlayer.screenX() * zoom, $gamePlayer.screenY() * zoom);
    this._layerSprite.filterArea.width = Graphics.width;
    this._layerSprite.filterArea.height = Graphics.height;
  } else {
    this._filter.setPlayerScreenPos($gamePlayer.screenX(), $gamePlayer.screenY());
    $gameScreen.syncZoom(this._filter);
  };
};
Khas_Fog.prototype.refreshFog = function () {
  this._fogId = this._fogState.fogId;
  if (this._fogId) {
    this._layerSprite.visible = true;
    var data = this._fogState.getData();
    this._filter.setFogSpeed(data.speed.x, data.speed.y);
    this._filter.setFogDensity(data.ambientDensity, data.playerDensity);
    this._filter.setPlayerFogRange(data.playerRange);
    this._filter.setFogSize(data.size);
    if (data.color) {
      this._filter.setFogColor(data.color.r / 255.0, data.color.g / 255.0, data.color.b / 255.0);
    } else {
      this._filter.setFogColor(1.0, 1.0, 1.0);
    };
  } else {
    this._layerSprite.visible = false;
  };
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Khas Filters
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Khas.Filters.Source.FRAGMENT_FOG = "\n\n  varying vec2 vTextureCoord;\n  varying float flipY;\n\n  uniform vec2 screenResolution;\n  uniform sampler2D uSampler;\n  uniform float fogTime;\n  uniform vec2 fogSpeed;\n  uniform vec2 fogOffset;\n  uniform float fogSizeMultiplier;\n  uniform float fogDensity;\n  uniform vec3 fogColor;\n\n  " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'uniform vec2 zoom;' : '') + "\n  " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'uniform float zoomScale;' : '') + "\n\n  float k1(vec2 v) { return fract(cos(dot(v, vec2(12.9898, 4.1414))) * 43758.5453); }\n  float k2(vec2 v) { const vec2 d = vec2(0.0, 1.0); vec2 b = floor(v), f = smoothstep(vec2(0.0), vec2(1.0), fract(v)); return mix(mix(k1(b), k1(b + d.yx), f.x), mix(k1(b + d.xy), k1(b + d.yy), f.x), f.y); }\n  float k3(vec2 v) { float total = 0.0, amplitude = 1.0; for (int i = 0; i < 4; i++) { total += k2(v) * amplitude; v += v; amplitude *= 0.5; } return total; }\n\n  void main(void) {\n    const float c1 = 0.9, c2 = 0.5, c3 = 0.4, c4 = 0.8, c5 = 0.2, c6 = 0.5;\n\n    vec2 fragCoord = vec2(gl_FragCoord.x, flipY * (screenResolution.y - gl_FragCoord.y) + (1.0 - flipY) * gl_FragCoord.y);\n\n    " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'vec2 zoomFragCoord = fragCoord / zoomScale - zoom * (1.0 - zoomScale) / zoomScale;' : '') + "\n    " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'vec2 screenSpaceCoords = zoomFragCoord / screenResolution;' : 'vec2 screenSpaceCoords = fragCoord / screenResolution;') + "\n\n    vec2 v1 = (" + (Khas.Fog.Settings.ENABLE_ZOOM ? 'zoomFragCoord' : 'fragCoord') + " - fogOffset) * fogSizeMultiplier;\n    float k = k3(v1 - fogTime * fogSpeed);\n    vec2 v2 = vec2(k3(v1 + k + fogTime * fogSpeed * 0.9 - v1.x - v1.y), k3(v1 + k - fogTime * fogSpeed * 0.8));\n        \n    float fog = clamp(mix(c1, c2, k3(v1 + v2)) + mix(c3, c4, v2.x) - mix(c5, c6, v2.y), 0.0, 1.0);\n\n    float d = fogDensity + vTextureCoord.x * 0.0001 + vTextureCoord.y * 0.0001;\n    gl_FragColor = vec4(fogColor, 1.0) * fog * d;\n  }\n";
Khas.Filters.Source.FRAGMENT_VARIABLE_FOG = "\n\n  varying vec2 vTextureCoord;\n  varying float flipY;\n\n  uniform vec2 screenResolution;\n  uniform sampler2D uSampler;\n  uniform float fogTime;\n  uniform vec2 fogSpeed;\n  uniform vec2 fogOffset;\n  uniform float fogSizeMultiplier;\n  uniform vec2 fogDensity;\n  uniform vec2 playerScreenPos;\n  uniform float playerFogMultiplier;\n  uniform vec3 fogColor;\n\n  " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'uniform vec2 zoom;' : '') + "\n  " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'uniform float zoomScale;' : '') + "\n\n  float k1(vec2 v) { return fract(cos(dot(v, vec2(12.9898, 4.1414))) * 43758.5453); }\n  float k2(vec2 v) { const vec2 d = vec2(0.0, 1.0); vec2 b = floor(v), f = smoothstep(vec2(0.0), vec2(1.0), fract(v)); return mix(mix(k1(b), k1(b + d.yx), f.x), mix(k1(b + d.xy), k1(b + d.yy), f.x), f.y); }\n  float k3(vec2 v) { float total = 0.0, amplitude = 1.0; for (int i = 0; i < 4; i++) { total += k2(v) * amplitude; v += v; amplitude *= 0.5; } return total; }\n\n  void main(void) {\n    const float c1 = 0.9, c2 = 0.5, c3 = 0.4, c4 = 0.8, c5 = 0.2, c6 = 0.5;\n\n    vec2 fragCoord = vec2(gl_FragCoord.x, flipY * (screenResolution.y - gl_FragCoord.y) + (1.0 - flipY) * gl_FragCoord.y);\n\n    " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'vec2 zoomFragCoord = fragCoord / zoomScale - zoom * (1.0 - zoomScale) / zoomScale;' : '') + "\n    " + (Khas.Fog.Settings.ENABLE_ZOOM ? 'vec2 screenSpaceCoords = zoomFragCoord / screenResolution;' : 'vec2 screenSpaceCoords = fragCoord / screenResolution;') + "\n\n    vec2 v1 = (" + (Khas.Fog.Settings.ENABLE_ZOOM ? 'zoomFragCoord' : 'fragCoord') + " - fogOffset) * fogSizeMultiplier;\n    float k = k3(v1 - fogTime * fogSpeed);\n    vec2 v2 = vec2(k3(v1 + k + fogTime * fogSpeed * 0.9 - v1.x - v1.y), k3(v1 + k - fogTime * fogSpeed * 0.8));\n        \n    float fog = clamp(mix(c1, c2, k3(v1 + v2)) + mix(c3, c4, v2.x) - mix(c5, c6, v2.y), 0.0, 1.0);\n    float density = distance(playerScreenPos, fragCoord) * playerFogMultiplier " + (Khas.Fog.Settings.ENABLE_ZOOM ? '/ zoomScale' : '') + ";\n    float fogBlend = clamp(density, fogDensity.x, fogDensity.y);\n\n    fogBlend += vTextureCoord.x * 0.0001 + vTextureCoord.y * 0.0001;\n    gl_FragColor = vec4(fogColor, 1.0) * fog * fogBlend;\n  }\n";
function Khas_FogFilter() { this.initialize.apply(this, arguments); };
Khas_FogFilter.prototype = Object.create(Khas_Filter.prototype);
Khas_FogFilter.prototype.constructor = Khas_FogFilter;
Khas_FogFilter.prototype.initialize = function (variableFog) {
  Khas_Filter.prototype.initialize.call(this, Khas.Filters.Source.VERTEX_FLIP_Y, variableFog ? Khas.Filters.Source.FRAGMENT_VARIABLE_FOG : Khas.Filters.Source.FRAGMENT_FOG);
};
Khas_FogFilter.prototype.setResolution = function (width, height) {
  this.uniforms.screenResolution.x = width;
  this.uniforms.screenResolution.y = height;
};
Khas_FogFilter.prototype.setZoom = function (zoomX, zoomY, zoomScale) {
  this.uniforms.zoom.x = zoomX;
  this.uniforms.zoom.y = zoomY;
  this.uniforms.zoomScale = zoomScale;
};
Khas_FogFilter.prototype.setFogTime = function (time) {
  this.uniforms.fogTime = time;
};
Khas_FogFilter.prototype.setFogSpeed = function (sx, sy) {
  this.uniforms.fogSpeed.x = sx;
  this.uniforms.fogSpeed.y = sy;
};
Khas_FogFilter.prototype.setFogOffset = function (ox, oy) {
  this.uniforms.fogOffset.x = -ox;
  this.uniforms.fogOffset.y = -oy;
};
Khas_FogFilter.prototype.setPlayerScreenPos = function (sx, sy) {
};
Khas_FogFilter.prototype.setPlayerFogRange = function (tiles) {
};
Khas_FogFilter.prototype.setFogDensity = function (ambientFog, playerFog) {
  this.uniforms.fogDensity = ambientFog * 0.01;
};
Khas_FogFilter.prototype.setFogSize = function (size) {
  this.uniforms.fogSizeMultiplier = 8 / (1000 * size);
};
Khas_FogFilter.prototype.setFogColor = function (r, g, b) {
  this.uniforms.fogColor[0] = r;
  this.uniforms.fogColor[1] = g;
  this.uniforms.fogColor[2] = b;
};
function Khas_VariableFogFilter() { this.initialize.apply(this, arguments); };
Khas_VariableFogFilter.prototype = Object.create(Khas_FogFilter.prototype);
Khas_VariableFogFilter.prototype.constructor = Khas_VariableFogFilter;
Khas_VariableFogFilter.prototype.initialize = function () {
  Khas_FogFilter.prototype.initialize.call(this, true);
};
Khas_VariableFogFilter.prototype.setPlayerScreenPos = function (sx, sy) {
  this.uniforms.playerScreenPos.x = sx;
  this.uniforms.playerScreenPos.y = sy;
};
Khas_VariableFogFilter.prototype.setPlayerFogRange = function (tiles) {
  this.uniforms.playerFogMultiplier = 1 / (tiles * 48);
};
Khas_VariableFogFilter.prototype.setFogDensity = function (ambientFog, playerFog) {
  this.uniforms.fogDensity.x = playerFog * 0.01;
  this.uniforms.fogDensity.y = ambientFog * 0.01;
};
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// * Khas Graphics
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Object.defineProperty(Khas_Graphics.prototype, 'fog', { get: function () { return this._fog; }, });
Khas_Graphics.prototype.kaf_newScene = Khas_Graphics.prototype.newScene;
Khas_Graphics.prototype.kaf_updateScene = Khas_Graphics.prototype.updateScene;
Khas_Graphics.prototype.kaf_clearScene = Khas_Graphics.prototype.clearScene;
Khas_Graphics.prototype.newScene = function () {
  this.kaf_newScene();
  switch (this._spriteset.khasType()) {
    case "map":
      this._fog = new Khas_Fog($gameMap.fog);
      break;
    case "battle":
      if (Khas.Fog.Settings.AUTO_BATTLE_FOG) $gameMap.battleFog.copyFog($gameMap.fog);
      this._fog = new Khas_Fog($gameMap.battleFog);
      break;
  };
  this._spriteset.addChild(this._fog.layerSprite);
};
Khas_Graphics.prototype.updateScene = function () {
  this.kaf_updateScene();
  if (this._fog) this._fog.update();
};
Khas_Graphics.prototype.clearScene = function () {
  this._fog = null;
  this.kaf_clearScene();
};
//=====================================================================================================================
// * End of Plugin
//=====================================================================================================================
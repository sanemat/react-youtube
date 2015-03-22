"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * Module dependencies
 */

var React = _interopRequire(require("react"));

var globalize = _interopRequire(require("random-global"));

var createPlayer = _interopRequire(require("./lib/createPlayer"));

/**
 * Create a new `YouTube` component.
 */

var YouTube = (function (_React$Component) {

  /**
   * @param {Object} props
   */

  function YouTube(props) {
    _classCallCheck(this, YouTube);

    _get(Object.getPrototypeOf(YouTube.prototype), "constructor", this).call(this, props);

    this._internalPlayer = null;
    this._playerReadyHandle = null;
    this._stateChangeHandle = null;

    this._handlePlayerReady = this._handlePlayerReady.bind(this);
    this._handlePlayerStateChange = this._handlePlayerStateChange.bind(this);
  }

  _inherits(YouTube, _React$Component);

  _createClass(YouTube, {
    shouldComponentUpdate: {

      /**
       * @param {Object} nextProps
       * @returns {Boolean}
       */

      value: function shouldComponentUpdate(nextProps) {
        return nextProps.url !== this.props.url;
      }
    },
    componentDidMount: {
      value: function componentDidMount() {
        this._createPlayer();
      }
    },
    componentDidUpdate: {
      value: function componentDidUpdate() {
        this._createPlayer();
      }
    },
    componentWillUnmount: {
      value: function componentWillUnmount() {
        this._destroyPlayer();
      }
    },
    render: {

      /**
       * @returns Object
       */

      value: function render() {
        return React.createElement("div", { id: this.props.id });
      }
    },
    _createPlayer: {

      /**
       * Create a new `internalPlayer`.
       *
       * This is called on every render, which is only triggered after
       * `props.url` has changed. Setting or changing any other props
       * will *not* cause a new player to be loaded.
       */

      value: function _createPlayer() {
        this._destroyPlayer();

        createPlayer(this.props, (function (player) {
          this._setupPlayer(player);
        }).bind(this));
      }
    },
    _destroyPlayer: {

      /**
       * Destroy the currently embedded player/iframe and remove any event listeners
       * bound to it.
       */

      value: function _destroyPlayer() {
        if (this._internalPlayer) {
          this._unbindEvents();
          this._destroyGlobalEventHandlers();
          this._internalPlayer.destroy();
        }
      }
    },
    _setupPlayer: {

      /**
       * Integrate a newly created `player` with the rest of the component.
       *
       * @param {Object} player
       */

      value: function _setupPlayer(player) {
        this._internalPlayer = player;
        this._globalizeEventHandlers();
        this._bindEvents();
      }
    },
    _handlePlayerReady: {

      /**
       * When the player is all loaded up, load the url
       * passed via `props.url` and notify anybody listening.
       *
       * Is exposed in the global namespace under a random
       * name, see `_globalizeEventHandlers`
       */

      value: function _handlePlayerReady() {
        this.props.onReady();
      }
    },
    _handlePlayerStateChange: {

      /**
       * Respond to player events
       *
       * Event definitions at https://developers.google.com/youtube/js_api_reference#Events
       *
       * Is exposed in the global namespace under a random
       * name, see `_globalizeEventHandlers`
       *
       * @param {Object} event
       */

      value: function _handlePlayerStateChange(event) {
        switch (event.data) {

          case window.YT.PlayerState.ENDED:
            this.props.onEnd();
            break;

          case window.YT.PlayerState.PLAYING:
            this.props.onPlay();
            break;

          case window.YT.PlayerState.PAUSED:
            this.props.onPause();
            break;

          default:
            return;
        }
      }
    },
    _globalizeEventHandlers: {

      /**
       * Expose our player event handlers onto the global namespace
       * under random handles, then store those handles into `state`.
       *
       * The YouTube API requires a `player`s event handlers to be
       * exposed in the global namespace, so this is unfortunate but necessary.
       */

      value: function _globalizeEventHandlers() {
        this._playerReadyHandle = globalize(this._handlePlayerReady);
        this._stateChangeHandle = globalize(this._handlePlayerStateChange);
      }
    },
    _destroyGlobalEventHandlers: {

      /**
       * Clean up the ickyness of globalness.
       */

      value: function _destroyGlobalEventHandlers() {
        delete window[this._playerReadyHandle];
        delete window[this._stateChangeHandle];
      }
    },
    _bindEvents: {

      /**
       * Listen for events coming from `player`.
       */

      value: function _bindEvents() {
        this._internalPlayer.addEventListener("onReady", this._playerReadyHandle);
        this._internalPlayer.addEventListener("onStateChange", this._stateChangeHandle);
      }
    },
    _unbindEvents: {

      /**
       * Remove all event bindings.
       */

      value: function _unbindEvents() {
        this._internalPlayer.removeEventListener("onReady", this._playerReadyHandle);
        this._internalPlayer.removeEventListener("onStateChange", this._stateChangeHandle);
      }
    }
  });

  return YouTube;
})(React.Component);

YouTube.propTypes = {
  // url to play. It's kept in sync, changing it will
  // cause the player to refresh and play the new url.
  url: React.PropTypes.string.isRequired,

  // custom ID for player element
  id: React.PropTypes.string,

  // Options passed to a new `YT.Player` instance
  // https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
  //
  // NOTE: Do not include event listeners in here, they will be ignored.
  //
  opts: React.PropTypes.object,

  // event subscriptions
  onReady: React.PropTypes.func,
  onPlay: React.PropTypes.func,
  onPause: React.PropTypes.func,
  onEnd: React.PropTypes.func
};

YouTube.defaultProps = {
  id: "react-yt-player",
  opts: {},
  onReady: function () {},
  onPlay: function () {},
  onPause: function () {},
  onEnd: function () {}
};

/**
 * Expose `YouTube`
 */

module.exports = YouTube;
jest.dontMock('../YouTube');

import React from 'react/addons';
import globalize from 'random-global';
import createPlayer from '../lib/createPlayer';
import YouTube from '../YouTube';

const { TestUtils } = React.addons;
const url = 'https://www.youtube.com/watch?v=tITYj52gXxU';
const url2 = 'https://www.youtube.com/watch?v=vW7qFzT7cbA';
let playerMock;

describe('YouTube Component', () => {
  beforeEach(() => {

    /**
     * Mock out YouTube player API
     */

     window.YT = {
      PlayerState: {
        ENDED: 0,
        PLAYING: 1,
        PAUSED: 2,
        BUFFERING: 3
      }
     };

    playerMock = {
      destroy: jest.genMockFunction(),
      addEventListener: jest.genMockFunction(),
      removeEventListener: jest.genMockFunction()
    };

    createPlayer.mockImplementation((props, cb) => cb(playerMock));
  });

  afterEach(() => {
    globalize.mockClear();
    createPlayer.mockClear();
  });

  describe('instantiation', () => {
    it('should render a YouTube API ready div', () => {
      const youtube = TestUtils.renderIntoDocument(<YouTube url={url} />);
      const div = TestUtils.findRenderedDOMComponentWithTag(youtube, 'div').getDOMNode();

      expect(div.getAttribute('id')).toBe('react-yt-player');
    });

    it('should create a new YouTube widget', () => {
      TestUtils.renderIntoDocument(<YouTube url={url} />);
      expect(createPlayer.mock.calls[0][0].id).toBe('react-yt-player');
    });
  });

  describe('appearance', () => {
    it('should accept a custom id', () => {
      const youtube = TestUtils.renderIntoDocument(<YouTube url={url} id={'custom-id'} />);
      const div = TestUtils.findRenderedDOMComponentWithTag(youtube, 'div').getDOMNode();

      expect(div.getAttribute('id')).toBe('custom-id');
    });
  });

  describe('functionality', () => {
    class Container extends React.Component {
      constructor() {
        this.state = {
          url: url
        };

        this._changeUrl = this._changeUrl.bind(this);
      }

      render() {
        return (
          <div>
            <YouTube url={this.state.url} />
            <button onClick={this._changeUrl} />
          </div>
        );
      }

      _changeUrl() {
        this.setState({url: url2});
      }
    }

    it('should load a `url`', () => {
      const container = TestUtils.renderIntoDocument(<Container />);
      const youtube = TestUtils.findRenderedComponentWithType(container, YouTube);

      // trigger player ready event.
      youtube._handlePlayerReady();

      expect(createPlayer.mock.calls[0][0].url).toBe(url);
    });

    it('should load new `url`s', () => {
      const container = TestUtils.renderIntoDocument(<Container />);
      const youtube = TestUtils.findRenderedComponentWithType(container, YouTube);
      const changeUrl = TestUtils.findRenderedDOMComponentWithTag(container, 'button');

      // trigger player ready event.
      youtube._handlePlayerReady();

      TestUtils.Simulate.click(changeUrl);

      expect(createPlayer.mock.calls[1][0].url).toBe(url2);
    });

    it('should only rerender for new `url`s', () => {
      const container = TestUtils.renderIntoDocument(<Container />);
      const youtube = TestUtils.findRenderedComponentWithType(container, YouTube);
      const changeUrl = TestUtils.findRenderedDOMComponentWithTag(container, 'button');

      // trigger player ready event.
      youtube._handlePlayerReady();

      // switch `url` to url2
      TestUtils.Simulate.click(changeUrl);
      expect(createPlayer.mock.calls.length).toBe(2);


      // calling it again won't do anything since `url` is already
      // url2
      TestUtils.Simulate.click(changeUrl);
      expect(createPlayer.mock.calls.length).toBe(2);
    });
  });

  describe('events', () => {
    it('should register event handlers onto the global namespace', () => {
      TestUtils.renderIntoDocument(<YouTube url={url} />);
      expect(globalize.mock.calls.length).toBe(2);
    });

    it('should bind event handlers to the player', () => {
      TestUtils.renderIntoDocument(<YouTube url={url} />);
      expect(playerMock.addEventListener.mock.calls.length).toBe(2);
    });

    it('should bind an event handler to player events', () => {
      const onReady = jest.genMockFunction();
      const youtube = TestUtils.renderIntoDocument(<YouTube url={url} onReady={onReady} />);

      youtube._handlePlayerReady();
      expect(onReady.mock.calls.length).toBe(1);
    });

    it('should bind event handler props to playback events', () => {
      const onPlay = jest.genMockFunction();
      const onPause = jest.genMockFunction();
      const onEnd = jest.genMockFunction();
      const youtube = TestUtils.renderIntoDocument(
        <YouTube url={url}
                 onPlay={onPlay}
                 onPause={onPause}
                 onEnd={onEnd}
        />
      );

      // video playing
      youtube._handlePlayerStateChange({data: window.YT.PlayerState.PLAYING});
      expect(onPlay.mock.calls.length).toBe(1);

      // video paused
      youtube._handlePlayerStateChange({data: window.YT.PlayerState.PAUSED});
      expect(onPlay.mock.calls.length).toBe(1);

      // video ended
      youtube._handlePlayerStateChange({data: window.YT.PlayerState.ENDED});
      expect(onEnd.mock.calls.length).toBe(1);
    });
  });

  describe('destruction', () => {

    /**
     * These tests use the regular methods of rendering components instead
     * of `TestUtils.renderIntoDocument`. TestUtils forces the component
     * into a detached DOM node, making it difficult to unmount.
     */

    it('should remove player event listeners when unmounted', () => {
      React.render(<YouTube url={url} />, document.body);
      React.unmountComponentAtNode(document.body);

      expect(playerMock.removeEventListener.mock.calls.length).toBe(2);
    });

    it('should destroy event handlers on the global namespace when unmounted', () => {
      window.fakeGlobalEventHandler = 'this is a fake event handler.';
      globalize.mockReturnValue('fakeGlobalEventHandler');

      React.render(<YouTube url={url} />, document.body);

      // trigger unmounting
      React.unmountComponentAtNode(document.body);
      expect(window.fakeGlobalEventHandler).not.toBeDefined();
    });

    it('should destroy the player/iframe when unmounted', () => {
      React.render(<YouTube url={url} />, document.body);

      // trigger unmounting
      React.unmountComponentAtNode(document.body);
      expect(playerMock.destroy.mock.calls.length).toBe(1);
    });
  });
});

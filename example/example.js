/**
 * Module dependencies
 */

import React from 'react';
import YouTube from '../';
import './example.css';

const url = 'http://www.youtube.com/watch?v=2g811Eo7K8U';
const url2 = 'http://www.youtube.com/watch?v=_OBlgSz8sSM';

class Example extends React.Component {
  constructor() {
    this.state = {
      url: url
    };

    this._changeUrl = this._changeUrl.bind(this);
  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: {
        fs: 0,
        modestbranding: 1,
        autohide: 1
      }
    };

    return (
      <div className='example'>
        <YouTube url={this.state.url}
                 id={'example-player'}
                 opts={opts}
                 onReady={this._onReady}
                 onPlay={this._onPlay}
                 onPause={this._onPause}
                 onEnd={this._onEnd} />

        <div className={'changeUrl'}>
          <button onClick={this._changeUrl}>Change url</button>
        </div>
      </div>
    );
  }

  _changeUrl() {
    this.setState({
      url: this.state.url === url ? url2 : url
    });
  }

  _onReady() {
    console.log('READY');
  }

  _onPlay() {
    console.log('PLAYING');
  }

  _onPause() {
    console.log('PAUSED');
  }

  _onEnd() {
    console.log('ENDED');
  }
}

React.render(<Example />, document.querySelector('section.content'));

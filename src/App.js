import React, { Component, Fragment } from 'react';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { IconButton } from '@rmwc/icon-button';
import { ThemeProvider } from '@rmwc/theme';
import { Grid, GridCell } from '@rmwc/grid';
import { LinearProgress } from '@rmwc/linear-progress';
import eyeson from 'eyeson';
import Toolbar from './Toolbar';
import Video from './Video';
import './App.css';

import RoomClient from './RoomClient';

const ACCESS_KEY_LENGTH = 24;
const API_KEY_LENGTH = 42;

class App extends Component {
  state = { stream: null, connecting: false, audio: true, video: true, guest_link: null, recording: false };
  roomClient = null;
  roomId = null;

  componentDidMount= () => {
    eyeson.onEvent(this.handleEvent);
  }

  handleEvent = (event) => {
    console.debug("TDX Eyeson event received ", JSON.stringify(event));

    switch(event.type) {
      case "accept":
        eyeson.send({ type: 'start_screen_capture', screen: true });
        // eyeson.send({ type: 'start_recording' });
        this.setState({
          local: event.localStream,
          stream: event.remoteStream,
          connecting: false,
        });
      break;
      default:
    }


    // if(event.connectionStatus === 'ready') {
    //   eyeson.join({ audio: true, video: true });
    //   // return ;
    // }

  }

  toggleAudio = () => {
    eyeson.send({
      type: 'change_stream',
      stream: this.state.localStream,
      video: this.state.video,
      audio: !this.state.audio,
    });
    this.setState({ audio: !this.state.audio });
  }

  toggleVideo = () => {
    eyeson.send({
      type: 'change_stream',
      stream: this.state.localStream,
      video: !this.state.video,
      audio: this.state.audio,
    });
    this.setState({ video: !this.state.video });
  }

  toggleRecording = () => {
    eyeson.send({
      type: this.state.recording ? 'stop_recording' : 'start_recording',
    });
    this.setState({ recording: !this.state.recording });
  }

  start = (event) => {
    const key = event.target.value.trim();
    if (key.length !== ACCESS_KEY_LENGTH) { return; }
    this.setState({ connecting: true });
    eyeson.start(key);
  }

  openRoom = async (event) => {
    const apiKey = event.target.value.trim();
    if (apiKey.length !== API_KEY_LENGTH) { return; }

    this.roomClient = new RoomClient(apiKey);

    this.setState({ connecting: true });

    const party = await this.roomClient.openRoom();
    // this.roomId = party.roomid???
    console.log("TDX Room opened\n", JSON.stringify(party));

    this.setState({ guest_link: party.links.guest_join });
    eyeson.start(party.access_key);

    const roomInfo = await this.roomClient.getRoomInfo(party.room.id);
    console.log("TDX Room info\n", JSON.stringify(roomInfo));
  }

  render() {
    return (
      <ThemeProvider options={{ primary: '#9e206c', secondary: '#6d6d6d' }}>
        <Toolbar title="TDX POC" />
        <Grid className="App">
          <GridCell span="12">
            {this.state.connecting && <LinearProgress determinate={false} />}
          </GridCell>
          <GridCell span="11">
            {!this.state.stream && (
              <Fragment>
                <TextField
                  label="API Access Key"
                  onChange={this.openRoom}
                  disabled={this.state.connecting}
                />
                <TextFieldHelperText>
                  Use your API access.
                </TextFieldHelperText>
                <div>
                  OR
                </div>
                <TextField
                  label="Meeting Access Key"
                  onChange={this.start}
                  disabled={this.state.connecting}
                />
                <TextFieldHelperText>
                  Get an user access key from starting a meeting via the API or
                  use one from an active meeting.
                </TextFieldHelperText>
              </Fragment>
            )}
            {this.state.stream && <Video src={this.state.stream} />}
          </GridCell>
          <GridCell span="1" className="App-sidebar">
            {this.state.stream && (
              <Fragment>
                <IconButton
                  checked={this.state.audio}
                  onClick={this.toggleAudio}
                  label="Toggle audio"
                  icon={this.state.audio ? 'mic' : 'mic_off'}
                />
                <IconButton
                  checked={this.state.video}
                  onClick={this.toggleVideo}
                  label="Toggle video"
                  icon={this.state.video ? 'videocam' : 'videocam_off'}
                />
                <IconButton
                  checked={this.state.recording}
                  onClick={this.toggleRecording}
                  label="Toggle recording"
                  icon={this.state.recording ? 'radio_button_checked' : 'radio_button_unchecked'}
                />
              </Fragment>
            )}
          </GridCell>
          <GridCell span="12">
            {this.state.guest_link && <><strong>Guest Link: </strong> <a rel="noopener noreferrer" target="_blank" href={this.state.guest_link} >{this.state.guest_link}</a></>}
          </GridCell>
        </Grid>
      </ThemeProvider>
    );
  }


}

export default App;
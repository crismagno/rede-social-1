import React, { Component } from "react"
import { View, Text, Button, Dimensions, TouchableOpacity, StyleSheet, Slider, Alert } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import * as Permissions from 'expo-permissions';
import helpers from '../../helpers/index'
const URL_API = helpers.URL_API

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;
const LOOPING_TYPE_ALL = 0;
const LOOPING_TYPE_ONE = 1;
const LOADING_STRING = "... loading ...";



export default class MessageAudio extends Component {

    constructor(props) {
        super(props);
        this.index = 0;
        this.isSeeking = false;
        this.shouldPlayAtEndOfSeek = false;
        this.playbackInstance = null;
        this.state = {
            showVideo: false,
            playbackInstanceName: LOADING_STRING,
            loopingType: LOOPING_TYPE_ALL,
            muted: false,
            playbackInstancePosition: null,
            playbackInstanceDuration: null,
            shouldPlay: false,
            isPlaying: false,
            isBuffering: false,
            isLoading: true,
            fontLoaded: false,
            shouldCorrectPitch: true,
            volume: 1.0,
            rate: 1.0,
            videoWidth: DEVICE_WIDTH,
            poster: false,
            useNativeControls: false,
            fullscreen: false,
            throughEarpiece: false
        };
    }

    async componentDidMount() {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false
        });

        await this._loadNewPlaybackInstance(false)
    }

    _askForPermissions = async () => {
        const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        this.setState({
            haveRecordingPermissions: response.status === 'granted',
        });
    };

    _onPlaybackStatusUpdate = status => {
        if (status.isLoaded) {
            this.setState({
                playbackInstancePosition: status.positionMillis,
                playbackInstanceDuration: status.durationMillis,
                shouldPlay: status.shouldPlay,
                isPlaying: status.isPlaying,
                isBuffering: status.isBuffering,
                rate: status.rate,
                muted: status.isMuted,
                volume: status.volume,
                loopingType: status.isLooping ? LOOPING_TYPE_ONE : LOOPING_TYPE_ALL,
                shouldCorrectPitch: status.shouldCorrectPitch
            });
        } else {
            if (status.error) {
                console.log(`FATAL PLAYER ERROR: ${status.error}`);
            }
        }
    };

    _updateScreenForLoading(isLoading) {
        if (isLoading) {
          this.setState({
            showVideo: false,
            isPlaying: false,
            playbackInstanceName: LOADING_STRING,
            playbackInstanceDuration: null,
            playbackInstancePosition: null,
            isLoading: true
          });
        } else {
          this.setState({
            isLoading: false
          });
        }
      }

    async _loadNewPlaybackInstance(playing) {
        if (this.playbackInstance != null) {
            await this.playbackInstance.unloadAsync();
            // this.playbackInstance.setOnPlaybackStatusUpdate(null);
            this.playbackInstance = null;
        }

        console.log(this.props.content)

        const source = { uri: `${URL_API}/files/messages?file=${this.props.content}` };
        const initialStatus = {
            shouldPlay: playing,
            rate: this.state.rate,
            shouldCorrectPitch: this.state.shouldCorrectPitch,
            volume: this.state.volume,
            isMuted: this.state.muted,
            isLooping: this.state.loopingType === LOOPING_TYPE_ONE
            // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
            // androidImplementation: 'MediaPlayer',
        };

        const { sound, status } = await Audio.Sound.createAsync(
            source,
            initialStatus,
            this._onPlaybackStatusUpdate
        );
        this.playbackInstance = sound;

        this._updateScreenForLoading(false);
    }

    _onPlayPausePressed = async () => {
        if (this.playbackInstance != null) {
            if (this.state.isPlaying) {
				this.playbackInstance.pauseAsync();
			} else {
				this.playbackInstance.playAsync();
			}
		}
    };
    
    _getSeekSliderPosition() {
		if (
			this.playbackInstance != null &&
			this.state.playbackInstancePosition != null &&
			this.state.playbackInstanceDuration != null
		) {
			return this.state.playbackInstancePosition / this.state.playbackInstanceDuration;
		}
		return 0;
    }
    
    _onSeekSliderValueChange = value => {
		if (this.playbackInstance != null && !this.isSeeking) {
			this.isSeeking = true;
			this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
			this.playbackInstance.pauseAsync();
		}
    };
    
    _onSeekSliderSlidingComplete = async value => {
		if (this.playbackInstance != null) {
			this.isSeeking = false;
			const seekPosition = value * this.state.playbackInstanceDuration;
			if (this.shouldPlayAtEndOfSeek) {
				this.playbackInstance.playFromPositionAsync(seekPosition);
			} else {
				this.playbackInstance.setPositionAsync(seekPosition);
			}
		}
    };

    _getMMSSFromMillis(millis) {
		const totalSeconds = millis / 1000;
		const seconds = Math.floor(totalSeconds % 60);
		const minutes = Math.floor(totalSeconds / 60);

		const padWithZero = number => {
			const string = number.toString();
			if (number < 10) {
				return '0' + string;
			}
			return string;
		};
		return padWithZero(minutes) + ':' + padWithZero(seconds);
	}
    
    _getPlaybackTimestamp() {
		if (
			this.playbackInstance != null &&
			this.state.playbackInstancePosition != null &&
			this.state.playbackInstanceDuration != null
		) {
			return `${this._getMMSSFromMillis(this.state.playbackInstancePosition)} / ${this._getMMSSFromMillis(
				this.state.playbackInstanceDuration
			)}`;
		}
		return '';
    }

    _trySetRate = async (rate, shouldCorrectPitch) => {
		if (this.playbackInstance != null) {
			try {
				await this.playbackInstance.setRateAsync(rate, shouldCorrectPitch);
			} catch (error) {
				// Rate changing could not be performed, possibly because the client's Android API is too old.
			}
		}
    };
    
    _onPitchCorrectionPressed = async value => {
		this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
	};
    
    _onRateSliderSlidingComplete = async value => {
		this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
	};

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.audioPartPlaySlider}>
                    <TouchableOpacity 
                        style={styles.btnGeneralAudio}
                        onPress={this._onPlayPausePressed}>
                        <Entypo name={this.state.isPlaying ? 'controller-paus' : 'controller-play'} size={30} color="#0009" />
                    </TouchableOpacity>

                    <Slider
                        style={styles.sliderAudio}
                        value={this._getSeekSliderPosition()}
                        onValueChange={this._onSeekSliderValueChange}
                        onSlidingComplete={this._onSeekSliderSlidingComplete}
                    />
                </View>

                <View style={styles.audioBottom}>
                    
                    <Text style={styles.playbackTimestamp}>
                        {this._getPlaybackTimestamp()}
                    </Text>
                    <Text style={styles.playbackTimestamp}>
                        {this.props.date}
                    </Text>

                    {/* <View style={styles.volumeContainer}>
                        <Text>Rate:</Text>
                        <Slider
                            value={this.state.rate / RATE_SCALE}
                            onSlidingComplete={this._onRateSliderSlidingComplete}
                        />
                        <TouchableOpacity
                            onPress={this._onPitchCorrectionPressed}>
                            <Text>
    
                                PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
                            </Text>
                        </TouchableOpacity>
                    </View> */}
                </View>


            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 5
    },

    btnsAudio: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center'
    },

    sliderAudio: {
        width: 189,
    },  

    btnGeneralAudio: {
        // padding: 3,
        fontSize: 20,
        // margin: 2,
        borderRadius: 100
    },

    playbackTimestamp: {
        marginHorizontal: 11,
        fontSize: 9
    },

    audioPartPlaySlider: {
        flexDirection: 'row'
    },

    audioBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

})
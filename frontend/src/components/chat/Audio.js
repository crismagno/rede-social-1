import React, { Component } from "react"
import { View, Text, Button, Dimensions, TouchableOpacity, StyleSheet, Slider, Alert } from 'react-native'
import Entypo from 'react-native-vector-icons/Entypo'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import * as Permissions from 'expo-permissions';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = '#FFF8ED';
const LIVE_COLOR = '#FF0000';
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;


export default class AudioComponent extends Component {

	constructor(props) {
		super(props);
		this.recording = null;
		this.sound = null;
		this.isSeeking = false;
		this.shouldPlayAtEndOfSeek = false;
		this.state = {
			haveRecordingPermissions: false,
			isLoading: false,
			isPlaybackAllowed: false,
			muted: false,
			soundPosition: null,
			soundDuration: null,
			recordingDuration: null,
			shouldPlay: false,
			isPlaying: false,
			isRecording: false,
			fontLoaded: false,
			shouldCorrectPitch: true,
			volume: 1.0,
			rate: 1.0,
			soundFile: null,
		};
		this.recordingSettings = JSON.parse(JSON.stringify(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY));
		// // UNCOMMENT THIS TO TEST maxFileSize:
		// this.recordingSettings.android['maxFileSize'] = 12000;
	}

	componentDidMount() {

		this._askForPermissions();
	}

	_askForPermissions = async () => {
		const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
		this.setState({
			haveRecordingPermissions: response.status === 'granted',
		});
	};

	_updateScreenForSoundStatus = status => {
		if (status.isLoaded) {
			this.setState({
				soundDuration: status.durationMillis,
				soundPosition: status.positionMillis,
				shouldPlay: status.shouldPlay,
				isPlaying: status.isPlaying,
				rate: status.rate,
				muted: status.isMuted,
				volume: status.volume,
				shouldCorrectPitch: status.shouldCorrectPitch,
				isPlaybackAllowed: true,
			});
		} else {
			this.setState({
				soundDuration: null,
				soundPosition: null,
				isPlaybackAllowed: false,
			});
			if (status.error) {
				console.log(`FATAL PLAYER ERROR: ${status.error}`);
			}
		}
	};

	_updateScreenForRecordingStatus = status => {
		if (status.canRecord) {
			this.setState({
				isRecording: status.isRecording,
				recordingDuration: status.durationMillis,
			});
		} else if (status.isDoneRecording) {
			this.setState({
				isRecording: false,
				recordingDuration: status.durationMillis,
			});
			if (!this.state.isLoading) {
				this._stopRecordingAndEnablePlayback();
			}
		}
	};

	async _stopPlaybackAndBeginRecording() {
		this.setState({
			isLoading: true,
		});
		if (this.sound !== null) {
			await this.sound.unloadAsync();
			this.sound.setOnPlaybackStatusUpdate(null);
			this.sound = null;
		}
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: true,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
			shouldDuckAndroid: true,
			interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
			playThroughEarpieceAndroid: false,
			staysActiveInBackground: true,
		});
		if (this.recording !== null) {
			this.recording.setOnRecordingStatusUpdate(null);
			this.recording = null;
		}

		const recording = new Audio.Recording();
		await recording.prepareToRecordAsync(this.recordingSettings);
		recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

		this.recording = recording;
		await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
		this.setState({
			isLoading: false,
		});
	}

	async _stopRecordingAndEnablePlayback() {
		this.setState({
			isLoading: true,
		});
		try {
			await this.recording.stopAndUnloadAsync();
		} catch (error) {
			// Do nothing -- we are already unloaded.
		}
		const info = await FileSystem.getInfoAsync(this.recording.getURI());
		console.log(`FILE INFO: ${JSON.stringify(info)}`);
		
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
			interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
			playsInSilentModeIOS: true,
			playsInSilentLockedModeIOS: true,
			shouldDuckAndroid: true,
			interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
			playThroughEarpieceAndroid: false,
			staysActiveInBackground: true,
		});
		const { sound, status } = await this.recording.createNewLoadedSoundAsync(
			{
				isLooping: true,
				isMuted: this.state.muted,
				volume: this.state.volume,
				rate: this.state.rate,
				shouldCorrectPitch: this.state.shouldCorrectPitch,
			},
			this._updateScreenForSoundStatus
		);
		this.sound = sound;
		this.setState({
			isLoading: false,
			soundFile: info
		});
	}

	_onRecordPressed = () => {
		if (this.state.isRecording) {
			this._stopRecordingAndEnablePlayback();
		} else {
			this._stopPlaybackAndBeginRecording();
		}
	};

	_onPlayPausePressed = () => {
		if (this.sound != null) {
			if (this.state.isPlaying) {
				this.sound.pauseAsync();
			} else {
				this.sound.playAsync();
			}
		}
	};

	_onStopPressed = () => {
		if (this.sound != null) {
			this.sound.stopAsync();
		}
	};

	_onMutePressed = () => {
		if (this.sound != null) {
			this.sound.setIsMutedAsync(!this.state.muted);
		}
	};

	_onVolumeSliderValueChange = value => {
		if (this.sound != null) {
			this.sound.setVolumeAsync(value);
		}
	};

	_trySetRate = async (rate, shouldCorrectPitch) => {
		if (this.sound != null) {
			try {
				await this.sound.setRateAsync(rate, shouldCorrectPitch);
			} catch (error) {
				// Rate changing could not be performed, possibly because the client's Android API is too old.
			}
		}
	};

	_onRateSliderSlidingComplete = async value => {
		this._trySetRate(value * RATE_SCALE, this.state.shouldCorrectPitch);
	};

	_onPitchCorrectionPressed = async value => {
		this._trySetRate(this.state.rate, !this.state.shouldCorrectPitch);
	};

	_onSeekSliderValueChange = value => {
		if (this.sound != null && !this.isSeeking) {
			this.isSeeking = true;
			this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
			this.sound.pauseAsync();
		}
	};

	_onSeekSliderSlidingComplete = async value => {
		if (this.sound != null) {
			this.isSeeking = false;
			const seekPosition = value * this.state.soundDuration;
			if (this.shouldPlayAtEndOfSeek) {
				this.sound.playFromPositionAsync(seekPosition);
			} else {
				this.sound.setPositionAsync(seekPosition);
			}
		}
	};

	_getSeekSliderPosition() {
		if (
			this.sound != null &&
			this.state.soundPosition != null &&
			this.state.soundDuration != null
		) {
			return this.state.soundPosition / this.state.soundDuration;
		}
		return 0;
	}

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
			this.sound != null &&
			this.state.soundPosition != null &&
			this.state.soundDuration != null
		) {
			return `${this._getMMSSFromMillis(this.state.soundPosition)} / ${this._getMMSSFromMillis(
				this.state.soundDuration
			)}`;
		}
		return '';
	}

	_getRecordingTimestamp() {
		if (this.state.recordingDuration != null) {
			return `${this._getMMSSFromMillis(this.state.recordingDuration)}`;
		}
		return `${this._getMMSSFromMillis(0)}`;
	}

	sendFile = () => {
		this.props.executeEventSend(this.state.soundFile)
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.containerRecordTime}>
					<Text style={styles.textTime}>{this._getRecordingTimestamp()}</Text>
					<View style={styles.btnsAudio}>
						<TouchableOpacity 
							style={styles.btnGeneralAudio}
							onPress={this._onRecordPressed}
							disabled={this.state.isLoading}
						>
							<Entypo name={this.state.isLoading ? 'controller-stop' : 'controller-record'} size={20} />
						</TouchableOpacity>
					</View>
				</View>

				<Slider
					value={this._getSeekSliderPosition()}
					onValueChange={this._onSeekSliderValueChange}
					onSlidingComplete={this._onSeekSliderSlidingComplete}
					disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
				/>
				<Text style={styles.playbackTimestamp}>
					{this._getPlaybackTimestamp()}
				</Text>

				{/* ------------ */}

				<View style={styles.volumeContainer}>
					
					<Slider
						value={1}
						onValueChange={this._onVolumeSliderValueChange}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
					/>
				</View>

				{/* ===================== */}

				<View style={styles.btnsExecutionAudio}>
					<TouchableOpacity
						style={styles.btnGeneralAudio}
						onPress={this._onPlayPausePressed}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
						<Entypo name={this.state.isPlaying ? 'controller-paus' : 'controller-play'} size={20} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.btnGeneralAudio}
						onPress={this._onStopPressed}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
						<Entypo name={'controller-stop'} size={20} />
					</TouchableOpacity>
					<TouchableOpacity
						underlayColor={BACKGROUND_COLOR}
						style={styles.btnGeneralAudio}
						onPress={this._onMutePressed}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
						<Entypo name={this.state.muted ? 'sound-mute' : 'sound'} size={20} />
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.btnGeneralAudio}
						onPress={this.sendFile}>
						<FontAwesome name="send" color="#000" size={20} /> 
					</TouchableOpacity>
				</View>

				{/* ===================----------------- */}

				<View style={styles.volumeContainer}>
					<Text>Rate:</Text>
					<Slider
						value={this.state.rate / RATE_SCALE}
						onSlidingComplete={this._onRateSliderSlidingComplete}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}
					/>
					<TouchableOpacity
						onPress={this._onPitchCorrectionPressed}
						disabled={!this.state.isPlaybackAllowed || this.state.isLoading}>
						<Text>
							PC: {this.state.shouldCorrectPitch ? 'yes' : 'no'}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: { 
		flex: 1,
		justifyContent: 'center', 
		alignContent: 'center',
		backgroundColor: '#FFF',
		width: DEVICE_WIDTH,
		padding: 20
	},

	btnsAudio: {
		flexDirection: 'row',
		justifyContent: 'center', 
		alignContent: 'center' 	
	},	

	btnGeneralAudio: {
		borderWidth: 1,
		padding: 10,
		fontSize: 20,
		margin: 2
	},

	textTime: {
		marginVertical: 30,
		textAlign: 'center',
		fontSize: 30,
	},

	playbackTimestamp: {

	},

	volumeContainer: {

	},

	btnsExecutionAudio: {
		flexDirection: 'row',
		justifyContent: 'center'
	},

	btnMuted: {
		borderWidth: 1,
		padding: 10,
		fontSize: 20,
		margin: 2,
		backgroundColor: '#cfcfcf'
	},

	containerRecordTime: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	}

}) 
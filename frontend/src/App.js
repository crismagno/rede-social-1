import React, { Component } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
const widthDimension = Dimensions.get('window').width

import Navigate from './navigation/index';
import { Provider } from "react-redux";
import store from './store/store'

export default class App extends Component {

	render = () => {
		return (
			<Provider store={store}>
				<View style={styles.scapeHeader}></View>
				<Navigate />
			</Provider>
		)
	}
}

const styles = StyleSheet.create({
	
	scapeHeader: {
		width: widthDimension,
		height: 27,
		backgroundColor: '#0001',
	}

});

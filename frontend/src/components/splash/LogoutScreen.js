import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, AsyncStorage, Alert } from 'react-native';

import { useSelector, useDispatch } from "react-redux";

export default props => {

    const dispatch = useDispatch({})
    const socket1 = useSelector(state => state.socket)

    const funcVerify = async () => {
        props.navigation.navigate("Auth")
        
        await AsyncStorage.setItem('user', JSON.stringify(''))
        dispatch({
            type: 'CHANGE_USER',
            payload: {}
        })

        socket1.socket.disconnect()

        dispatch({
            type: 'DELETE_SOCKET'
        })

    }

	useEffect(() => {

        funcVerify()
        
    }, [])
	
	return (
		<View style={styles.container}>
			<Text style={styles.text1}>Logout...</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#102027'
    },
    
    text1: {
        fontSize: 25,
        color: '#FFF'
    },
});

import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, AsyncStorage, Alert } from 'react-native';
import axios from 'axios'
import { useDispatch } from "react-redux";

import helpers from './../../helpers/index'
const URL_API = helpers.URL_API

export default props => {

    const dispatch = useDispatch({})

    const funcVerify = async () => {
        let userStringfy = await AsyncStorage.getItem('user')
        let userObj = JSON.parse(userStringfy)
        
        if(userObj && userObj.name) {
            setTextVerify('redirect')

            try {
                const response = await axios.get(`${URL_API}/users/find/${userObj.email}/${userObj.password}`)

                dispatch({
                    type: 'CHANGE_USER',
                    payload: response.data
                })
                setTimeout(() => props.navigation.navigate("Home"), 500)
            } catch (error) {
                props.navigation.navigate("Auth")
                dispatch({
                    type: 'CHANGE_USER',
                    payload: {}
                })
            }
        } else {
            setTextVerify('auth')
            setTimeout(() => props.navigation.navigate("Auth"), 500)
        }
    }

	useEffect(() => {

        funcVerify()

    }, [])
    
    const [textVerify, setTextVerify] = useState('')
	
	return (
		<View style={styles.container}>
			<Text style={styles.text1}>#</Text>
            { textVerify == 'redirect' && <Text style={styles.text2}>Redirecionando...</Text> }
            { textVerify == 'auth' && <Text style={styles.text2}>Bem vindo!</Text> }
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
        fontSize: 120,
        color: '#FFF'
    },

    text2: {
        fontSize: 20,
        color: '#FFF'
    }
});

import React, { useState } from 'react'
import axios from 'axios'
import { 
    Text, View, TouchableOpacity, StyleSheet, AsyncStorage,
    Dimensions, TextInput, ToastAndroid, Platform, Alert
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import helpers from '../../helpers/index'
const URL_API = helpers.URL_API
import io from 'socket.io-client'

import { useDispatch } from "react-redux";

export default props => {

    const dispatch = useDispatch({})

    let [name, setName] = useState('')
    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let [confirmPassword, setConfirmPassword] = useState('')
    let [mode, setMode] = useState('login')
    let [showPassword, setShowPassword] = useState(true)
    let [showConfirmPassword, setShowConfirmPassword] = useState(true)

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const setUserStateAsyncStore = async (obj) => {
		await AsyncStorage.setItem('user', JSON.stringify(obj))
	}

    const showPasswordMethod = type => {
        if (type == 'password') {
            setShowPassword(!showPassword)
        } else {
            setShowConfirmPassword(!showConfirmPassword)
        }
    }

    const changeMode = () => {
        let newMode = mode === 'login' ? 'signup' : 'login'
        setMode(newMode)
        setName('')
        setEmail('')
        setPassword('')
    }

    const confirmLogin = async () => {

        if (!email.trim()) {
            showToast('Informe email.')
            return
        } else if (!password.trim()) {
            showToast('Informe senha.')
            return
        }

        try {
            const response = await axios.get(`${URL_API}/users/find/${email.trim()}/${password.trim()}`)

            setUserStateAsyncStore(response.data)
                .then(() => {
                    dispatch({
                        type: 'CHANGE_USER',
                        payload: response.data
                    })

                    dispatch({
                        type: 'CREATE_SOCKET',
                        payload: io(`${URL_API}?id_user=${response.data._id}`, { 
                            transports: ['websocket'],
                            forceNew: true
                        })
                    })

                    



                    props.navigation.navigate("Home")
                })

        } catch (error) {
            showToast(error.response.data)
        }

    }

    const confirmSignup = async () => {

        if (!name.trim()) {
            showToast('Informe nome.')
            return
        } else if (!email.trim()) {
            showToast('Informe email.')
            return
        } else if (!password.trim()) {
            showToast('Informe senha.')
            return
        } else if (!confirmPassword.trim()) {
            showToast('Confirme sua senha.')
            return
        } 

        if ( password !== confirmPassword ) {
            showToast('Senhas não conferem.')
            return 
        }

        try {
            const response  = await axios.post(`${URL_API}/users/create`, {
                name: name.trim(),
                email: email.trim(),
                password: password.trim()
            })

            showToast(response.data)
            setMode('login')

        } catch (error) {
            showToast(error.response.data)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.textTitle}>{mode === 'login' ? 'Login' : 'Cadastrar'}</Text>
            <View style={styles.boxForm}>
                {
                mode !== 'login' && 
                <TextInput style={styles.input} placeholder="Nome..." 
                    value={name}
                    onChangeText={name => setName(name)} />
                }
                <TextInput style={styles.input} placeholder="Email..."
                    value={email} 
                    onChangeText={email => setEmail(email)}
                    textContentType='telephoneNumber'
                />

                <View style={{position: 'relative'}}>
                    <TextInput style={styles.input} placeholder="Senha..." 
                        value={password}
                        secureTextEntry={showPassword}
                        onChangeText={password => setPassword(password)}/>
                    <TouchableOpacity style={styles.btnEye}                        onPress={() => showPasswordMethod('password')}>
                        <Icon name={!showPassword ? 'eye' : 'eye-slash'} size={10} style={styles.eyeIcon} />
                    </TouchableOpacity>
                </View>
                
                {
                mode !== 'login' && 
                <View style={{position: 'relative'}}>
                    <TextInput style={styles.input} placeholder="Confirmar senha..." 
                        value={confirmPassword}
                        secureTextEntry={showConfirmPassword}
                        onChangeText={confirmPassword => setConfirmPassword(confirmPassword)}/>
                        <TouchableOpacity style={styles.btnEye}
                            onPress={() => showPasswordMethod('')}>
                            <Icon name={!showConfirmPassword ? 'eye' : 'eye-slash'} size={10} style={styles.eyeIcon} />
                        </TouchableOpacity>
                </View>
                }

                <TouchableOpacity style={styles.btnConfirm}
                    onPress={() => mode === 'login' ? confirmLogin() : confirmSignup()}>
                    <Text style={styles.textConfirm}>{mode === 'login' ? 'Entrar' : 'Cadastrar'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnMode}
                    onPress={() => changeMode()}>
                    <Text style={styles.textConfirm}>{mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Ir para login'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102027'
    },

    textTitle: {
        color: '#FFF',
        fontSize: 40,
        marginBottom: 20
    },

    boxForm: {
        width: (widthDimension / 1.2),
        minHeight: (heightDimension / 3),
    },

    input: {
        borderWidth: 1,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        padding: 10,
        paddingHorizontal: 20,
        paddingRight: 30,
        fontSize: 15,
        borderRadius: 30,
        marginBottom: 15
    },

    btnConfirm: {
        backgroundColor: '#005b9f',  
        padding: 15,
        fontSize: 15,
        borderRadius: 30,
        alignItems: 'center'
    },

    textConfirm: {
        color: '#FFF'
    },

    btnMode: {
        marginVertical: 15,
        alignItems: 'center'
    },

    btnEye: {
        position: 'absolute',
        right: 15,
        top: 16
    },

    eyeIcon: {
        color: '#0008',
        fontSize: 18
    }
})
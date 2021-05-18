import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Text, View, TouchableOpacity, StyleSheet, AsyncStorage,
    Dimensions, TextInput, ToastAndroid, Platform, Alert,
    Image, Button
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker';
import { hidden } from 'ansi-colors';

const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import helpers from './../../helpers/index'
const URL_API = helpers.URL_API

import { useDispatch, useSelector } from "react-redux";

export default props => {

    const dispatch = useDispatch({})
    const userStore = useSelector(state => state.user)

    useEffect(() => {

        funcVerify()

    }, [])

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const setUserStateAsyncStore = async (obj) => {
        await AsyncStorage.setItem('user', JSON.stringify(obj))
        setUser(obj)
        setUserCopy(obj)
	}

    const funcVerify = async () => {
        let userStringfy = await AsyncStorage.getItem('user')
        let userObj = JSON.parse(userStringfy)
        setUser(userObj)
        setUserCopy(userObj)
    }

   const _pickImage = async () => {
        try {

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [10, 10],
                quality: 1,
            });

            if (!result.cancelled) {
                setImage(result)
                updateAvatar(result)
            }

        } catch (E) {
            console.log(E);
        }
    };

    const updateAvatar = async image => {
        const data = new FormData();
      
        data.append('avatar', {
            name: 'teste',
            type: 'image/jpg',
            uri: Platform.OS === "android" ? image.uri : image.uri.replace("file://", "")
        })

        try {
            const response = await axios.post(`${URL_API}/users/update-avatar/${user._id}`, data)
            
            setUser({...user, avatar: response.data.avatar})

            dispatch({
                type: 'CHANGE_AVATAR',
                payload: response.data.avatar
            })

            setUserCopy({...user, avatar: response.data.avatar})

            setUserStateAsyncStore({...user, avatar: response.data.avatar})
            showToast('Avatar atualizado.')
        } catch (error) {
            showToast('ERROR ao atualizar avatar.')
            Alert.alert('ERRO', String(error))
        }
        
    };

    const cancelUpdate = () => {
        setMode('datas')
        setUser({...userCopy})
    }

    const updateUser = async () => {

        if (!user.name.trim()) {
            showToast('nome não pode ser vazio.')
            return
        } else if (!user.email.trim()) {
            showToast('email não pode ser vazio.')
            return
        } else if (!user.password.trim()) {
            showToast('senha não pode ser vazio.')
            return
        }

        try {

            let userUpdate = {
                name: user.name,
                email: user.email,
                password: user.password
            }
            
            const response = await axios.put(`${URL_API}/users/update/${user._id}`, userUpdate)

            setUser({
                ...user,
                name: response.name,
                email: response.email,
                password: response.password
            })

            setUserCopy({...user})

            setUserStateAsyncStore(user)
            showToast('Usuário atualizado!')

            setMode('datas')

        } catch (error) {
            showToast('ERROR')
        }

    }

    const [user, setUser] = useState({})
    const [userCopy, setUserCopy] = useState({})
    const [mode, setMode] = useState('datas')
    const [image, setImage] = useState(null)

    return (

        <View style={styles.container}>

            {/* <Text style={[styles[mode == 'update' ? 'textTitleUpdate' : 'textTitleMyData']]}>{mode == 'update' ? 'Atualizar' : 'Meus dados'}</Text> */}
           
            <View style={{}}>
                {/* <Text style={{color: '#FFF',zIndex: 100000000,position: 'relative', marginBottom: 10}}>{user.avatar}</Text> */}
                <TouchableOpacity style={styles.btnImage}
                    onPress={_pickImage}>
                    {
                        user.avatar ? <Image style={styles.imageUpdate} source={{ uri: `${URL_API}/files/?file=${user.avatar}` }} />
                        : 
                        <View style={styles.imageEmpty}>
                            <Icon name="ios-person" size={100} color="#0003" />
                            <Text style={styles.textImageEmpty}>Insira uma imagem</Text>
                        </View>
                    }
                </TouchableOpacity>
                
                <View style={[styles.status,styles[userStore.online_at ? 'statusOn' : 'statusOff']]}></View>
            </View>



            <View style={styles.boxForm}>

                <TextInput
                    style={ mode == 'update' ? styles.inputType1 : styles.inputType2}
                    value={user.name}
                    placeholder="Nome..."
                    editable={mode == 'update' ? true : false}
                    onChangeText={name => setUser({...user, name})}
                />

                <TextInput
                    style={ mode == 'update' ? styles.inputType1 : styles.inputType2}
                    value={user.email}
                    placeholder="Email..."
                    editable={mode == 'update' ? true : false}
                    onChangeText={email => setUser({...user, email})}
                />

                <TextInput
                    style={ mode == 'update' ? styles.inputType1 : styles.inputType2}
                    value={user.password}
                    placeholder="Senha..."
                    secureTextEntry={true}
                    editable={mode == 'update' ? true : false}
                    onChangeText={password => setUser({...user, password})}
                />

                <View style={styles.containerBtn}>
                    <TouchableOpacity style={mode == 'update' ? styles.btnEdit : styles.btnUpdate}
                        onPress={() => mode == 'update' ? updateUser() : setMode('update')}>
                        <Text style={styles.textConfirm}>{mode == 'update' ? 'Atualizar' : 'Editar'}</Text>
                    </TouchableOpacity>

                    {
                        mode == 'update' && 
                        <TouchableOpacity style={styles.btnCancel}
                            
                            
                            onPress={() => cancelUpdate()}>
                            <Text style={styles.textCancel}>Cancelar</Text>
                        </TouchableOpacity>
                    }
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },

    containerBtn: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        alignItems: 'stretch',
    },

    textTitleMyData: {
        color: '#7e57c2',
        fontSize: 20,
        marginBottom: 10
    },

    textTitleUpdate: {
        color: '#00e676',
        fontSize: 20,
        marginBottom: 10
    },

    boxForm: {
        width: (widthDimension / 1.2),
        minHeight: (heightDimension / 3),
        marginTop: 30
    },

    inputType1: {
        borderBottomWidth: 1,
        borderColor: '#00e676',
        backgroundColor: '#FFF',
        paddingVertical: 5,
        paddingHorizontal: 20,
        paddingRight: 30,
        fontSize: 15,
        borderRadius: 10,
        marginBottom: 15,
        color: "#0009"
    },

    inputType2: {
        borderBottomWidth: 1,
        borderColor: '#7e57c2',
        backgroundColor: '#FFF',
        color: '#7e57c2',
        paddingVertical: 5,
        paddingHorizontal: 20,
        paddingRight: 30,
        fontSize: 15,
        borderRadius: 10,
        marginBottom: 15
    },

    btnUpdate: {
        backgroundColor: '#7e57c2',
        padding: 15,
        fontSize: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: 320
    },

    btnEdit: {
        backgroundColor: '#00e676',
        padding: 15,
        fontSize: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        width: 160
    },

    btnCancel: {
        backgroundColor: '#ffd149',
        padding: 15,
        fontSize: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        width: 160
    },

    textConfirm: {
        color: '#FFF'
    },

    btnImage: {
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#0001',
        borderWidth: 1.5,
        width: 320,
        height: 250,
        borderRadius: 10,
        backgroundColor: '#FFF',
        overflow: 'hidden'
    },

    imageUpdate: {
        width: 320,
        height: 250
    },

    status: {
        position: 'absolute',
        left: 2,
        bottom: 6,
        width: 12,
        height: 12,
        borderColor: '#FFF',
        borderWidth: 0.5,
        borderRadius: 20,
        marginLeft: 4
    },

    statusOn: {
        backgroundColor: '#00e676',
    },

    statusOff: {
        backgroundColor: 'red',
    },

    imageEmpty: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    textImageEmpty: {
        color: '#0005',
        fontSize: 12
    }
});

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
    Text, View, TouchableOpacity, StyleSheet, AsyncStorage,
    Dimensions, TextInput, ToastAndroid, Platform, Alert,
    Image, Button
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av'

const widthDimension = Dimensions.get('window').width
const heightDimension = Dimensions.get('window').height

import helpers from '../../helpers/index'
const URL_API = helpers.URL_API

export default props => {

    const [user, setUser] = useState({})
    const [media, setMedia] = useState(null)
    const [description, setDescription] = useState('')

    useEffect(() => {

        funcVerify()

    }, [])

    const showToast = (text, time = 'LONG') => {
        ToastAndroid.show(String(text), ToastAndroid[time])
    }

    const funcVerify = async () => {
        let userStringfy = await AsyncStorage.getItem('user')
        let userObj = JSON.parse(userStringfy)
        setUser(userObj)
    }

   const _pickImage = async () => {
        try {

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [40, 40],
                quality: 1,
            });

            if (!result.cancelled) {
                setMedia(result)
            }

        } catch (E) {
            console.log(E);
        }
    };

    const sendPost = async () => {

        if (!media) {
            showToast('Mídia não selecionada.')
            return
        } else if (!description.trim()) {
            showToast('Descreva algo.')
            return
        }

        const data = new FormData();
      
        data.append('media', {
            name: 'post',
            type: media.type === 'image' ? 'image/jpg' : 'video/mp4',
            uri: Platform.OS === "android" ? media.uri : media.uri.replace("file://", "")
        })
        data.append('description', description.trim())
        data.append('author', user.name)

        try {
            await axios.post(`${URL_API}/posts/create/${user._id}`, data)
            props.navigation.navigate('Home')
            showToast('Post enviado.')
        } catch (error) {
            showToast('ERROR ao enviar post.')
            Alert.alert('ERRO', String(error))
        }
        
    };

    const mediaRender = () => {
        if (media) {
            if (media.type === 'image') {
                return <Image style={styles.mediaPost} source={{ uri: media.uri }} />
            } else {
                return <Video
                    style={styles.mediaPost}
                    source={{ uri: media.uri }}
                    rate={1.0}
                    volume={1.0}
                    resizeMode="stretch"
                    shouldPlay={false}
                    isLooping={true}
                    useNativeControls={true}
                    positionMillis={10}
                />
            }
        } else {
            return (
                <View style={{alignItems: 'center'}}>
                    <Icon name="ios-image" size={100} color="#0003" /> 
                    <Text style={{color: '#0003'}}>Adicione uma mídia</Text>
                </View>
            )
        }
    }

    return (

        <View style={styles.container}>

            {/* <Text style={styles.textTitle}>Postagem</Text> */}
           
            <View style={styles.containerMedia}>
                {mediaRender()}
                <TouchableOpacity style={styles.btnAddMedia}
                    onPress={_pickImage}>
                    <Icon name="ios-add" size={40} color="#FFF" /> 
                </TouchableOpacity>
            </View>

            <View style={styles.boxForm}>

                <TextInput
                    style={styles.inputType1}
                    value={description}
                    placeholder="Descrição..."
                    multiline={true}
                    // numberOfLines={4}
                    onChangeText={description => setDescription(description)}
                />

                <View style={styles.containerBtn}>
                    <TouchableOpacity style={styles.btnPost} 
                        onPress={() => sendPost()}>
                        <Text style={styles.textConfirm}>Postar</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFF'
    },

    containerMedia: {
        // position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#0003',
        borderBottomWidth: 1,
        width: widthDimension,
        height: 400,
        backgroundColor: '#FFF',
        borderRadius: 3
    },

    btnAddMedia: {
        position: 'absolute',
        backgroundColor: '#7e57c295',
        width: 60,
        height: 60,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        right: 170,
        bottom: -30
    },

    textTitle: {
        color: '#7e57c2',
        fontSize: 20,
        marginBottom: 10
    },

    boxForm: {
        width: (widthDimension / 1.1),
        minHeight: (heightDimension / 3),
        marginTop: 50
    },

    inputType1: {
        borderWidth: 1,
        borderColor: '#0003',
        backgroundColor: '#FFF',
        color: '#0007',
        padding: 10,
        paddingHorizontal: 20,
        paddingRight: 30,
        fontSize: 15,
        borderRadius: 10,
        marginBottom: 15,
        maxHeight: 100
    },

    mediaPost: {
        width: widthDimension,
        height: 400,
        borderColor: '#0003',
        borderWidth: 1,
    },

    btnPost: {
        backgroundColor: '#00e676',
        padding: 15,
        fontSize: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 0,
    },

    btnCancel: {
        backgroundColor: '#ffd149',
        padding: 15,
        fontSize: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 5,
        width: 160
    },

    textConfirm: {
        color: '#FFF'
    }
});

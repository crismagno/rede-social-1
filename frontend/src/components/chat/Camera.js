import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions, Modal, Image,
    Slider
} from 'react-native'
import { Camera } from 'expo-camera'
import { Video } from 'expo-av'

import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const { width: WIDTH_DIMENSIONS, height: HEIGHT_DIMENSIONS } = Dimensions.get('window')

export default props => {

    const [type, setType] = useState(Camera.Constants.Type.back)
    const [hasPermission, setHasPermission] = useState(null)
    const camRef = useRef(null)
    const [picture, setPicture] = useState(null)
    const [videoPicture, setVideoPicture] = useState(null)
    const [open, setOpen] = useState(false)
    const [load, setLoad] = useState(false)
    const [valueZoom, setValueZoom] = useState(0)
    const [valueFlash, setValueFlash] = useState(Camera.Constants.FlashMode.on)
    const [typeCamera, setTypeCamera] = useState('photo')
    const [playVideo, setPlayVideo] = useState(false)
    

    useEffect(() => {
        (async () => {
            const {status} = await Camera.requestPermissionsAsync()
            setHasPermission(status === 'granted')
        })()

        if (props.initWithVideo && props.initWithVideo === true) {
            setTypeCamera('video')
        }
    }, [])

    if (hasPermission === null) {
        return <View />
    }

    if (hasPermission === false) {
        return <Text>Acesso negado!</Text>
    }

    const changeType = () => {
        let valueTypeChange = type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
        setType(valueTypeChange)
    }

    async function takePicture() {
        if (camRef) {
            setLoad(true)

            const data = await camRef.current.takePictureAsync()

            if (props.takePicture) {
                props.takePicture(data)
            } else {
                setPicture(data)
                setOpen(true)
            }

            setLoad(false)
        }
    }

    async function exitCamera() {
        if (props.exitCamera) {
            props.exitCamera()
        } else {
            props.navigation.navigate('Home')
        }
    }

    function closePicture() {
        setPicture(null)
        setVideoPicture(null)
        setOpen(false)
    }

    const imageLoad = () => (
        <View style={styles.viewLoad}>
            <Image style={{ width: 70, height: 70}} source={require('./../../../assets/load-palet.gif')} />
        </View>
    )

    const changeTypeCamera = () =>{

        if (typeCamera == 'photo') {
            setTypeCamera('video')
        } else {
            setTypeCamera('photo')
        }
    }

    const executeVideo = async () => {
        if (playVideo) {
            if (camRef) {
                setPlayVideo(false)
                camRef.current.stopRecording()
            }
        } else {
            if (camRef) {
                try {
                    let config = {
                        quality: Camera.Constants.VideoQuality['2160p'],
                        maxDuration: 5000
                    }
                    setPlayVideo(true)
                    const data = await camRef.current.recordAsync(config)
                    if (props.takePicture) {
                        props.takePicture(data)
                    } else {
                        setVideoPicture(data)
                        setOpen(true)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    const changeModeFlash = () => {
        if (valueFlash == Camera.Constants.FlashMode.on) {
            setValueFlash(Camera.Constants.FlashMode.off)
        } else {
            setValueFlash(Camera.Constants.FlashMode.on)
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            <Camera 
                style={styles.containerCamera}
                type={type}
                ref={camRef}
                zoom={valueZoom}
                flashMode={valueFlash}
                ratio={"16:9"}
            >   

                {load && imageLoad}

                <View style={styles.optionsBottom}>
                    <TouchableOpacity 
                        style={styles.buttonChangeTypeCamera}
                        onPress={() => changeTypeCamera()}
                    >
                        <Feather name={typeCamera == 'photo' ? 'video' : 'camera'} size={20} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.buttonChangeTypeFlash}
                        onPress={() => changeModeFlash()}
                    >
                        <MaterialIcons name={valueFlash == Camera.Constants.FlashMode.on ? 'flash-on' : 'flash-off'} size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.containerButtons}>
                    <TouchableOpacity 
                        style={styles.btnType(1.22, 15)}
                        onPress={() => exitCamera()}
                    >
                        <Feather name="arrow-left" size={20} color="#FFF" />
                    </TouchableOpacity>

                    {
                        typeCamera == 'photo' ?
                        <TouchableOpacity 
                            style={styles.btnType(2.35)}
                            onPress={() => takePicture()}
                        >
                            <Feather name="camera" size={20} color="#FFF"/>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity 
                            style={[styles.btnType(2.35), { borderColor: playVideo ? 'red' : '#FFF'}]}
                            onPress={() => executeVideo()}
                        >
                            <Feather name={playVideo ? 'circle' : 'video'} size={20} color={playVideo ? 'red' : '#FFF'} />
                        </TouchableOpacity>
                    }



                    <TouchableOpacity 
                        style={styles.btnType(18, 15)}
                        onPress={() => changeType()}
                    >
                        <Feather name="refresh-ccw" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <Slider
                    style={styles.sliderZoom}
                    value={valueZoom}
                    onValueChange={value => setValueZoom(value)}
                    minimumValue={0}
                   maximumValue={1}
                   thumbTintColor="#FFF"
 
                />

            </Camera>

            {
                (picture || videoPicture) &&
                <Modal
                    style={styles.modal}
                    animationType="fade"
                    transparent={false}
                    visible={open}>

                <TouchableOpacity 
                    style={styles.btnType(18, 15)}
                    onPress={() => closePicture()}
                >
                    <Feather name="x" size={20} color="#000" />
                </TouchableOpacity> 

                    <View style={styles.containerIntoModal}>
                        {
                            picture && <Image style={{ width: WIDTH_DIMENSIONS -10, height: 500}} 
                            source={{uri: picture.uri}} />
                        }

                        { 
                            videoPicture && 
                            <Video
                                style={{ width: WIDTH_DIMENSIONS -10, height: 500}} 
                                source={{uri: videoPicture.uri}}
                                rate={1.0}
                                volume={1.0}
                                resizeMode="stretch"
                                shouldPlay={false}
                                isLooping={true}
                                useNativeControls={true}
                                positionMillis={10}
                            />
                        }
                    </View>    
                </Modal>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },

    containerCamera: {
        flex: 1,
        position: 'relative',
        justifyContent: 'flex-end'
    },

    containerIntoModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 300
    }, 
    
    containerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        width: WIDTH_DIMENSIONS,
        height: 100,
        padding: 10,
        position: 'relative'
    },  

    btnType(right_div, padding = 20) {
        return {
            // position: 'absolute',
            borderWidth: 1.5,
            padding,
            borderColor: '#FFF', 
            // right: WIDTH_DIMENSIONS/right_div,
            bottom: 10,
            borderRadius: 100
        }
    },

    modal: {
        maxHeight: HEIGHT_DIMENSIONS - 200,
        backgroundColor: 'red'
    },

    viewLoad: {
        flex: 1,
        width: WIDTH_DIMENSIONS,
        backgroundColor: '#0004',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },

    sliderZoom: {
        position: 'absolute',
        width: 200,
        right: -27,
        bottom: 190,
        transform: [{ rotate: "270deg" }],
        backgroundColor: '#0001'
    },

    optionsBottom: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: WIDTH_DIMENSIONS,
        height: 30,
        // borderWidth: 1,
        // borderColor: '#FFF',
        padding: 5
    },

    buttonChangeTypeCamera: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 50,
        borderRightWidth: 1,
        borderColor: '#FFF'
    },

    buttonChangeTypeFlash: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 50,
        // borderWidth: 1,
        borderColor: '#FFF' 
    }
})
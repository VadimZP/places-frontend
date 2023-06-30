import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import MapView, { Marker, Callout, type LongPressEvent } from 'react-native-maps'
import { useState, useEffect } from 'react'
import * as Location from 'expo-location'
import Toast from 'react-native-root-toast'

import { type LocationObject } from 'expo-location'
import { type HomeScreenProps, type Place } from '../types'

import { useCreatePlace, useFetchPlaces } from '../hooks/reactQuery'

export default function HomeScreen ({ navigation }: HomeScreenProps) {
  const [location, setLocation] = useState<LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | unknown>(null)
  const [isMapLoading, setIsMapLoading] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalStep, setModalStep] = useState(1)

  const [placeCoords, setPlaceCoords] = useState<{
    longitude: number | null
    latitude: number | null
  }>({ longitude: null, latitude: null })
  const [placeName, setPlaceName] = useState('')
  const [placeContent, setPlaceContent] = useState('')

  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)

  const { data: placesList } = useFetchPlaces()

  const mutation = useCreatePlace()

  useEffect(() => {
    (async () => {
      try {
        setIsMapLoading(true)

        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied')
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        setLocation(location)
      } catch (error: unknown) {
        setErrorMsg(error)
      } finally {
        setIsMapLoading(false)
      }
    })()
  }, [])

  function createPlaceHandler (event: LongPressEvent) {
    const { coordinate } = event.nativeEvent
    setPlaceCoords(coordinate)
    setIsModalVisible(true)
  }

  if (isMapLoading) {
    return (
        <SafeAreaView style={styles.container}>
          <Text>Loading the map...</Text>
        </SafeAreaView>
    )
  }

  if (typeof errorMsg === 'string') {
    return (
        <SafeAreaView style={styles.container}>
          <Text>{errorMsg}</Text>
        </SafeAreaView>
    )
  }

  if (location === null) {
    return (
        <SafeAreaView style={styles.container}>
          <Text>Cannot get information about your location</Text>
        </SafeAreaView>
    )
  }

  return (
      <SafeAreaView style={styles.container}>
        <MapView
          style={styles.map}
          onLongPress={createPlaceHandler}
          initialRegion={{
            longitude: location?.coords.longitude,
            latitude: location?.coords.latitude,
            longitudeDelta: 0.01,
            latitudeDelta: 0.01
          }}
        >
          {placesList?.map((place: Place) => {
            const [longitude, latitude] = place.location
              .replace(/POINT\(|\)/g, '')
              .split(' ')

            return (
              <Marker
                key={place.id}
                coordinate={{
                  longitude: +longitude,
                  latitude: +latitude
                }}
              >
                <Callout
                  onPress={() => {
                    setIsModalVisible(true)
                    setSelectedPlaceId(place.id)
                    setModalStep(3)
                  }}
                >
                  <View>
                    <Text>{place.name}</Text>
                  </View>
                </Callout>
              </Marker>
            )
          })}
        </MapView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {
            setIsModalVisible(!isModalVisible)
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.centeredView}>
              {modalStep === 1 && (
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Let&apos;s create a new place!</Text>
                  <Text style={styles.modalText}>Are you ready?</Text>
                  <View style={styles.buttonsWrapper}>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        setModalStep(2)
                      }}
                    >
                      <Text style={styles.textStyle}>Yes</Text>
                    </Pressable>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        setIsModalVisible(!isModalVisible)
                      }}
                    >
                      <Text style={styles.textStyle}>No</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {modalStep === 2 && (
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>Great! Name your new place</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Place name</Text>
                    <TextInput
                      style={styles.input}
                      value={placeName}
                      onChangeText={setPlaceName}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Place description</Text>
                    <TextInput
                      style={styles.textarea}
                      multiline
                      numberOfLines={5}
                      value={placeContent}
                      onChangeText={setPlaceContent}
                    />
                  </View>
                  <View style={styles.buttonsWrapper}>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        if (
                          placeCoords.longitude === null ||
                          placeCoords.latitude === null
                        ) {
                          console.error(
                            'Something went wrong with latitude and longitude'
                          )
                          return
                        }
                        mutation.mutate(
                          {
                            name: placeName,
                            content: placeContent,
                            location: `POINT(${placeCoords.longitude} ${placeCoords.latitude})`
                          },
                          {
                            onSuccess: () => {
                              Toast.show(
                                'Your new place was successfully created!',
                                {
                                  duration: Toast.durations.SHORT,
                                  position: 40
                                }
                              )

                              setPlaceName('')
                              setPlaceContent('')

                              setIsModalVisible(!isModalVisible)
                            }
                          }
                        )
                      }}
                    >
                      <Text style={styles.textStyle}>Confirm</Text>
                    </Pressable>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        setModalStep(1)
                        setPlaceName('')
                        setPlaceContent('')
                        setIsModalVisible(!isModalVisible)
                      }}
                    >
                      <Text style={styles.textStyle}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {modalStep === 3 && (
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>
                    Want to get a detailed info about this place?
                  </Text>
                  <View style={styles.buttonsWrapper}>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        setModalStep(1)
                        setIsModalVisible(!isModalVisible)
                        if (selectedPlaceId !== null) {
                          navigation.navigate('Place', {
                            placeId: selectedPlaceId
                          })
                        }
                      }}
                    >
                      <Text style={styles.textStyle}>Yes</Text>
                    </Pressable>
                    <Pressable
                      style={styles.button}
                      onPress={() => {
                        setModalStep(1)
                        setIsModalVisible(!isModalVisible)
                        setSelectedPlaceId(null)
                      }}
                    >
                      <Text style={styles.textStyle}>No</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalView: {
    width: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  textWrapper: {
    textAlign: 'center'
  },
  buttonsWrapper: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
    width: 120
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    textAlign: 'center',
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 16
  },
  inputLabel: {
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    padding: 10,
    height: 40
  },
  textarea: {
    textAlignVertical: 'top',
    borderWidth: 1,
    padding: 10,
    height: 100
  }
})
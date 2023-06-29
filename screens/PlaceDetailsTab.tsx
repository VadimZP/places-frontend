import { Camera, type CameraCapturedPicture, CameraType } from 'expo-camera'
import { memo, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native'
import { type QueryClient, useQueryClient } from 'react-query'

import { decode } from 'base64-arraybuffer'
import Toast from 'react-native-root-toast'

import { type Place, PlaceScreenProps } from '../types'
import { supabase } from '../supabase'
import { useCreateReview } from '../hooks/reactQuery'

function PlaceDetailsTab ({ placeId }) {
  const queryClient: QueryClient = useQueryClient()

  const place = queryClient
    .getQueryData<Place[]>('places')
    ?.find((place) => place.id === placeId)

  const [type, setType] = useState(CameraType.back)
  const [permission, requestPermission] = Camera.useCameraPermissions()

  const cameraRef = useRef<Camera | null>(null)
  const [photos, setPhotos] = useState<CameraCapturedPicture[] | []>([])

  const [isCameraReady, setIsCameraReady] = useState(false)

  const [isCameraComponentVisible, setIsCameraComponentVisible] =
    useState(false)

  const [isMediaLoading, setIsMediaLoading] = useState(false)

  const [placePhotos, setPlacePhotos] = useState<
  Array<{ id: string, url: string }> | []
  >([])

  useEffect(() => {
    async function fetchImagesFromFolder () {
      const { data, error } = await supabase.storage
        .from('places')
        .list(`${placeId}`)

      if (error != null) {
        console.error(error)
        return
      }

      if (data && data.length > 0) {
        const imageUrls: Array<{ id: string, url: string }> = []

        try {
          await Promise.all(
            data.map(async (item) => {
              const { data } = await supabase.storage
                .from('places')
                .getPublicUrl(`${placeId}/${item.name}`)
              imageUrls.push({ id: data.publicUrl, url: data.publicUrl })
            })
          )
          setPlacePhotos(imageUrls)
        } catch (error) {
          console.error('Failed to fetch image URLs:', error)
        }
      } else {
        console.log('No images found in the folder')
      }
    }

    // Call the function to fetch the images
    fetchImagesFromFolder()
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.name}>{place?.name}</Text>
          <Text style={styles.content}>{place?.content}</Text>
        </View>
        <Pressable
          style={styles.button}
          onPress={() => {
            setIsCameraComponentVisible(true)
          }}
        >
          <Text style={styles.textStyle}>Add photos</Text>
        </Pressable>

        {placePhotos.length
          ? (
          <FlatList
            horizontal
            data={placePhotos}
            renderItem={({ item }) => (
              <Image
                key={item.url}
                source={{ uri: item.url }}
                style={styles.placeImg}
              />
            )}
            keyExtractor={(item) => item.id}
          />
            )
          : null}

        {isCameraComponentVisible && (
          <View style={{ flex: 1 }}>
            {(permission == null)
              ? (
              <View>
                <Text>Loading your camera...</Text>
              </View>
                )
              : !permission?.granted
                  ? (
              <View>
                <Text>
                  We need your permission to show the camera. Try again
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" />
              </View>
                    )
                  : (
              <View style={{ flex: 1 }}>
                <Camera
                  style={{ width: '100%', height: 350 }}
                  type={type}
                  ref={cameraRef}
                  onCameraReady={() => {
                    setIsCameraReady(true)
                  }}
                />
                {isCameraReady && (
                  <Button
                    title="Take a photo"
                    onPress={async () => {
                      if ((cameraRef.current != null) && isCameraReady) {
                        cameraRef.current
                        const newPhoto =
                          await cameraRef.current.takePictureAsync({
                            base64: true
                          })
                        setPhotos((prevPhotos) => [...prevPhotos, newPhoto])
                      }
                    }}
                  />
                )}
                {photos.length
                  ? (
                  <>
                    <ScrollView
                      horizontal
                      contentContainerStyle={{
                        paddingTop: 12
                      }}
                    >
                      {photos.map((photo) => {
                        return (
                          <Image
                            key={photo.uri}
                            source={{ uri: photo.uri }}
                            style={{ width: 100, height: 100, marginRight: 10 }}
                          />
                        )
                      })}
                    </ScrollView>
                    <Pressable
                      style={styles.button}
                      onPress={async () => {
                        setIsMediaLoading(true)

                        const arrayOfPromises = photos.map(async (photo) =>
                          await supabase.storage
                            .from('places')
                            .upload(
                              `${placeId}/${photo.uri
                                .split('/')
                                .pop()}`,
                              decode(photo.base64),
                              {
                                contentType: 'image/jpeg'
                              }
                            )
                            .then((result) => {
                              if (result.error != null) {
                                throw new Error(result.error.message)
                              }
                            })
                            .catch((error) => {
                              return { error }
                            })
                        )
                        try {
                          const result = await Promise.all(arrayOfPromises)

                          if (result[0]?.error) {
                            throw new Error(result[0].error.message)
                          }

                          setPhotos([])

                          Toast.show(
                            'Your photos were successfully uploaded!',
                            {
                              duration: Toast.durations.LONG,
                              position: 40
                            }
                          )
                        } catch (error) {
                          let errorMessage
                          if (
                            error !== null &&
                            typeof error === 'object' &&
                            'message' in error &&
                            typeof error.message === 'string'
                          ) {
                            errorMessage = error.message
                          } else if (typeof error === 'string') {
                            errorMessage = error
                          } else {
                            errorMessage = 'An unknown error occurred'
                          }

                          Toast.show(errorMessage, {
                            duration: Toast.durations.LONG,
                            position: 40,
                            backgroundColor: '#bf0000'
                          })
                        } finally {
                          setIsMediaLoading(false)
                        }
                      }}
                    >
                      {isMediaLoading
                        ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                          )
                        : (
                        <Text style={styles.textStyle}>Upload photos</Text>
                          )}
                    </Pressable>
                  </>
                    )
                  : null}
              </View>
                    )}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default memo(PlaceDetailsTab)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff8e7',
    flex: 1
  },
  wrapper: {
    flex: 1,
    padding: 16
  },
  name: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#412e00',
    fontSize: 18,
    marginBottom: 20
  },
  content: {
    color: '#412e00',
    fontSize: 14
  },
  placeImg: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#412e00'
  },
  button: {
    borderRadius: 6,
    padding: 10,
    shadowColor: '#412e00',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,

    elevation: 3,
    borderColor: '#808080',
    borderWidth: 1,
    backgroundColor: '#e6edff',

    marginBottom: 20
  },
  textStyle: {
    fontSize: 14,
    color: '#412e00',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase'
  }
})

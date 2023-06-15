import { Camera, CameraCapturedPicture, CameraType } from "expo-camera";
import { useRef, useState } from "react";
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
} from "react-native";
import { QueryClient, useQueryClient } from "react-query";

import { decode } from "base64-arraybuffer";
import Toast from "react-native-root-toast";

import { Place, PlaceScreenProps } from "../types";
import { supabase } from "../initSupabase";

export default function PlaceDetailsScreen({ route }: PlaceScreenProps) {
  const queryClient: QueryClient = useQueryClient();

  const place = queryClient
    .getQueryData<Array<Place>>("places")
    ?.find((place) => place.id === route.params.placeId);

  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const cameraRef = useRef<Camera | null>(null);
  const [photos, setPhotos] = useState<Array<CameraCapturedPicture> | []>([]);

  const [isCameraReady, setIsCameraReady] = useState(false);

  const [isCameraComponentVisible, setIsCameraComponentVisible] =
    useState(false);

  const [isMediaLoading, setIsMediaLoading] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.name}>{place?.name}</Text>
      <Text style={styles.content}>{place?.content}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          setIsCameraComponentVisible(true);
        }}
      >
        <Text style={styles.textStyle}>Add photos</Text>
      </Pressable>
      {isCameraComponentVisible && (
        <View style={{ flex: 1 }}>
          {!permission ? (
            <View>
              <Text>Loading your camera...</Text>
            </View>
          ) : !permission?.granted ? (
            <View>
              <Text>We need your permission to show the camera. Try again</Text>
              <Button onPress={requestPermission} title="Grant Permission" />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Button
                title="Take a photo"
                onPress={async () => {
                  if (cameraRef.current && isCameraReady) {
                    cameraRef.current;
                    const newPhoto = await cameraRef.current.takePictureAsync({
                      base64: true,
                    });
                    setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
                  }
                }}
              />
              <Camera
                style={{ width: "100%", height: 350 }}
                type={type}
                ref={cameraRef}
                onCameraReady={() => {
                  setIsCameraReady(true);
                }}
              />
              {photos.length ? (
                <>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{
                      paddingTop: 12,
                    }}
                  >
                    {photos.map((photo) => {
                      return (
                        <Image
                          key={photo.uri}
                          source={{ uri: photo.uri }}
                          style={{ width: 100, height: 100, marginRight: 10 }}
                        />
                      );
                    })}
                  </ScrollView>
                  <Pressable
                    style={styles.button}
                    onPress={async () => {
                      setIsMediaLoading(true);

                      const arrayOfPromises = photos.map((photo) =>
                        supabase.storage
                          .from("places")
                          .upload(
                            `${place.name}/${photo.uri.split("/").pop()}`,
                            decode(photo.base64),
                            {
                              contentType: "image/jpeg",
                            }
                          )
                          .then((result) => {
                            if (result.error) {
                              throw new Error(result.error.message);
                            }
                          })
                          .catch((error) => {
                            return { error };
                          })
                      );
                      try {
                        const result = await Promise.all(arrayOfPromises);

                        if (result[0]?.error) {
                          console.log(result[0].error);
                          throw new Error(result[0].error.message);
                        }

                        setPhotos([]);

                        Toast.show("Your photos were successfully uploaded!", {
                          duration: Toast.durations.LONG,
                          position: 40,
                        });
                      } catch (error) {
                        Toast.show(error.message, {
                          duration: Toast.durations.LONG,
                          position: 40,
                          backgroundColor: "#bf0000",
                        });
                      } finally {
                        setIsMediaLoading(false);
                      }
                    }}
                  >
                    {isMediaLoading ? (
                      <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                      <Text style={styles.textStyle}>Upload photos</Text>
                    )}
                  </Pressable>
                </>
              ) : null}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 16,
    marginBottom: 20,
  },
  content: {
    fontSize: 14,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    width: 120,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

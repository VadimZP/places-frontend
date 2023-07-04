import { Camera, type CameraCapturedPicture, CameraType } from "expo-camera";
import { memo, useEffect, useRef, useState } from "react";
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
  FlatList,
  Alert,
  Modal
} from "react-native";
import { type QueryClient, useQueryClient } from "react-query";
import { decode } from "base64-arraybuffer";
import Toast from "react-native-root-toast";
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import { Entypo } from "@expo/vector-icons";

import type { PlaceDetailsTabProps, Place, PlaceScreenProps } from "../types";
import { supabase } from "../supabase";

function PlaceDetailsTab(
  props: PlaceDetailsTabProps & {
    placeId: number;
    placeScreenNavigation: PlaceScreenProps["navigation"];
  }
) {
  const { placeId, placeScreenNavigation } = props;

  const queryClient: QueryClient = useQueryClient();

  const place = queryClient
    .getQueryData<Place[]>("places")
    ?.find((place) => place.id === placeId);

  const [type] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const cameraRef = useRef<Camera | null>(null);
  const [photos, setPhotos] = useState<CameraCapturedPicture[] | []>([]);

  const [isCameraReady, setIsCameraReady] = useState(false);

  const [isCameraComponentVisible, setIsCameraComponentVisible] =
    useState(false);

  const [isMediaLoading, setIsMediaLoading] = useState(false);

  const [placePhotos, setPlacePhotos] = useState<
    Array<{ id: string; url: string }> | []
  >([]);

  useEffect(() => {
    async function fetchImagesFromFolder() {
      const { data: imagesFromStorage, error } = await supabase.storage
        .from("places")
        .list(`${placeId}`);

      if (error != null) {
        console.error(error);
        return;
      }

      if (imagesFromStorage != null && imagesFromStorage.length > 0) {
        const imageUrls: Array<{ id: string; url: string }> =
          imagesFromStorage.map((image) => {
            const { data } = supabase.storage
              .from("places")
              .getPublicUrl(`${placeId}/${image.name}`);

            return { id: data.publicUrl, url: data.publicUrl };
          });

        setPlacePhotos(imageUrls);
      } else {
        console.log("No images found in the folder");
      }
    }

    void fetchImagesFromFolder();
  }, []);

  async function takeAPhoto() {
    if (cameraRef.current != null && isCameraReady) {
      const newPhoto = await cameraRef.current.takePictureAsync({
        base64: true
      });
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
    }
  }

  async function uploadNewPhotos() {
    setIsMediaLoading(true);

    for (const photo of photos) {
      const photoNameAndExtension = photo.uri.split("/").pop();
      if (photo.base64 != null && typeof photoNameAndExtension === "string") {
        const { error } = await supabase.storage
          .from("places")
          .upload(`${placeId}/${photoNameAndExtension}`, decode(photo.base64), {
            contentType: "image/jpeg"
          });

        if (error != null) {
          let errorMessage;

          if (
            error !== null &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
          ) {
            errorMessage = error.message;
          } else if (typeof error === "string") {
            errorMessage = error;
          } else {
            errorMessage = "An unknown error occurred";
          }

          Toast.show(errorMessage, {
            duration: Toast.durations.LONG,
            position: 40,
            backgroundColor: "#bf0000"
          });
        } else {
          setPhotos([]);

          Toast.show("Your photos were successfully uploaded!", {
            duration: Toast.durations.LONG,
            position: 40
          });
        }
        setIsMediaLoading(false);
        setIsCameraComponentVisible(false);
      }
    }
  }

  const [selectedOption, setSelectedOption] = useState(0);

  const menuElem = useRef();

  useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    placeScreenNavigation.setOptions({
      headerRight: () => (
        <Entypo
          onPress={() => {
            menuElem.current.open();
          }}
          name="dots-three-vertical"
          size={24}
          color="black"
        />
      )
    });
  }, [placeScreenNavigation]);

  function onOptionSelect(value) {
    if (value === 1) {
      setIsModalVisible(true);
    }
  }
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        visible={isModalVisible}
        onShow={() => {
          setIsCameraComponentVisible(true);
        }}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            {isCameraComponentVisible && (
              <View style={{ flex: 1 }}>
                {permission == null ? (
                  <View>
                    <Text>Loading your camera...</Text>
                  </View>
                ) : !permission?.granted ? (
                  <View>
                    <Text>
                      We need your permission to show the camera. Try again
                    </Text>
                    <Button
                      onPress={requestPermission}
                      title="Grant Permission"
                    />
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <Camera
                      style={{ width: "100%", height: 350 }}
                      type={type}
                      ref={cameraRef}
                      onCameraReady={() => {
                        setIsCameraReady(true);
                      }}
                    />
                    {isCameraReady && (
                      <Button title="Take a photo" onPress={takeAPhoto} />
                    )}
                    {photos.length > 0 && (
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
                                style={{
                                  width: 100,
                                  height: 100,
                                  marginRight: 10
                                }}
                              />
                            );
                          })}
                        </ScrollView>
                        <Pressable
                          style={styles.button}
                          onPress={uploadNewPhotos}
                        >
                          {isMediaLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                          ) : (
                            <Text style={styles.textStyle}>Upload photos</Text>
                          )}
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </View>
            )}
            <Pressable
              style={[styles.button]}
              onPress={() => {
                setIsModalVisible(false);
              }}
            >
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.wrapper}>
        <MenuProvider style={{ flexDirection: "column" }}>
          <Menu
            ref={menuElem}
            onSelect={(value) => {
              onOptionSelect(value);
            }}
          >
            <MenuTrigger text="Select option" style={{ display: "none" }} />
            <MenuOptions>
              <MenuOption value={1} text="Add photos" />
              <MenuOption value={2}>
                <Text style={{ color: "red" }}>Edit place</Text>
              </MenuOption>
              <MenuOption value={3} disabled={true} text="Delete place" />
            </MenuOptions>
          </Menu>
        </MenuProvider>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.name}>{place?.name}</Text>
          <Text style={styles.content}>{place?.content}</Text>
        </View>

        {placePhotos.length > 0 && (
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
        )}
      </View>
    </SafeAreaView>
  );
}

export default memo(PlaceDetailsTab);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff8e7",
    flex: 1
  },
  wrapper: {
    flex: 1,
    padding: 16
  },
  name: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#412e00",
    fontSize: 18,
    marginBottom: 20
  },
  content: {
    color: "#412e00",
    fontSize: 14
  },
  placeImg: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#412e00"
  },
  button: {
    borderRadius: 6,
    padding: 10,
    shadowColor: "#412e00",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,

    elevation: 3,
    borderColor: "#808080",
    borderWidth: 1,
    backgroundColor: "#e6edff",

    marginBottom: 20
  },
  textStyle: {
    fontSize: 14,
    color: "#412e00",
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase"
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

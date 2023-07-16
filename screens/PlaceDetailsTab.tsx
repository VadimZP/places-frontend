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
  Modal,
  TextInput
} from "react-native";
import { type QueryClient, useQueryClient } from "react-query";
import { decode } from "base64-arraybuffer";
import Toast from "react-native-root-toast";

import { Entypo } from "@expo/vector-icons";

import type { PlaceDetailsTabProps, Place, PlaceScreenProps } from "../types";
import { supabase } from "../supabase";
import PopupMenu from "../components/PopupMenu";

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

  function removePhoto(photo) {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((item) => item.uri !== photo.uri)
    );
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

          if (typeof error === "string") {
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
  const [isPopupMenuVisible, setIsPopupMenuVisible] = useState(false);
  const [photoInFullSize, setPhotoInFullSize] =
    useState<CameraCapturedPicture | null>(null);

  useEffect(() => {
    placeScreenNavigation.setOptions({
      headerRight: () => (
        <Entypo
          onPress={() => {
            setIsPopupMenuVisible((prev) => !prev);
          }}
          name="dots-three-vertical"
          size={24}
          color="black"
        />
      )
    });
  }, [placeScreenNavigation]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDiscardChangesModalVisible, setIsDiscardChangesModalVisible] =
    useState(false);

  const menuItems = [
    {
      name: "Add photos",
      onPress: () => {
        setIsModalVisible(!isModalVisible);
      }
    },
    { name: "Edit place", onPress: () => {} },
    { name: "Delete place", onPress: () => {} }
  ];

  const [isContentEditable, setIsContentEditable] = useState(true);
  const [placeContent, setPlaceContent] = useState(place?.content);

  return (
    <SafeAreaView style={styles.container}>
      {isPopupMenuVisible && <PopupMenu menuItems={menuItems} />}

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
        <SafeAreaView style={{ flex: 1 }}>
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
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                    type={type}
                    ref={cameraRef}
                    onCameraReady={() => {
                      setIsCameraReady(true);
                    }}
                  >
                    {isCameraReady && (
                      <Pressable
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 50,
                          width: 60,
                          height: 60,
                          position: "absolute",
                          bottom: 160
                        }}
                        onPress={takeAPhoto}
                      />
                    )}
                  </Camera>

                  {photos.length > 0 && (
                    <View
                      style={{
                        backgroundColor: "#fff",
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%"
                      }}
                    >
                      {photoInFullSize !== null && (
                        <Modal animationType="slide">
                          <SafeAreaView
                            style={{
                              flex: 1,
                              position: "relative"
                            }}
                          >
                            <Image
                              source={{ uri: photoInFullSize.uri }}
                              style={{
                                flex: 1
                              }}
                            />

                            <Pressable
                              style={{
                                backgroundColor: "#fff",
                                borderRadius: 6,
                                width: 30,
                                height: 30,
                                position: "absolute",
                                top: 80,
                                right: 40,
                                justifyContent: "center",
                                alignItems: "center"
                              }}
                              onPress={() => {
                                setPhotoInFullSize(null);
                              }}
                            >
                              <Text
                                style={{ fontSize: 18, fontWeight: "bold" }}
                              >
                                X
                              </Text>
                            </Pressable>
                          </SafeAreaView>
                        </Modal>
                      )}
                      <ScrollView
                        horizontal
                        contentContainerStyle={{
                          padding: 10
                        }}
                      >
                        {photos.map((photo) => {
                          return (
                            <Pressable
                              onPress={() => setPhotoInFullSize(photo)}
                              key={photo.uri}
                              style={{
                                position: "relative",
                                marginRight: 16,
                                borderWidth: 4,
                                borderRadius: 6,
                                width: 100,
                                height: 100
                              }}
                            >
                              <Pressable
                                style={{
                                  position: "absolute",
                                  right: -10,
                                  top: -10,
                                  backgroundColor: "red",
                                  borderRadius: 50,
                                  borderWidth: 4,
                                  width: 26,
                                  height: 26,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  zIndex: 2
                                }}
                                onPress={() => removePhoto(photo)}
                              >
                                <Text style={{ fontWeight: "bold" }}>X</Text>
                              </Pressable>
                              <Image
                                source={{ uri: photo.uri }}
                                style={{
                                  flex: 1
                                }}
                              />
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                      {/* <Pressable
                        style={styles.button}
                        onPress={uploadNewPhotos}
                      >
                        {isMediaLoading ? (
                          <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                          <Text style={styles.textStyle}>Upload photos</Text>
                        )}
                      </Pressable> */}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={isDiscardChangesModalVisible}
            onRequestClose={() => {
              setIsDiscardChangesModalVisible(false);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Discard all changes?</Text>
                <View style={styles.buttonsWrapper}>
                  <Pressable
                    style={styles.button}
                    onPress={() => {
                      setPhotos([]);
                      setIsDiscardChangesModalVisible(false);
                      setIsModalVisible(false);
                    }}
                  >
                    <Text style={styles.textStyle}>Yes</Text>
                  </Pressable>
                  <Pressable
                    style={styles.button}
                    onPress={() => {
                      setIsDiscardChangesModalVisible(false);
                    }}
                  >
                    <Text style={styles.textStyle}>No</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Pressable
            style={{
              backgroundColor: "#fff",
              borderRadius: 6,
              width: 30,
              height: 30,
              position: "absolute",
              top: 80,
              right: 40,
              justifyContent: "center",
              alignItems: "center"
            }}
            onPress={() => {
              if (photos.length > 0) {
                setIsDiscardChangesModalVisible(true);
              } else {
                setIsModalVisible(false);
              }
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>X</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>

      <View style={styles.wrapper}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.name}>{place?.name}</Text>
          {isContentEditable ? (
            <TextInput
              style={[
                styles.content,
                { borderWidth: 2, fontFamily: "RobotoMono_400Regular" }
              ]}
              onChangeText={setPlaceContent}
              multiline
              value={placeContent}
              placeholder="useless placeholder"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.content}>{place?.content}</Text>
          )}
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
    marginBottom: 20,
    fontFamily: "RobotoMono_700Bold"
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

  modalView: {
    flex: 1
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  buttonsWrapper: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    width: "70%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  }
});

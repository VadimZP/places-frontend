import { useState, useEffect, type SetStateAction } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import MapView, {
  Marker,
  Callout,
  type LongPressEvent
} from "react-native-maps";
import * as Location from "expo-location";
import Toast from "react-native-root-toast";
import { type LocationObject } from "expo-location";
import { AntDesign } from "@expo/vector-icons";

import { type HomeScreenProps, type Place } from "../types";
import { useCreatePlace, useFetchPlaces } from "../hooks/reactQuery";
import Button from "../components/Button";
import Input from "../components/Input";

function ModalStep1({
  setModalStep,
  setIsModalVisible,
  isModalVisible,
  placeName,
  setPlaceName,
  placeContent,
  setPlaceContent,
  placeCoords
}: {
  setModalStep: React.Dispatch<SetStateAction<number>>;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  isModalVisible: boolean;
  placeName: string;
  setPlaceName: React.Dispatch<SetStateAction<string>>;
  placeContent: string;
  setPlaceContent: React.Dispatch<SetStateAction<string>>;
  placeCoords: {
    longitude: number | null;
    latitude: number | null;
  };
}) {
  const mutation = useCreatePlace();

  return (
    <>
      <AntDesign
        onPress={() => {
          setIsModalVisible(false);
          setPlaceName("");
          setPlaceContent("");
        }}
        name="close"
        size={48}
        color="#975FA5"
        style={{ position: "absolute", top: 80, left: 0 }}
      />
      <Text style={styles.modalText}>Name your new place</Text>
      <Input
        label="Name"
        value={placeName}
        onChangeText={setPlaceName}
        wrapperStyles={styles.inputWrapper}
      />
      <Input
        label="Description"
        value={placeContent}
        onChangeText={setPlaceContent}
        wrapperStyles={styles.inputWrapper}
        multiline
        numberOfLines={5}
        textarea
      />
      <View style={styles.buttonsWrapper}>
        <Button
          title="Add to my map"
          width={"100%"}
          onPress={() => {
            if (
              placeCoords.longitude === null ||
              placeCoords.latitude === null
            ) {
              console.error("Something went wrong with latitude and longitude");
              return;
            }
            mutation.mutate(
              {
                name: placeName,
                content: placeContent,
                location: `POINT(${placeCoords.longitude} ${placeCoords.latitude})`
              },
              {
                onSuccess: () => {
                  Toast.show("Your new place was successfully created!", {
                    duration: Toast.durations.SHORT,
                    position: 40
                  });

                  setPlaceName("");
                  setPlaceContent("");

                  setIsModalVisible(false);
                }
              }
            );
          }}
        />
      </View>
    </>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | unknown>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [placeCoords, setPlaceCoords] = useState<{
    longitude: number | null;
    latitude: number | null;
  }>({ longitude: null, latitude: null });
  const [placeName, setPlaceName] = useState("");
  const [placeContent, setPlaceContent] = useState("");
  const { data: placesList } = useFetchPlaces();

  useEffect(() => {
    async function setUserPosition() {
      try {
        setIsMapLoading(true);

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error: unknown) {
        setErrorMsg(error);
      } finally {
        setIsMapLoading(false);
      }
    }

    void setUserPosition();
  }, []);

  function createPlaceHandler(event: LongPressEvent) {
    const { coordinate } = event.nativeEvent;
    setPlaceCoords(coordinate);
    setIsModalVisible(true);
  }

  if (isMapLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading the map...</Text>
      </SafeAreaView>
    );
  }

  if (typeof errorMsg === "string") {
    return (
      <SafeAreaView style={styles.container}>
        <Text>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  if (location === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cannot get information about your location</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
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
            .replace(/POINT\(|\)/g, "")
            .split(" ");

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
                  navigation.navigate("Place", {
                    placeId: place.id
                  });
                }}
              >
                <View>
                  <Text>{place.name}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      <Modal
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
            paddingHorizontal: 40
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView
            style={{
              flex: 1,
              alignContent: "center",
              justifyContent: "center",
              position: "relative"
            }}
          >
            {modalStep === 1 && (
              <ModalStep1
                setModalStep={setModalStep}
                setIsModalVisible={setIsModalVisible}
                isModalVisible={isModalVisible}
                placeName={placeName}
                setPlaceName={setPlaceName}
                placeContent={placeContent}
                setPlaceContent={setPlaceContent}
                placeCoords={placeCoords}
              />
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: "100%",
    height: "100%"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  textWrapper: {
    textAlign: "center"
  },
  buttonsWrapper: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalText: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "500",
    color: "#4B4B4B"
  },
  inputWrapper: {
    marginBottom: 16
  }
});

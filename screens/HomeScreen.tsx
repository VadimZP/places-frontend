import { useState, useEffect, type SetStateAction } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
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

import {
  type HomeScreenNavigationProp,
  type HomeScreenProps,
  type Place
} from "../types";
import { useCreatePlace, useFetchPlaces } from "../hooks/reactQuery";
import Button from "../components/Button";
import Input from "../components/Input";

function ModalStep1({
  setModalStep,
  setIsModalVisible,
  isModalVisible
}: {
  setModalStep: React.Dispatch<SetStateAction<number>>;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  isModalVisible: boolean;
}) {
  return (
    // <View style={styles.modalView}>
    <>
      <Text style={styles.modalText}>Let&apos;s create a new place!</Text>
      <Text style={styles.modalText}>Are you ready?</Text>
      <View style={styles.buttonsWrapper}>
        <Button
          onPress={() => {
            setModalStep(2);
          }}
          title="Yes"
        />
        <Button
          onPress={() => {
            setIsModalVisible(false);
          }}
          title="No"
        />
      </View>
    </>
    // </View>
  );
}

function ModalStep2({
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
    // <View style={styles.modalView}>
    <>
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
          title="Confirm"
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
        <Button
          title="Cancel"
          onPress={() => {
            setModalStep(1);
            setPlaceName("");
            setPlaceContent("");
            setIsModalVisible(false);
          }}
        />
      </View>
    </>
    // </View>
  );
}

function ModalStep3({
  setModalStep,
  setIsModalVisible,
  isModalVisible,
  navigation,
  selectedPlaceId,
  setSelectedPlaceId
}: {
  setModalStep: React.Dispatch<SetStateAction<number>>;
  setIsModalVisible: React.Dispatch<SetStateAction<boolean>>;
  isModalVisible: boolean;
  navigation: HomeScreenNavigationProp;
  selectedPlaceId: number | null;
  setSelectedPlaceId: React.Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <View style={styles.modalView}>
      <Text style={styles.modalText}>
        Want to get a detailed info about this place?
      </Text>
      <View style={styles.buttonsWrapper}>
        <Button
          title="Yes"
          onPress={() => {
            setModalStep(1);
            setIsModalVisible(false);
            if (selectedPlaceId !== null) {
              navigation.navigate("Place", {
                placeId: selectedPlaceId
              });
            }
          }}
        />
        <Button
          title="No"
          onPress={() => {
            setModalStep(1);
            setIsModalVisible(false);
            setSelectedPlaceId(null);
          }}
        />
      </View>
    </View>
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
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
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

  // if (isMapLoading) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <Text>Loading the map...</Text>
  //     </SafeAreaView>
  //   );
  // }

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
                  setIsModalVisible(true);
                  setSelectedPlaceId(place.id);
                  setModalStep(3);
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
            alignContent: "center",
            justifyContent: "center",
            display: "flex",
            backgroundColor: "#F6F6F6"
          }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView>
            {modalStep === 1 && (
              <ModalStep1
                setModalStep={setModalStep}
                setIsModalVisible={setIsModalVisible}
                isModalVisible={isModalVisible}
              />
            )}
            {modalStep === 2 && (
              <ModalStep2
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
            {modalStep === 3 && (
              <ModalStep3
                setModalStep={setModalStep}
                setIsModalVisible={setIsModalVisible}
                isModalVisible={isModalVisible}
                navigation={navigation}
                selectedPlaceId={selectedPlaceId}
                setSelectedPlaceId={setSelectedPlaceId}
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
  modalView: {
    // width: "75%",
    flex: 1,
    backgroundColor: "#F6F6F6",
    borderRadius: 9,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    borderWidth: 2,
    borderColor: "#E3E3E3",
    shadowRadius: 4,
    elevation: 5
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
    marginBottom: 26,
    fontSize: 18,
    fontWeight: "500",
    color: "#4B4B4B"
  },
  inputWrapper: {
    marginBottom: 16
  }
});

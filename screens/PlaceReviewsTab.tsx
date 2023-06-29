import AsyncStorage from '@react-native-async-storage/async-storage'
import { memo, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  View,
  TextInput,
  FlatList
} from 'react-native'
import Toast from 'react-native-root-toast'
import StarRating from 'react-native-star-rating-widget'
import { useCreateReview, useFetchReviews } from '../hooks/reactQuery'
import { DateTime } from 'luxon'

function PlaceReviewsTab ({ placeId }) {
  const { data: reviewsList, isLoading, error } = useFetchReviews()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [reviewContent, setReviewContent] = useState('')

  const [rating, setRating] = useState(0)

  const mutation = useCreateReview()

  function createReview () {
    setIsModalVisible(true)
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <View style={styles.modalView}>
              <Text>Leave your feedback about this place</Text>
              <View style={styles.inputWrapper}>
                {/* <Text style={styles.inputLabel}>Review</Text> */}
                <TextInput
                  style={styles.textarea}
                  multiline
                  numberOfLines={5}
                  value={reviewContent}
                  onChangeText={setReviewContent}
                />
              </View>
              <StarRating
                enableHalfStar={false}
                rating={rating}
                onChange={setRating}
              />

              <Pressable
                style={styles.button}
                onPress={async () => {
                  try {
                    const jsonValue = await AsyncStorage.getAllKeys()
                    const kek = await AsyncStorage.getItem(jsonValue[0])
                    const userId = JSON.parse(kek).user.id

                    mutation.mutate(
                      {
                        content: reviewContent,
                        rating,
                        place_id: placeId,
                        author_id: userId
                      },
                      {
                        onSuccess: () => {
                          Toast.show('Thank you for the review!', {
                            duration: Toast.durations.SHORT,
                            position: 40
                          })

                          setIsModalVisible(!isModalVisible)
                        }
                      }
                    )
                  } catch (e) {
                    // error reading value
                  }
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
        </KeyboardAvoidingView>
      </Modal>
      <Pressable style={styles.button} onPress={createReview}>
        <Text style={styles.textStyle}>Write a review</Text>
      </Pressable>
      {reviewsList?.length
        ? (
        <FlatList
          horizontal
          data={reviewsList}
          renderItem={({ item }) => {
            return (
              <View>
                <Text>{item.content}</Text>
                <StarRating enableHalfStar={false} rating={item.rating} />
                <View style={{ justifyContent: 'space-between' }}>
                  <Text>{item.profiles.email}</Text>
                  <Text>
                    {DateTime.fromISO(item.created_at).toFormat('yyyy LLL dd')}
                  </Text>
                </View>
              </View>
            )
          }}
          keyExtractor={(item) => item.id}
        />
          )
        : null}
    </SafeAreaView>
  )
}

export default memo(PlaceReviewsTab)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff8e7',
    flex: 1
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
  inputWrapper: {
    marginBottom: 16
  },
  inputLabel: {
    marginBottom: 10
  },
  textarea: {
    textAlignVertical: 'top',
    borderWidth: 1,
    padding: 10,
    height: 100
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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import PlaceDetailsTab from './PlaceDetailsTab'
import PlaceReviewsTab from './PlaceReviewsTab'

const Tab = createBottomTabNavigator()

export default function PlaceScreen ({ route }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Details">
        {(props) => (
          <PlaceDetailsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Reviews">
        {(props) => (
          <PlaceReviewsTab {...props} placeId={route.params.placeId} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  )
}

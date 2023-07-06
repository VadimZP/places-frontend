import { Pressable, View, Text, StyleSheet } from "react-native";

interface PopupMenuProps {
  menuItems: Array<{ name: string; onPress: () => unknown }>;
}

export default function PopupMenu({ menuItems }: PopupMenuProps) {
  return (
    <View style={styles.popupMenu}>
      {menuItems.map((item) => (
        <Pressable
          key={item.name}
          style={styles.popupMenuItem}
          onPress={() => item.onPress()}
        >
          <Text style={styles.popupMenuItemText}>{item.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  popupMenu: {
    borderRadius: 6,
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

    backgroundColor: "#fff",

    right: 0,
    position: "absolute",
    zIndex: 10
  },

  popupMenuItem: {
    padding: 12,
    borderColor: "#808080",
    borderBottomWidth: 1
  },

  popupMenuItemText: {
    fontSize: 14,
    color: "#412e00"
  }
});

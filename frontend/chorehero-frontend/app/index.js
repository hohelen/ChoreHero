import { View, Text, StyleSheet, Image, Pressable } from "react-native";

export default function StartScreen() {
  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>ChoreHero</Text>

      {/* Mascot */}
      <Image
        source={require("../assets/images/unnamed (2)-Picsart-BackgroundRemover.jpg")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Text style={styles.tagline}>simplify task management.</Text>

      {/* Sign Up Button */}
      <Pressable style={styles.signupButton}>
        <Text style={styles.signupText}>SIGN UP</Text>
      </Pressable>

      {/* Login Text */}
      <Text style={styles.loginText}>
        ALREADY HAVE AN ACCOUNT?{" "}
        <Text style={styles.loginLink}>LOG IN</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFE7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 24,
    color: "#3D3D3D",
    letterSpacing: 1,
  },

  image: {
    width: 220,
    height: 220,
    marginBottom: 32,
  },

  tagline: {
    fontSize: 16,
    color: "#6B6B6B",
    marginBottom: 40,
  },

  signupButton: {
    width: "100%",
    backgroundColor: "#D8C6B4",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },

  signupText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 1,
  },

  loginText: {
    fontSize: 12,
    color: "#7A7A7A",
  },

  loginLink: {
    fontWeight: "600",
    color: "#3D3D3D",
  },
});

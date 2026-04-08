import React, { type ReactNode, useEffect, useRef, useState } from "react"
import {
     Animated,
     Easing,
     Keyboard,
     Modal,
     Platform,
     Pressable,
     StyleSheet,
     Text,
     View,
} from "react-native"

type ApartmentModalProps = {
     visible: boolean
     title: string
     description?: string
     onClose: () => void
     onAfterClose?: () => void
     children?: ReactNode
     footer?: ReactNode
     disableBackdropClose?: boolean
     liftOnKeyboard?: boolean
     keyboardLiftOffset?: number
     position?: "center" | "bottom"
}

const OPEN_DURATION = 220
const CLOSE_DURATION = 200
const START_TRANSLATE_Y = 20

export default function ApartmentModal({
     visible,
     title,
     description,
     onClose,
     onAfterClose,
     children,
     footer,
     disableBackdropClose = false,
     liftOnKeyboard = false,
     keyboardLiftOffset = 46,
     position = "center",
}: ApartmentModalProps) {
     const [rendered, setRendered] = useState(visible)
     const overlayOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current
     const cardTranslateY = useRef(new Animated.Value(position === "bottom" ? 72 : START_TRANSLATE_Y)).current
     const cardOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current
     const keyboardShift = useRef(new Animated.Value(0)).current

     useEffect(() => {
          if (visible) {
               setRendered(true)
               Animated.parallel([
                    Animated.timing(overlayOpacity, {
                         toValue: 1,
                         duration: OPEN_DURATION,
                         easing: Easing.out(Easing.cubic),
                         useNativeDriver: true,
                    }),
                    Animated.spring(cardTranslateY, {
                         toValue: 0,
                         damping: 16,
                         stiffness: 220,
                         mass: 0.9,
                         useNativeDriver: true,
                    }),
                    Animated.timing(cardOpacity, {
                         toValue: 1,
                         duration: OPEN_DURATION - 20,
                         easing: Easing.out(Easing.cubic),
                         useNativeDriver: true,
                    }),
               ]).start()
               return
          }

          if (!rendered) {
               return
          }

          Animated.parallel([
               Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: CLOSE_DURATION,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
               }),
               Animated.timing(cardTranslateY, {
                    toValue: position === "bottom" ? 72 : START_TRANSLATE_Y,
                    duration: CLOSE_DURATION,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
               }),
               Animated.timing(cardOpacity, {
                    toValue: 0,
                    duration: CLOSE_DURATION - 30,
                    easing: Easing.inOut(Easing.cubic),
                    useNativeDriver: true,
               }),
          ]).start(({ finished }) => {
               if (finished) {
                    setRendered(false)
                    onAfterClose?.()
               }
          })
     }, [cardOpacity, cardTranslateY, onAfterClose, overlayOpacity, position, rendered, visible])

     useEffect(() => {
          if (!liftOnKeyboard) {
               keyboardShift.setValue(0)
               return
          }

          const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
          const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

          const showSub = Keyboard.addListener(showEvent, () => {
               Animated.timing(keyboardShift, {
                    toValue: -keyboardLiftOffset,
                    duration: 180,
                    useNativeDriver: true,
               }).start()
          })

          const hideSub = Keyboard.addListener(hideEvent, () => {
               Animated.timing(keyboardShift, {
                    toValue: 0,
                    duration: 160,
                    useNativeDriver: true,
               }).start()
          })

          return () => {
               showSub.remove()
               hideSub.remove()
          }
     }, [keyboardLiftOffset, keyboardShift, liftOnKeyboard])

     if (!rendered) {
          return null
     }

     return (
          <Modal transparent visible animationType="none" onRequestClose={onClose}>
               <View style={styles.root}>
                    <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlayOpacity }]} />

                    <Pressable
                         style={styles.backdropPressable}
                         onPress={() => {
                              if (!disableBackdropClose) {
                                   onClose()
                              }
                         }}
                    />

                    <Animated.View
                         style={[
                              styles.card,
                              position === "bottom" ? styles.cardBottom : styles.cardCenter,
                              {
                                   opacity: cardOpacity,
                                   transform: [{ translateY: cardTranslateY }, { translateY: keyboardShift }],
                              },
                         ]}
                    >
                         <Text style={styles.title}>{title}</Text>
                         {description ? <Text style={styles.description}>{description}</Text> : null}

                         {children ? <View style={styles.body}>{children}</View> : null}
                         {footer ? <View style={styles.footer}>{footer}</View> : null}
                    </Animated.View>
               </View>
          </Modal>
     )
}

const styles = StyleSheet.create({
     root: {
          flex: 1,
          paddingHorizontal: 18,
          paddingVertical: 14,
     },
     overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(15,23,42,0.45)",
          zIndex: 1,
     },
     backdropPressable: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 2,
     },
     card: {
          width: "100%",
          maxWidth: 380,
          borderRadius: 18,
          backgroundColor: "#ffffff",
          padding: 18,
          zIndex: 3,
          elevation: 8,
          shadowColor: "#0f172a",
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: {
               width: 0,
               height: 8,
          },
     },
     cardCenter: {
          alignSelf: "center",
          marginTop: "auto",
          marginBottom: "auto",
     },
     cardBottom: {
          alignSelf: "center",
          marginTop: "auto",
          marginBottom: 6,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
     },
     title: {
          fontSize: 20,
          fontWeight: "700",
          color: "#111827",
     },
     description: {
          marginTop: 6,
          fontSize: 13,
          color: "#64748b",
     },
     body: {
          marginTop: 14,
          gap: 10,
     },
     footer: {
          marginTop: 16,
          flexDirection: "row",
          justifyContent: "flex-end",
          gap: 8,
     },
})

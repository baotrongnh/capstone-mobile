import { Colors, InputField, PageTitle } from '@/components/styles'
import { useGoogleLogin, useLogin } from '@/hooks/query/useAuth'
import { LoginDTO } from '@/types/auth'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import React from 'react'
import {
     Alert,
     Image,
     Keyboard,
     KeyboardAvoidingView,
     Platform,
     ScrollView,
     StyleSheet,
     Text,
     TouchableOpacity,
     TouchableWithoutFeedback,
     View,
} from 'react-native'

const NETWORK_ERROR_MESSAGE = 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^(\+84|0)\d{9,10}$/

const isRecord = (value: unknown): value is Record<string, unknown> => {
     return typeof value === 'object' && value !== null
}

const getFriendlyAuthErrorMessage = (error: unknown, isGoogleLogin = false): string => {
     const defaultMessage = isGoogleLogin
          ? 'Đăng nhập Google không thành công. Vui lòng thử lại.'
          : 'Đăng nhập không thành công. Vui lòng thử lại.'

     if (!isRecord(error)) {
          return defaultMessage
     }

     const response = isRecord(error.response) ? error.response : null
     const status = typeof response?.status === 'number' ? response.status : undefined

     if (!response) {
          return NETWORK_ERROR_MESSAGE
     }

     if (status === 401) {
          return isGoogleLogin
               ? 'Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.'
               : 'Email/số điện thoại hoặc mật khẩu chưa đúng.'
     }

     if (status && status >= 500) {
          return 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.'
     }

     const responseData = isRecord(response.data) ? response.data : null
     const rawMessage = responseData?.message

     if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
          return rawMessage
     }

     if (Array.isArray(rawMessage)) {
          const firstMessage = rawMessage.find((item) => typeof item === 'string' && item.trim().length > 0)
          if (firstMessage) {
               return firstMessage
          }
     }

     const errorMessage = typeof error.message === 'string' ? error.message : ''
     if (
          errorMessage.includes('Network Error') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('Request failed with status code')
     ) {
          return status === 401
               ? (isGoogleLogin
                    ? 'Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.'
                    : 'Email/số điện thoại hoặc mật khẩu chưa đúng.')
               : defaultMessage
     }

     return defaultMessage
}

const validateLoginInput = (identifier: string, password: string): string | null => {
     if (!identifier) {
          return 'Vui lòng nhập email hoặc số điện thoại.'
     }

     if (!EMAIL_REGEX.test(identifier) && !PHONE_REGEX.test(identifier)) {
          return 'Email hoặc số điện thoại chưa đúng định dạng.'
     }

     if (!password) {
          return 'Vui lòng nhập mật khẩu.'
     }

     if (password.length < 6) {
          return 'Mật khẩu cần có ít nhất 6 ký tự.'
     }

     return null
}

export default function LoginScreen() {
     const loginMutation = useLogin()
     const googleLogin = useGoogleLogin()
     const router = useRouter()
     const [showPassword, setShowPassword] = React.useState(false)
     const scrollRef = React.useRef<ScrollView>(null)
     const [identifierY, setIdentifierY] = React.useState(0)
     const [passwordY, setPasswordY] = React.useState(0)

     const scrollToInput = (inputY: number) => {
          if (Platform.OS !== 'android') return

          requestAnimationFrame(() => {
               scrollRef.current?.scrollTo({
                    y: Math.max(0, inputY - 120),
                    animated: true,
               })
          })
     }

     const handleGoogleLogin = async () => {
          try {
               const isSuccess = await googleLogin.login()
               if (isSuccess) {
                    router.replace('/(tabs)/home')
               }
          } catch (error) {
               Alert.alert('Đăng nhập Google thất bại', getFriendlyAuthErrorMessage(error, true))
          }
     }

     return (
          <View style={loginStyles.page}>
               <Image
                    source={require('../assets/images/login-frame.png')}
                    style={loginStyles.loginHeader}
                    resizeMode='cover'
               />
               <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={loginStyles.keyboardContainer}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 24}
               >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                         <ScrollView
                              ref={scrollRef}
                              style={loginStyles.scrollView}
                              contentContainerStyle={loginStyles.contentWrapper}
                              keyboardShouldPersistTaps='handled'
                              keyboardDismissMode='on-drag'
                              showsVerticalScrollIndicator={false}
                              bounces={false}
                         >
                              <View style={loginStyles.animatedContent}>
                                   <View style={loginStyles.logoBlock}>
                                        <Image
                                             source={require('../assets/images/app-logo.png')}
                                             style={loginStyles.pageLogo}
                                             resizeMode='cover'
                                        />
                                        <PageTitle style={loginStyles.pageTitle}>Chào mừng trở lại!</PageTitle>
                                   </View>

                                   <Formik<LoginDTO>
                                        initialValues={{ identifier: '', password: '' }}
                                        onSubmit={async (values) => {
                                             const normalizedIdentifier = values.identifier.trim()
                                             const normalizedPassword = values.password.trim()
                                             const validationMessage = validateLoginInput(normalizedIdentifier, normalizedPassword)

                                             if (validationMessage) {
                                                  Alert.alert('Thông tin chưa hợp lệ', validationMessage)
                                                  return
                                             }

                                             try {
                                                  await loginMutation.mutateAsync({
                                                       identifier: normalizedIdentifier,
                                                       password: normalizedPassword,
                                                  })
                                                  router.replace('/(tabs)/home')
                                             } catch (error) {
                                                  Alert.alert('Đăng nhập thất bại', getFriendlyAuthErrorMessage(error))
                                             }
                                        }}
                                   >
                                        {({ handleChange, handleBlur, handleSubmit, values }) => (
                                             <View style={loginStyles.inputForm}>
                                                  <InputField
                                                       onLayout={(event) => setIdentifierY(event.nativeEvent.layout.y)}
                                                       onFocus={() => scrollToInput(identifierY)}
                                                       onChangeText={handleChange('identifier')}
                                                       onBlur={handleBlur('identifier')}
                                                       value={values.identifier}
                                                       placeholder="Nhập email hoặc số điện thoại"
                                                       editable={!loginMutation.isPending}
                                                  />

                                                  <View
                                                       style={loginStyles.passwordFieldContainer}
                                                       onLayout={(event) => setPasswordY(event.nativeEvent.layout.y)}
                                                  >
                                                       <InputField
                                                            onFocus={() => scrollToInput(passwordY)}
                                                            onChangeText={handleChange('password')}
                                                            onBlur={handleBlur('password')}
                                                            value={values.password}
                                                            placeholder="Nhập mật khẩu"
                                                            secureTextEntry={!showPassword}
                                                            editable={!loginMutation.isPending}
                                                            style={loginStyles.passwordInput}
                                                       />
                                                       <TouchableOpacity
                                                            onPress={() => setShowPassword((prev) => !prev)}
                                                            style={loginStyles.passwordToggleButton}
                                                            disabled={loginMutation.isPending}
                                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                       >
                                                            <Ionicons
                                                                 name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                                 size={22}
                                                                 color={Colors.muted}
                                                            />
                                                       </TouchableOpacity>
                                                  </View>

                                                  <TouchableOpacity
                                                       onPress={() => handleSubmit()}
                                                       style={[
                                                            loginStyles.loginButton,
                                                            loginMutation.isPending && loginStyles.loginButtonDisabled,
                                                       ]}
                                                       disabled={loginMutation.isPending || googleLogin.loading}
                                                  >
                                                       <Text style={loginStyles.buttonText}>
                                                            {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                                       </Text>
                                                  </TouchableOpacity>

                                                  <View style={loginStyles.dividerRow}>
                                                       <View style={loginStyles.dividerLine} />
                                                       <Text style={loginStyles.dividerText}>HOẶC</Text>
                                                       <View style={loginStyles.dividerLine} />
                                                  </View>

                                                  <TouchableOpacity
                                                       onPress={handleGoogleLogin}
                                                       style={[
                                                            loginStyles.googleLoginButton,
                                                            googleLogin.loading && loginStyles.loginButtonDisabled,
                                                       ]}
                                                       disabled={googleLogin.loading || loginMutation.isPending}
                                                  >
                                                       <Image
                                                            source={require('../assets/images/google-logo.png')}
                                                            style={loginStyles.googleIcon}
                                                            resizeMode='contain'
                                                       />
                                                       <Text style={loginStyles.googleButtonText}>
                                                            {googleLogin.loading ? 'Đang đăng nhập Google...' : 'Đăng nhập với Google'}
                                                       </Text>
                                                  </TouchableOpacity>
                                             </View>
                                        )}
                                   </Formik>
                              </View>
                         </ScrollView>
                    </TouchableWithoutFeedback>
               </KeyboardAvoidingView>
          </View>
     )
}

const loginStyles = StyleSheet.create({
     page: {
          flex: 1,
          backgroundColor: '#ffffff'
     },
     keyboardContainer: {
          flex: 1
     },
     scrollView: {
          flex: 1,
          zIndex: 2,
     },
     loginHeader: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 220,
          zIndex: 1,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
     },
     logoView: {
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center'
     },
     brandName: {
          fontSize: 20,
          padding: 10
     },
     pageLogo: {
          width: 230,
          height: 100
     },
     pageTitle: {
          fontSize: 20,
          paddingLeft: 0,
          paddingBottom: 8,
          textAlign: 'center'
     },
     subTitle: {
          textAlign: 'center',
          fontSize: 14,
          padding: 0,
     },
     contentWrapper: {
          flexGrow: 1,
          justifyContent: 'flex-start',
          paddingHorizontal: 25,
          paddingTop: 170,
          paddingBottom: 32,
     },
     animatedContent: {
          flex: 1,
     },
     logoBlock: {
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 100,
          marginBottom: 24,
     },
     inputForm: {
          marginTop: 20,
          flexDirection: 'column',
          gap: 16,
     },
     passwordFieldContainer: {
          position: 'relative'
     },
     passwordInput: {
          paddingRight: 50
     },
     passwordToggleButton: {
          position: 'absolute',
          right: 16,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center'
     },
     loginButton: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 8,
          backgroundColor: `${Colors.primary}`,
          padding: 16,
          borderRadius: 12
     },
     loginButtonDisabled: {
          opacity: 0.7
     },
     buttonText: {
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          letterSpacing: 0.25
     },
     dividerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 12,
     },
     dividerLine: {
          flex: 1,
          height: 1,
          backgroundColor: `${Colors.muted}`
     },
     dividerText: {
          marginHorizontal: 12,
          color: `${Colors.muted}`,
          fontSize: 12,
          fontWeight: '600'
     },
     googleLoginButton: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: 6,
          backgroundColor: `${Colors.backgroundSecondary}`,
          borderRadius: 12,
          padding: 16,
          gap: 60,
     },
     googleIcon: {
          width: 24,
          height: 24
     },
     googleButtonText: {
          fontSize: 16,
          fontWeight: 'semibold',
          letterSpacing: 0.25,
          color: '#26225F'
     }
})
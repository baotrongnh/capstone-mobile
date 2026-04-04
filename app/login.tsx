import { Colors, InputField, PageTitle } from '@/components/styles'
import { useGoogleLogin, useLogin } from '@/hooks/query/useAuth'
import { LoginDTO } from '@/types/auth'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Formik } from 'formik'
import React from 'react'
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function LoginScreen() {
     const loginMutation = useLogin()
     const googleLogin = useGoogleLogin()
     const router = useRouter()
     const [showPassword, setShowPassword] = React.useState(false)
     const [keyboardVisible, setKeyboardVisible] = React.useState(false)

     React.useEffect(() => {
          const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true))
          const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false))

          return () => {
               show.remove()
               hide.remove()
          }
     }, [])

     const handleGoogleLogin = async () => {
          try {
               await googleLogin.login()
               router.replace('/(tabs)/home')
          } catch {
               Alert.alert('Đăng nhập Google thất bại')
          }
     }

     return (
          <View style={loginStyles.page}>
               {!keyboardVisible && (
                    <Image
                         source={require('../assets/images/login-frame.png')}
                         style={loginStyles.loginHeader}
                         resizeMode='cover'
                    />
               )}
               <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={loginStyles.keyboardContainer}
               >
                    <View style={[loginStyles.contentWrapper, keyboardVisible && loginStyles.contentWrapperKeyboard]}>
                         <View style={[loginStyles.logoBlock, keyboardVisible && loginStyles.logoBlockKeyboard]}>
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
                                   try {
                                        await loginMutation.mutateAsync({
                                             identifier: values.identifier.trim(),
                                             password: values.password,
                                        })
                                        router.replace('/(tabs)/home')
                                   } catch {
                                        Alert.alert('Đăng nhập thất bại')
                                   }
                              }}
                         >
                              {({ handleChange, handleBlur, handleSubmit, values }) => (
                                   <View style={loginStyles.inputForm}>
                                        <InputField
                                             onChangeText={handleChange('identifier')}
                                             onBlur={handleBlur('identifier')}
                                             value={values.identifier}
                                             placeholder="Nhập email hoặc số điện thoại"
                                             editable={!loginMutation.isPending}
                                        />

                                        <View style={loginStyles.passwordFieldContainer}>
                                             <InputField
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
                                                  loginMutation.isPending && loginStyles.loginButtonDisabled
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
                                                  googleLogin.loading && loginStyles.loginButtonDisabled
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
     loginHeader: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 200,
          zIndex: 1,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36
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
          flex: 1,
          justifyContent: 'flex-end',
          zIndex: 2,
          paddingHorizontal: 25,
          paddingTop: 180,
          paddingBottom: 24
     },
     contentWrapperKeyboard: {
          paddingTop: 40
     },
     logoBlock: {
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30
     },
     logoBlockKeyboard: {
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 0
     },
     inputForm: {
          marginTop: 24,
          flexDirection: 'column',
          gap: 16
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
          marginTop: 16
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
          marginTop: 8,
          backgroundColor: `${Colors.backgroundSecondary}`,
          borderRadius: 12,
          padding: 16,
          gap: 60
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
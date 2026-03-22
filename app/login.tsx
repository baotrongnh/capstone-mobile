import { Colors, InputField, PageTitle, StyledContainer } from '@/components/styles'
import { useLogin } from '@/hooks/query/useAuth'
import { LoginDTO } from '@/types/auth'
import { Formik } from 'formik'
import React from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function LoginScreen() {
     const loginMutation = useLogin()

     return (
          <KeyboardAvoidingView
               style={{ flex: 1, backgroundColor: '#ffffff' }}
               behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
               <Image
                    source={require('../assets/images/login-frame.png')}
                    style={loginStyles.loginHeader}
                    resizeMode='cover'
               />
               <StyledContainer>
                    <View style={{ zIndex: 2 }}>
                         <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                                        console.log('OK', values)
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

                                        <InputField
                                             onChangeText={handleChange('password')}
                                             onBlur={handleBlur('password')}
                                             value={values.password}
                                             placeholder="Nhập mật khẩu"
                                             secureTextEntry
                                             editable={!loginMutation.isPending}
                                        />

                                        <TouchableOpacity
                                             onPress={() => handleSubmit()}
                                             style={[
                                                  loginStyles.loginButton,
                                                  loginMutation.isPending && loginStyles.loginButtonDisabled
                                             ]}
                                             disabled={loginMutation.isPending}
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

                                        <TouchableOpacity onPress={() => handleSubmit()} style={loginStyles.googleLoginButton}>
                                             <Image
                                                  source={require('../assets/images/google-logo.png')}
                                                  style={loginStyles.googleIcon}
                                                  resizeMode='contain'
                                             />
                                             <Text style={loginStyles.googleButtonText}>Đăng nhập với Google</Text>
                                        </TouchableOpacity>
                                   </View>
                              )}
                         </Formik>
                    </View>
               </StyledContainer>
          </KeyboardAvoidingView>
     )
}

const loginStyles = StyleSheet.create({
     loginHeader: {
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
     inputForm: {
          marginTop: 24,
          flexDirection: 'column',
          gap: 16
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
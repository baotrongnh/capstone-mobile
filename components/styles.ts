import { styled } from 'styled-components/native'
import Constants from 'expo-constants'

const StatusBarHeight = Constants.statusBarHeight

export const Colors = {
    primary: '#3b82f6',
    secondary: '#a3d5ff',
    muted: '#778088',
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#F8F8F8',
    foreground: '#0f172a'
}

export const StyledContainer = styled.View`
    flex: 1;
    padding: 15px;
    padding-top: ${StatusBarHeight + 10}px;
    background-color: ${Colors.backgroundPrimary};
    justify-content: flex-start
`

export const InnerContainer = styled.View`
    flex: 1;
    width: 100%;
    align-items: center;
`
export const PageLogo = styled.Image`
    width: 250px;
    height: 200px;
`
export const PageTitle = styled.Text`
    font-size: 25px;
    font-weight: bold;
    padding: 10px;
`
export const SubTitle = styled.Text`
    font-size: 18px;
    font-weight: bold
    color: ${Colors.muted}
`
export const InputField = styled.TextInput`
    background-color: #F8F8F8;
    height: 54px;
    padding: 15px 16px;
    fontSize: 16px;
    borderRadius: 12px;
`
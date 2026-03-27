import { styled } from "styled-components/native";
import Constants from "expo-constants";

const StatusBarHeight = Constants.statusBarHeight;

export const Container = styled.View`
  flex: 1;
  background-color: #ffffff;
  padding-top: ${StatusBarHeight}px;
`;

export const ScrollContainer = styled.ScrollView`
  flex: 1;
`;

export const ProfileHeaderStyled = styled.View`
  align-items: center;
  padding: 30px 20px;
  background-color: #ffffff;
`;

export const Avatar = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #f3f4f6;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  border: 2px solid #d1d5db;
`;

export const AvatarImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 50px;
`;

export const UserName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #0f172a;
  margin-bottom: 5px;
`;

export const UserEmail = styled.Text`
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
`;

export const MenuContainer = styled.View`
  padding: 0px 20px;
  background-color: #ffffff;
`;

export const MenuItem = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

export const MenuLeft = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

export const MenuIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  background-color: #f3f4f6;
`;

export const MenuText = styled.Text`
  font-size: 16px;
  color: #0f172a;
  font-weight: 500;
`;

export const MenuArrow = styled.View`
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
`;

export const TextInputField = styled.TextInput`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  height: 48px;
  padding: 12px 16px;
  font-size: 16px;
  border-radius: 8px;
  color: #1f2937;
`;

export const HeaderBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-vertical: 15px;
`;

export const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #0f172a;
`;

export const BackButton = styled.Pressable`
  margin-right: 15px;
`;

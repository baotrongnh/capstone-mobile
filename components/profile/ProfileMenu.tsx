import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  MenuContainer,
  MenuItem,
  MenuLeft,
  MenuIcon,
  MenuText,
  MenuArrow,
} from "./styles";

interface MenuItemData {
  id: string;
  label: string;
  icon: string;
  color: string;
  screen: string;
}

interface ProfileMenuProps {
  items: MenuItemData[];
  onMenuPress: (screen: string) => void;
}

export default function ProfileMenu({ items, onMenuPress }: ProfileMenuProps) {
  return (
    <MenuContainer>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          onPress={() => onMenuPress(item.screen)}
          android_ripple={{ color: "#f0f0f0" }}
        >
          <MenuLeft>
            <MenuIcon style={{ backgroundColor: item.color + "20" }}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </MenuIcon>
            <MenuText>{item.label}</MenuText>
          </MenuLeft>
          <MenuArrow>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </MenuArrow>
        </MenuItem>
      ))}
    </MenuContainer>
  );
}

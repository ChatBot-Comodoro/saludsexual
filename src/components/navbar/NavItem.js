import { NavLink } from '@mantine/core';
import NavItemHeader from './NavItemHeader';

const NavItem = props => {
  const { label, icon:Icon, link, children } = props.item;
  if (children.length > 0) {
    return <NavItemHeader item={props.item} />;
  }

  return (
    <NavLink 
      href={link} 
      label={label} 
      leftSection={<Icon className="sideBarMenu_navIcon" />} 
      className="sideBarMenu_navItem"
    />
  );
};

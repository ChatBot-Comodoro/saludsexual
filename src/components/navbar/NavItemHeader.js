import React, { useState } from "react";
import {
  IconChevronDown, IconCornerDownRight
} from '@tabler/icons-react';
import { usePathname } from 'next/navigation';
import { NavLink, Badge, ColorSwatch, Group, Text, Tooltip } from '@mantine/core';

//const resolveLinkPath = (childTo, parentTo) => `${parentTo}/${childTo}`;
const NavItemHeader = props => {
  const { item } = props;
  const { label, icon:Icon, link: headerToPath, children, isSubmenu, test } = item;
  //const location = useLocation();
  const location = usePathname();

  const padd = test??0;

  const [expanded, setExpand] = useState(
    location.includes(headerToPath)
  );

  const onExpandChange = e => {
    e.preventDefault();
    setExpand(expanded => !expanded);
  };
	
  return (
    <>
    <NavLink 
      href={item.link} 
      label={label}
      leftSection={<Icon className="sideBarMenu_navIcon" />} 
      className={`sideBarMenu_navItem  ${expanded && "sideBarMenu_navItemExpandedHeader"} ${isSubmenu && "sideBarMenu_navItemExpanded"}  `} 
      onClick={onExpandChange}
      defaultOpened={expanded}
      childrenOffset={0} 
    >
      
          <div className="sideBarMenu_navSubItem">
          {
                children.map((item, index) => {
                  const key = `${item.id}-${index}`;
                  const { label, icon:Icon, children } = item;
                  const ppp = padd + 10;
                  if(location==item.link){console.log(item.id)}
                  if (children.length > 0) {
                    return (
                      <NavItemHeader key={item.id} item={{...item, link:item.link, isSubmenu:true, test:ppp }}/>
                    )
                  }
                  return (
                    <NavLink 
                      key={key}
                      href={item.link} 
                      label={<><Tooltip position="right" label={label}><Text truncate="end">{label}x</Text></Tooltip></>} 
                      leftSection={<><IconCornerDownRight className="sideBarMenu_navIconx" /><Icon className="sideBarMenu_navIcon" /></>} 
                      className={`sideBarMenu_navItem   ${location==item.link && "sideBarMenu_navItemActivo"} ${expanded && "sideBarMenu_navItemExpanded "}`} 
                    />
                  )
                })
          }
          </div>
        
</NavLink>
    </>
  );
};

export default NavItemHeader;
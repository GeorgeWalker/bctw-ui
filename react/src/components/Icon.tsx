import React from 'react';
import Add from '@material-ui/icons/Add';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import HomeIcon from '@material-ui/icons/Home';
import Remove from '@material-ui/icons/Remove';
import Grain from '@material-ui/icons/Grain';
import Terrain from '@material-ui/icons/Terrain'
import Dashboard from '@material-ui/icons/Dashboard';
import Pets from '@material-ui/icons/Pets'
import GpsFixed from '@material-ui/icons/GpsFixed';

const mappings: any = {
  data: <Dashboard />,
  map: <Grain />,
  terrain: <Terrain />,
  home: <HomeIcon />,
  remove: <Remove />,
  plus: <Add />,
  critter: <Pets/>,
  collar: <GpsFixed/>,
  'arrow-up': <ArrowUpward />,
  'arrow-down': <ArrowDownward />
};

type IconProps = {
  icon: string;
};

export default function Icon ({icon}: IconProps) {
  return mappings[icon];
};
import React from 'react';
import clientContainer from "./di/clientContainer";
const ContainerContext = React.createContext<typeof clientContainer>({} as any);
export default ContainerContext;
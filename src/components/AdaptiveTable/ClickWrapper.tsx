import React, { ReactElement } from 'react';

interface IClickWrapperProps {
    children: ReactElement | ReactElement[];
    onClickFunc: any;
}
function ClickWrapper(props: IClickWrapperProps) {
    const { children, onClickFunc } = props;
    
    return (
        <React.Fragment>
            {React.Children.map(children, child => {
                if (child) {
                    return (
                        React.cloneElement(child, {
                            onClick: onClickFunc,
                        })
                    );                        
                }
            }
            )}
        </React.Fragment>
    );
}

export default ClickWrapper;

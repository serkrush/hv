import React from 'react';
import has from "lodash/has";
import get from "lodash/get";
import { connect } from 'react-redux';
import Preloader from 'src/components/FaIcons/preloader';

interface IHOCProps {
    requestResult: Map<string, any>;
}

export const withRequestResult = <P extends any>(WrappedComponent: React.ComponentType<P>, options = {} as any) => {

    class WithRequestHOC extends React.Component<P & IHOCProps> {

        private checkFetch = () => {
            let fetching = false;
            if ('entityName' in options) {
                const result = this.props.requestResult &&
                    has(this.props.requestResult, options['entityName']) &&
                    get(this.props.requestResult, options['entityName']);
                if (result && has(result, 'fetching')) {
                    fetching = get(result, 'fetching');
                }
            } else if ('pager' in options) {
                fetching = options['pager'] && has(options['pager'], 'fetching') && get(options['pager'], 'fetching');
            }
            return fetching;
        };

        public render() {
            return (
                <div className='relative'>
                    <Preloader
                        wrapperClassName='w-full h-full'
                        active={this.checkFetch()}
                        color='#6b7280'
                        parentBackGroundShadow={true}
                        size='48px' />
                    {/* @ts-ignore */}
                    <WrappedComponent {...this.props} />
                </div>
            );
        }
    }

    const mapStateToProps = (state: any) => {
        const { requestResult } = state;
        return { requestResult };
    };
    // @ts-ignore
    return connect(mapStateToProps, {})(WithRequestHOC);
};

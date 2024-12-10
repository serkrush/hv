import {connect} from 'react-redux';
import {Flag} from '@/src/constants';
import LoadingOverlay from './loaderOverlay';

const mapStateToProps = state => {
    let spinnerActive = false;
    if (state && state.flagger) {
        spinnerActive = !!state.flagger[Flag.SPINER];
    }
    return {spinnerActive};
};
function SpinnerLayout({children, spinnerActive}) {
    return (
        <>
            <LoadingOverlay active={spinnerActive} />
            {children}
        </>
    );
}

export default connect(mapStateToProps, {}, (state, dispatch, ownProps) => {
    return {...state, ...ownProps};
})(SpinnerLayout);

import React from 'react';

import { Button, Modal } from '@deriv/components';
import { redirectToLogin, redirectToSignUp } from '@deriv/shared';
import { localize } from '@deriv/translations';

type TAuthorizationRequiredModal = {
    is_visible: boolean;
    toggleModal: () => void;
    is_appstore?: boolean;
    is_logged_in: boolean;
};

const AuthorizationRequiredModal = ({ is_visible, toggleModal }: TAuthorizationRequiredModal) => (
    <Modal
        id='dt_authorization_required_modal'
        is_open={is_visible}
        small
        toggleModal={toggleModal}
        title={localize('Start trading with us')}
    >
        <Modal.Body>{localize('Log in or create a free account to place a trade.')}</Modal.Body>
        <Modal.Footer>
            <Button has_effect text={localize('Log in')} onClick={() => redirectToLogin()} secondary />
            <Button has_effect text={localize('Create free account')} onClick={() => redirectToSignUp()} primary />
        </Modal.Footer>
    </Modal>
);

export default AuthorizationRequiredModal;

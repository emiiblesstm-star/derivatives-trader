import React from 'react';

import { Text } from '@deriv/components';
import { formatDuration, getDateFromNow, getDiffDuration } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv/translations';

import Fieldset from 'App/Components/Form/fieldset';
import { useTraderStore } from 'Stores/useTraderStores';

type TExpirationProps = {
    is_text_only?: boolean;
    text_size?: string;
};

const Expiration = observer(({ is_text_only, text_size }: TExpirationProps) => {
    const { expiration } = useTraderStore();
    const { common } = useStore();
    const { server_time: start_time } = common;
    const { days, timestamp } = formatDuration(
        getDiffDuration(Number(start_time?.unix()), Number(expiration)),
        'HH:mm'
    );
    const date = getDateFromNow(days, 'day', 'DD MMM YYYY');

    if (is_text_only) {
        return (
            <React.Fragment>
                {expiration ? (
                    <Text size={text_size} align='center'>
                        {date} at {timestamp}
                    </Text>
                ) : (
                    '-'
                )}
            </React.Fragment>
        );
    }

    return (
        <Fieldset
            className='trade-container__fieldset trade-container__fieldset__multiplier'
            is_center
            header={<Localize i18n_default_text='Expires on' />}
            header_tooltip={
                expiration ? (
                    <Localize
                        i18n_default_text='Your contract will be closed automatically at the next available asset price on {{date}} at {{timestamp}}.'
                        values={{ date, timestamp }}
                    />
                ) : null
            }
        >
            <div className='trade-container__fieldset-expiration'>
                {expiration ? (
                    <Text size='xs' align='center'>
                        {date} at {timestamp}
                    </Text>
                ) : (
                    '-'
                )}
            </div>
        </Fieldset>
    );
});

export default Expiration;

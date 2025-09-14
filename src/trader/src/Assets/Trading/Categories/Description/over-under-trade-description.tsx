import React from 'react';

import { Text } from '@deriv/components';
import { Localize } from '@deriv/translations';

const OverUnderTradeDescription = () => {
    const content = [
        <Localize
            i18n_default_text='If you select "Over", you will win the payout if the last digit of the last tick is greater than your prediction.'
            key='1'
        />,
        <Localize
            i18n_default_text='If you select "Under", you will win the payout if the last digit of the last tick is less than your prediction.'
            key='2'
        />,
    ];
    return (
        <React.Fragment>
            {content.map(paragraph => (
                <Text as='p' key={paragraph.props.i18n_default_text}>
                    {paragraph}
                </Text>
            ))}
        </React.Fragment>
    );
};

export default OverUnderTradeDescription;

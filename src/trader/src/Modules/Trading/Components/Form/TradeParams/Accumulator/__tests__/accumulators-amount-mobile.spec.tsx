import React from 'react';

import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { render, screen } from '@testing-library/react';

import TraderProviders from '../../../../../../../trader-providers';
import AccumulatorsAmountMobile from '../accumulators-amount-mobile';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    isMobile: jest.fn(() => true),
}));

describe('<AccumulatorsAmountMobile />', () => {
    let mock_store: ReturnType<typeof mockStore>;
    beforeEach(() => {
        mock_store = {
            ...mockStore({
                modules: {
                    trade: {
                        currency: 'USD',
                    },
                },
            }),
        };
    });

    const mockAccumulatorsAmountMobile = (mocked_store: TCoreStores) => {
        return (
            <TraderProviders store={mocked_store}>
                <AccumulatorsAmountMobile />
            </TraderProviders>
        );
    };

    it('should render child <LabeledQuantityInputMobile /> component', () => {
        render(mockAccumulatorsAmountMobile(mock_store));

        expect(screen.getByText(/Stake/i)).toBeInTheDocument();
    });
    it('should render child <LabeledQuantityInputMobile /> component with inline prefix if is_single_currency is true', () => {
        mock_store.client.is_single_currency = true;
        render(mockAccumulatorsAmountMobile(mock_store));

        expect(screen.getByText(/Stake/i)).toBeInTheDocument();
        expect(screen.getByText(/USD/i)).toBeInTheDocument();
    });
});
